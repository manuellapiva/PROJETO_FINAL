const QuestoesModel = require('../models/questoesModel');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function validarId(valor) {
  const id = Number.parseInt(valor, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validarDadosQuestao(dados = {}) {
  const obrigatorios = [
    'idvest',
    'idtopico',
    'graudif',
    'enunciado',
    'alt_a',
    'alt_b',
    'alt_c',
    'alt_d',
    'resp_correta'
  ];

  const camposPreenchidos = obrigatorios.every((campo) => {
    const valor = dados[campo];

    return (
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ''
    );
  });

  if (!camposPreenchidos) return false;

  const camposNumericos = ['idvest', 'idtopico', 'graudif'];

  return camposNumericos.every((campo) => {
    const valor = Number(dados[campo]);
    return Number.isInteger(valor) && valor > 0;
  });
}

// Cria o cliente somente quando uma operação com imagens for necessária.
function obterSupabase() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chave) {
    throw new Error(
      'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no backend.'
    );
  }

  return createClient(url, chave);
}

function obterBucket() {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!bucket) {
    throw new Error('Configure SUPABASE_STORAGE_BUCKET no backend.');
  }

  return bucket;
}

// Envia a imagem para o Supabase Storage.
async function enviarImagem(arquivo) {
  if (!arquivo || !arquivo.buffer) {
    throw new Error('Arquivo de imagem inválido.');
  }

  const supabase = obterSupabase();
  const bucket = obterBucket();

  const extensoes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
  };

  const extensao =
    extensoes[arquivo.mimetype] ||
    path.extname(arquivo.originalname).toLowerCase();

  const nomeArquivo = `questao-${crypto.randomUUID()}${extensao}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(nomeArquivo, arquivo.buffer, {
      contentType: arquivo.mimetype,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Erro no Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(nomeArquivo);

  if (!data || !data.publicUrl) {
    await removerImagemStorage(nomeArquivo);
    throw new Error('Não foi possível obter a URL pública da imagem.');
  }

  return {
    url: data.publicUrl,
    caminho: nomeArquivo
  };
}

// Remove um arquivo do Supabase Storage pelo caminho.
async function removerImagemStorage(caminho) {
  if (!caminho) return;

  try {
    const supabase = obterSupabase();
    const bucket = obterBucket();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([caminho]);

    if (error) {
      console.error(
        'Erro ao remover imagem do Supabase:',
        error.message
      );
    }
  } catch (error) {
    console.error(
      'Erro ao acessar o Supabase para remover imagem:',
      error.message
    );
  }
}

// Identifica se a URL pertence ao bucket deste projeto.
function obterCaminhoImagemStorage(imagemUrl) {
  if (!imagemUrl) return null;

  try {
    const url = new URL(imagemUrl);
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!supabaseUrl) return null;

    const origemSupabase = new URL(supabaseUrl).origin;

    if (url.origin !== origemSupabase) return null;

    const bucket = obterBucket();
    const marcador = `/storage/v1/object/public/${bucket}/`;

    const indice = url.pathname.indexOf(marcador);

    if (indice === -1) return null;

    return decodeURIComponent(
      url.pathname.slice(indice + marcador.length)
    );
  } catch {
    return null;
  }
}

// Remove imagens antigas do Supabase ou arquivos locais legados.
async function removerImagemAntiga(imagemUrl) {
  if (!imagemUrl) return;

  const caminhoStorage = obterCaminhoImagemStorage(imagemUrl);

  if (caminhoStorage) {
    await removerImagemStorage(caminhoStorage);
    return;
  }

  // Compatibilidade com imagens antigas salvas em /uploads/.
  if (imagemUrl.startsWith('/uploads/')) {
    const nomeArquivo = path.basename(imagemUrl);

    const caminho = path.join(
      __dirname,
      '../../uploads',
      nomeArquivo
    );

    try {
      await fs.promises.unlink(caminho);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(
          'Erro ao remover imagem local antiga:',
          error.message
        );
      }
    }
  }
}

async function listarTodos(req, res) {
  try {
    const questoes = await QuestoesModel.listarTodos();

    return res.status(200).json(questoes);
  } catch (error) {
    console.error('Erro ao listar questões:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao listar questões.'
    });
  }
}

async function buscarPorId(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: 'ID inválido.'
    });
  }

  try {
    const questao = await QuestoesModel.buscarPorId(id);

    if (!questao) {
      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    return res.status(200).json(questao);
  } catch (error) {
    console.error('Erro ao buscar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao buscar questão.'
    });
  }
}

async function criar(req, res) {
  if (!validarDadosQuestao(req.body)) {
    return res.status(400).json({
      mensagem: 'Preencha todos os campos obrigatórios corretamente.'
    });
  }

  let imagemEnviada = null;

  try {
    const dados = { ...req.body };

    if (req.file) {
      imagemEnviada = await enviarImagem(req.file);
      dados.imagem_url = imagemEnviada.url;
    } else {
      dados.imagem_url = dados.imagem_url?.trim() || null;
    }

    const questao = await QuestoesModel.criar(dados);

    return res.status(201).json({
      mensagem: 'Questão cadastrada com sucesso!',
      questao
    });
  } catch (error) {
    if (imagemEnviada) {
      await removerImagemStorage(imagemEnviada.caminho);
    }

    console.error('Erro ao criar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar questão.'
    });
  }
}

async function atualizar(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: 'ID inválido.'
    });
  }

  if (!validarDadosQuestao(req.body)) {
    return res.status(400).json({
      mensagem: 'Preencha todos os campos obrigatórios corretamente.'
    });
  }

  let imagemEnviada = null;

  try {
    const questaoAtual = await QuestoesModel.buscarPorId(id);

    if (!questaoAtual) {
      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    const dados = { ...req.body };

    if (req.file) {
      imagemEnviada = await enviarImagem(req.file);
      dados.imagem_url = imagemEnviada.url;
    } else if (dados.remover_imagem === 'true') {
      dados.imagem_url = null;
    } else if (dados.imagem_url?.trim()) {
      dados.imagem_url = dados.imagem_url.trim();
    } else {
      dados.imagem_url = questaoAtual.imagem_url || null;
    }

    const questao = await QuestoesModel.atualizar(id, dados);

    if (!questao) {
      if (imagemEnviada) {
        await removerImagemStorage(imagemEnviada.caminho);
      }

      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    // Só remove a imagem anterior depois de atualizar o banco.
    if (
      questaoAtual.imagem_url &&
      questaoAtual.imagem_url !== dados.imagem_url
    ) {
      await removerImagemAntiga(questaoAtual.imagem_url);
    }

    return res.status(200).json({
      mensagem: 'Questão atualizada com sucesso!',
      questao
    });
  } catch (error) {
    if (imagemEnviada) {
      await removerImagemStorage(imagemEnviada.caminho);
    }

    console.error('Erro ao atualizar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao atualizar questão.'
    });
  }
}

async function deletar(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: 'ID inválido.'
    });
  }

  try {
    const questao = await QuestoesModel.buscarPorId(id);

    if (!questao) {
      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    const deletado = await QuestoesModel.deletar(id);

    if (!deletado) {
      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    await removerImagemAntiga(questao.imagem_url);

    return res.status(200).json({
      mensagem: `Questão ${id} removida com sucesso.`
    });
  } catch (error) {
    console.error('Erro ao deletar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao deletar questão.'
    });
  }
}

async function filtrar(req, res) {
  try {
    const questoes = await QuestoesModel.filtrar({
      vestibular: req.query.vestibular,
      materia: req.query.materia,
      topico: req.query.topico
    });

    return res.status(200).json(questoes);
  } catch (error) {
    console.error('Erro ao filtrar questões:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao filtrar questões.'
    });
  }
}

module.exports = {
  listarTodos,
  buscarPorId,
  filtrar,
  criar,
  atualizar,
  deletar
};
