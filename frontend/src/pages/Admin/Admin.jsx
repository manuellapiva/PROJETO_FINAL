import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import API_URL from "../../services/api";
import styles from "./Admin.module.css";

const FORMULARIO_INICIAL = {
  idvest: "",
  id_materia: "",
  idtopico: "",
  graudif: "",
  ano: "",
  enunciado: "",
  alt_a: "",
  alt_b: "",
  alt_c: "",
  alt_d: "",
  alt_e: "",
  resp_correta: "",
  explicacao_prof: "",
  contas_url: "",
  videoaula: "",
  imagem_url: "",
  remover_imagem: false
};

async function obterErro(response) {
  const dados = await response.json().catch(() => ({}));
  return dados.mensagem || "Não foi possível concluir a operação.";
}

export default function Admin() {
  const [questoes, setQuestoes] = useState([]);
  const [vestibulares, setVestibulares] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [dificuldades, setDificuldades] = useState([]);

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [imagem, setImagem] = useState(null);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const token = localStorage.getItem("jwtToken");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const topicosFiltrados = useMemo(() => {
    if (!formulario.id_materia) return [];

    return topicos.filter(
      (topico) =>
        String(topico.id_materia) === String(formulario.id_materia)
    );
  }, [topicos, formulario.id_materia]);

  const questoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return questoes;

    return questoes.filter((questao) => {
      const conteudo = [
        questao.idq,
        questao.enunciado,
        questao.vestibular,
        questao.sigla,
        questao.materia,
        questao.topico,
        questao.ano
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return conteudo.includes(termo);
    });
  }, [questoes, busca]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const endpoints = [
        `${API_URL}/questoes`,
        `${API_URL}/vestibulares`,
        `${API_URL}/materia`,
        `${API_URL}/topico`,
        `${API_URL}/dificuldade`
      ];

      const respostas = await Promise.all(
        endpoints.map((url) =>
          fetch(url, { headers })
        )
      );

      const respostaComErro = respostas.find((response) => !response.ok);

      if (respostaComErro) {
        throw new Error(await obterErro(respostaComErro));
      }

      const [
        questoesData,
        vestibularesData,
        materiasData,
        topicosData,
        dificuldadesData
      ] = await Promise.all(
        respostas.map((response) => response.json())
      );

      setQuestoes(questoesData);
      setVestibulares(vestibularesData);
      setMaterias(materiasData);
      setTopicos(topicosData);
      setDificuldades(dificuldadesData);
    } catch (error) {
      console.error("Erro ao carregar painel:", error);
      setErro(error.message || "Erro ao carregar os dados do painel.");
    } finally {
      setCarregando(false);
    }
  }

  function atualizarCampo(event) {
    const { name, value, type, checked } = event.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function alterarMateria(event) {
    const idMateria = event.target.value;

    setFormulario((atual) => ({
      ...atual,
      id_materia: idMateria,
      idtopico: ""
    }));
  }

  function limparFormulario() {
    setFormulario(FORMULARIO_INICIAL);
    setImagem(null);
    setEditando(null);

    const campoArquivo = document.getElementById("imagem");
    if (campoArquivo) campoArquivo.value = "";
  }

  async function prepararEdicao(id) {
    try {
      setErro("");
      setMensagem("");

      const response = await fetch(`${API_URL}/questoes/${id}`, {
        headers
      });

      if (!response.ok) {
        throw new Error(await obterErro(response));
      }

      const questao = await response.json();

      const topicoAtual = topicos.find(
        (topico) => String(topico.id_top) === String(questao.idtopico)
      );

      setFormulario({
        idvest: String(questao.idvest || ""),
        id_materia: String(topicoAtual?.id_materia || ""),
        idtopico: String(questao.idtopico || ""),
        graudif: String(questao.graudif || ""),
        ano: questao.ano || "",
        enunciado: questao.enunciado || "",
        alt_a: questao.alt_a || "",
        alt_b: questao.alt_b || "",
        alt_c: questao.alt_c || "",
        alt_d: questao.alt_d || "",
        alt_e: questao.alt_e || "",
        resp_correta: questao.resp_correta || "",
        explicacao_prof: questao.explicacao_prof || "",
        contas_url: questao.contas_url || "",
        videoaula: questao.videoaula || "",
        imagem_url: questao.imagem_url || "",
        remover_imagem: false
      });

      setImagem(null);
      setEditando(id);

      const campoArquivo = document.getElementById("imagem");
      if (campoArquivo) campoArquivo.value = "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erro ao carregar questão:", error);
      setErro(error.message || "Não foi possível carregar a questão.");
    }
  }

  async function salvarQuestao(event) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    if (!formulario.idvest || !formulario.id_materia ||
        !formulario.idtopico || !formulario.graudif) {
      setErro("Selecione o vestibular, a matéria, o tópico e a dificuldade.");
      return;
    }

    if (!formulario.resp_correta.trim()) {
      setErro("Informe a resposta correta.");
      return;
    }

    const dados = new FormData();

    const campos = [
      "idvest",
      "idtopico",
      "graudif",
      "ano",
      "enunciado",
      "alt_a",
      "alt_b",
      "alt_c",
      "alt_d",
      "alt_e",
      "resp_correta",
      "explicacao_prof",
      "contas_url",
      "videoaula",
      "imagem_url"
    ];

    campos.forEach((campo) => {
      dados.append(campo, formulario[campo] ?? "");
    });

    dados.append(
      "remover_imagem",
      formulario.remover_imagem ? "true" : "false"
    );

    if (imagem) {
      dados.append("imagem", imagem);
    }

    try {
      setSalvando(true);

      const url = editando
        ? `${API_URL}/questoes/${editando}`
        : `${API_URL}/questoes`;

      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers,
        body: dados
      });

      if (!response.ok) {
        throw new Error(await obterErro(response));
      }

      const resultado = await response.json();

      setMensagem(
        resultado.mensagem ||
        (editando
          ? "Questão atualizada com sucesso!"
          : "Questão cadastrada com sucesso!")
      );

      limparFormulario();
      await carregarDados();
    } catch (error) {
      console.error("Erro ao salvar questão:", error);
      setErro(error.message || "Não foi possível salvar a questão.");
    } finally {
      setSalvando(false);
    }
  }
  
  async function excluirQuestao(id) {
    const confirmar = window.confirm(
      `Tem certeza de que deseja excluir a questão ${id}? Essa ação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      const response = await fetch(`${API_URL}/questoes/${id}`, {
        method: "DELETE",
        headers
      });

      if (!response.ok) {
        throw new Error(await obterErro(response));
      }

      const resultado = await response.json();

      setMensagem(resultado.mensagem || "Questão excluída com sucesso!");

      if (String(editando) === String(id)) {
        limparFormulario();
      }

      await carregarDados();
    } catch (error) {
      console.error("Erro ao excluir questão:", error);
      setErro(error.message || "Não foi possível excluir a questão.");
    }
  }

  return (
    <>
      <Header />

      <main className={styles.admin}>
        <section className={styles.cabecalho}>
          <div>
            <span className={styles.subtitulo}>ÁREA RESTRITA</span>
            <h1>Painel administrativo</h1>
            <p>Gerencie as questões disponíveis no BuscFísica.</p>
          </div>

          <div className={styles.resumo}>
            <span>QUESTÕES CADASTRADAS</span>
            <strong>{questoes.length}</strong>
          </div>
        </section>

        {erro && (
          <div className={styles.alertaErro} role="alert">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className={styles.alertaSucesso} role="status">
            {mensagem}
          </div>
        )}

        <section className={styles.formularioContainer}>
          <div className={styles.tituloSecao}>
            <div>
              <span className={styles.subtitulo}>
                {editando ? "EDIÇÃO" : "NOVO CADASTRO"}
              </span>
              <h2>{editando ? `Editar questão #${editando}` : "Cadastrar questão"}</h2>
            </div>

            {editando && (
              <button
                type="button"
                className={styles.botaoCancelar}
                onClick={limparFormulario}
              >
                Cancelar edição
              </button>
            )}
          </div>

          <form onSubmit={salvarQuestao}>
            <div className={styles.gradeCampos}>
              <div className={styles.campo}>
                <label htmlFor="idvest">Vestibular *</label>
                <select
                  id="idvest"
                  name="idvest"
                  value={formulario.idvest}
                  onChange={atualizarCampo}
                  required
                >
                  <option value="">Selecione</option>
                  {vestibulares.map((vestibular) => (
                    <option key={vestibular.id} value={vestibular.id}>
                      {vestibular.nome} ({vestibular.sigla})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label htmlFor="id_materia">Matéria *</label>
                <select
                  id="id_materia"
                  name="id_materia"
                  value={formulario.id_materia}
                  onChange={alterarMateria}
                  required
                >
                  <option value="">Selecione</option>
                  {materias.map((materia) => (
                    <option key={materia.id_mat} value={materia.id_mat}>
                      {materia.nome_mat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label htmlFor="idtopico">Tópico *</label>
                <select
                  id="idtopico"
                  name="idtopico"
                  value={formulario.idtopico}
                  onChange={atualizarCampo}
                  required
                  disabled={!formulario.id_materia}
                >
                  <option value="">Selecione</option>
                  {topicosFiltrados.map((topico) => (
                    <option key={topico.id_top} value={topico.id_top}>
                      {topico.nome_top}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label htmlFor="graudif">Dificuldade *</label>
                <select
                  id="graudif"
                  name="graudif"
                  value={formulario.graudif}
                  onChange={atualizarCampo}
                  required
                >
                  <option value="">Selecione</option>
                  {dificuldades.map((dificuldade) => (
                    <option key={dificuldade.id_d} value={dificuldade.id_d}>
                      {dificuldade.grau}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  name="ano"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formulario.ano}
                  onChange={atualizarCampo}
                  placeholder="Ex.: 2025"
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label htmlFor="enunciado">Enunciado *</label>
              <textarea
                id="enunciado"
                name="enunciado"
                value={formulario.enunciado}
                onChange={atualizarCampo}
                placeholder="Digite o enunciado completo da questão..."
                rows={5}
                required
              />
            </div>

            <div className={styles.alternativasContainer}>
              <h3>Alternativas</h3>

              {["a", "b", "c", "d", "e"].map((letra) => (
                <div className={styles.campo} key={letra}>
                  <label htmlFor={`alt_${letra}`}>
                    Alternativa {letra.toUpperCase()}
                    {letra !== "e" ? " *" : ""}
                  </label>
                  <textarea
                    id={`alt_${letra}`}
                    name={`alt_${letra}`}
                    value={formulario[`alt_${letra}`]}
                    onChange={atualizarCampo}
                    rows={2}
                    required={letra !== "e"}
                    placeholder={`Digite a alternativa ${letra.toUpperCase()}...`}
                  />
                </div>
              ))}
            </div>

            <div className={styles.campo}>
              <label htmlFor="resp_correta">Resposta correta *</label>
              <input
                id="resp_correta"
                name="resp_correta"
                value={formulario.resp_correta}
                onChange={atualizarCampo}
                placeholder="Ex.: A) 25 m/s"
                required
              />
              <small>
                Informe a letra e o conteúdo da alternativa correta.
              </small>
            </div>

            <div className={styles.campo}>
              <label htmlFor="explicacao_prof">Explicação do professor</label>
              <textarea
                id="explicacao_prof"
                name="explicacao_prof"
                value={formulario.explicacao_prof}
                onChange={atualizarCampo}
                rows={4}
                placeholder="Explique a resolução da questão..."
              />
            </div>

            <div className={styles.gradeCampos}>
              <div className={styles.campo}>
                <label htmlFor="contas_url">Link dos cálculos</label>
                <input
                  id="contas_url"
                  name="contas_url"
                  type="url"
                  value={formulario.contas_url}
                  onChange={atualizarCampo}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="videoaula">Link da videoaula</label>
                <input
                  id="videoaula"
                  name="videoaula"
                  type="url"
                  value={formulario.videoaula}
                  onChange={atualizarCampo}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label htmlFor="imagem">Imagem da questão</label>
              <input
                id="imagem"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setImagem(event.target.files?.[0] || null);
                  setFormulario((atual) => ({
                    ...atual,
                    remover_imagem: false
                  }));
                }}
              />
              <small>Formatos aceitos: JPG, PNG e WEBP. Limite: 5 MB.</small>
            </div>

            {formulario.imagem_url && !formulario.remover_imagem && (
              <div className={styles.imagemAtual}>
                <span>Imagem atualmente cadastrada:</span>
                <p>{formulario.imagem_url}</p>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="remover_imagem"
                    checked={formulario.remover_imagem}
                    onChange={atualizarCampo}
                  />
                  Remover imagem atual
                </label>
              </div>
            )}

            <div className={styles.acoesFormulario}>
              <button
                type="submit"
                className={styles.botaoSalvar}
                disabled={salvando}
              >
                {salvando
                  ? "SALVANDO..."
                  : editando
                    ? "SALVAR ALTERAÇÕES"
                    : "CADASTRAR QUESTÃO"}
              </button>

              <button
                type="button"
                className={styles.botaoLimpar}
                onClick={limparFormulario}
                disabled={salvando}
              >
                LIMPAR CAMPOS
              </button>
            </div>
          </form>
        </section>

        <section className={styles.listaContainer}>
          <div className={styles.tituloSecao}>
            <div>
              <span className={styles.subtitulo}>GERENCIAMENTO</span>
              <h2>Questões cadastradas</h2>
            </div>
          </div>

          <div className={styles.busca}>
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por enunciado, vestibular, matéria ou ID..."
            />
            <span>{questoesFiltradas.length} resultado(s)</span>
          </div>

          {carregando ? (
            <p className={styles.estado}>Carregando questões...</p>
          ) : questoesFiltradas.length === 0 ? (
            <p className={styles.estado}>Nenhuma questão encontrada.</p>
          ) : (
            <div className={styles.listaQuestoes}>
              {questoesFiltradas.map((questao) => (
                <article className={styles.questaoItem} key={questao.idq}>
                  <div className={styles.questaoInfo}>
                    <span className={styles.idQuestao}>
                      QUESTÃO #{questao.idq}
                    </span>

                    <h3>
                      {questao.enunciado?.length > 180
                        ? `${questao.enunciado.slice(0, 180)}...`
                        : questao.enunciado}
                    </h3>

                    <div className={styles.tags}>
                      <span>{questao.sigla || questao.vestibular}</span>
                      <span>{questao.materia}</span>
                      <span>{questao.topico}</span>
                      <span>{questao.dificuldade}</span>
                      {questao.ano && <span>{questao.ano}</span>}
                    </div>
                  </div>

                  <div className={styles.acoesQuestao}>
                    <button
                      type="button"
                      className={styles.botaoEditar}
                      onClick={() => prepararEdicao(questao.idq)}
                    >
                      EDITAR
                    </button>

                    <button
                      type="button"
                      className={styles.botaoExcluir}
                      onClick={() => excluirQuestao(questao.idq)}
                    >
                      EXCLUIR
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
