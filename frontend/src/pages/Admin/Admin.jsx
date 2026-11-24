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