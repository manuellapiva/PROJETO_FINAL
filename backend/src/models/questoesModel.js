const pool = require('../config/database');

const CAMPOS_LISTAGEM = `
  idq, vestibular, sigla, topico, materia, dificuldade, ano,
  enunciado, alt_a, alt_b, alt_c, alt_d, alt_e, imagem_url
`;

async function listarTodos() {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_LISTAGEM} FROM vw_questoes ORDER BY idq`
  );
  return rows;
}

async function buscarPorId(id) {
  const sql = `
    SELECT
      q.idq,
      q.idvest,
      q.idtopico,
      q.graudif,
      v.nome AS vestibular,
      v.sigla,
      t.nome_top AS topico,
      m.nome_mat AS materia,
      d.grau AS dificuldade,
      q.ano,
      q.enunciado,
      q.alt_a,
      q.alt_b,
      q.alt_c,
      q.alt_d,
      q.alt_e,
      q.imagem_url,
      r.resp_correta,
      r.explicacao_prof,
      r.contas_url,
      r.videoaula
    FROM questoes q
    INNER JOIN vestibulares v ON v.id = q.idvest
    INNER JOIN topico t ON t.id_top = q.idtopico
    INNER JOIN materia m ON m.id_mat = t.id_materia
    INNER JOIN dificuldade d ON d.id_d = q.graudif
    INNER JOIN resposta r ON r.id_resp = q.idresp
    WHERE q.idq = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
}

async function criar(dados) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Primeiro, cadastra a resposta e obtém seu ID.
    const resposta = await client.query(
      `INSERT INTO resposta (
        resp_correta,
        explicacao_prof,
        contas_url,
        videoaula
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id_resp`,
      [
        dados.resp_correta,
        dados.explicacao_prof || null,
        dados.contas_url || null,
        dados.videoaula || null
      ]
    );

    const idresp = resposta.rows[0].id_resp;

    // Depois, cadastra a questão vinculada à resposta.
    const questao = await client.query(
      `INSERT INTO questoes (
        idvest, idresp, idtopico, graudif, ano,
        enunciado, alt_a, alt_b, alt_c, alt_d,
        alt_e, imagem_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        dados.idvest,
        idresp,
        dados.idtopico,
        dados.graudif,
        dados.ano || null,
        dados.enunciado,
        dados.alt_a,
        dados.alt_b,
        dados.alt_c,
        dados.alt_d,
        dados.alt_e || null,
        dados.imagem_url || null
      ]
    );

    await client.query('COMMIT');
    return questao.rows[0];

  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;

  } finally {
    client.release();
  }
}

async function atualizar(id, dados) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Descobre qual resposta está vinculada à questão.
    const resultado = await client.query(
      'SELECT idresp FROM questoes WHERE idq = $1',
      [id]
    );

    if (resultado.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const idresp = resultado.rows[0].idresp;

    // Atualiza a resposta existente.
    await client.query(
      `UPDATE resposta
       SET resp_correta = $1,
           explicacao_prof = $2,
           contas_url = $3,
           videoaula = $4
       WHERE id_resp = $5`,
      [
        dados.resp_correta,
        dados.explicacao_prof || null,
        dados.contas_url || null,
        dados.videoaula || null,
        idresp
      ]
    );

    // Atualiza os dados da questão.
    const questao = await client.query(
      `UPDATE questoes
       SET idvest = $1,
           idtopico = $2,
           graudif = $3,
           ano = $4,
           enunciado = $5,
           alt_a = $6,
           alt_b = $7,
           alt_c = $8,
           alt_d = $9,
           alt_e = $10,
           imagem_url = $11
       WHERE idq = $12
       RETURNING *`,
      [
        dados.idvest,
        dados.idtopico,
        dados.graudif,
        dados.ano || null,
        dados.enunciado,
        dados.alt_a,
        dados.alt_b,
        dados.alt_c,
        dados.alt_d,
        dados.alt_e || null,
        dados.imagem_url || null,
        id
      ]
    );

    await client.query('COMMIT');
    return questao.rows[0];

  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;

  } finally {
    client.release();
  }
}

async function deletar(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM questoes WHERE idq = $1',
    [id]
  );
  return rowCount > 0;
}

async function filtrar({ vestibular, materia, topico }) {
  const conditions = [];
  const values = [];

  if (vestibular) {
    values.push(`%${vestibular}%`);
    conditions.push(`sigla ILIKE $${values.length}`);
  }
  if (materia) {
    values.push(`%${materia}%`);
    conditions.push(`materia ILIKE $${values.length}`);
  }
  if (topico) {
    values.push(`%${topico}%`);
    conditions.push(`topico ILIKE $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT ${CAMPOS_LISTAGEM}
    FROM vw_questoes
    ${where}
    ORDER BY idq
  `;
  const { rows } = await pool.query(sql, values);
  return rows;
}

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  filtrar,
  atualizar,
  deletar,
};
