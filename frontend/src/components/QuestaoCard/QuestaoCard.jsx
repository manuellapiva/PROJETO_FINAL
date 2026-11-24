import { useState } from 'react';
import styles from '../../pages/Questoes/Questoes.module.css';
import API_URL from '../../services/api';

const ALTERNATIVAS = ['a', 'b', 'c', 'd', 'e'];

function extrairLetra(texto) {
  const resultado = String(texto || '').trim().match(/^([A-E])\s*[).:-]/i);
  return resultado ? resultado[1].toLowerCase() : null;
}

export default function QuestaoCard({ questao }) {
  const [selecionada, setSelecionada] = useState('');
  const [resposta, setResposta] = useState(null);
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function conferirResposta() {
    if (mostrarResposta) {
      setMostrarResposta(false);
      return;
    }
    if (!selecionada) {
      setErro('Selecione uma alternativa antes de conferir.');
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/questoes/${questao.idq}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.mensagem || 'Não foi possível carregar a correção.');
      }
      setResposta(data);
      setMostrarResposta(true);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar a resposta.');
    } finally {
      setCarregando(false);
    }
  }

  const letraCorreta = extrairLetra(resposta?.resp_correta);
  const acertou = letraCorreta && selecionada === letraCorreta;

  return (
    <article className={styles.questaoBox}>
      <div className={styles.tags}>
        <span>{questao.sigla}</span>
        <span>{questao.ano}</span>
        <span>{questao.topico}</span>
        <span>{questao.materia}</span>
        <span>{questao.dificuldade}</span>
      </div>

      <div className={styles.questaoCard}>
        <div className={styles.enunciado}>{questao.enunciado}</div>

        {questao.imagem_url && (
          <div className={styles.imagemQuestao}>
            <img
              src={
                questao.imagem_url.startsWith("./")
                  ? questao.imagem_url.replace("./", "/")
                  : questao.imagem_url.startsWith("/")
                    ? `${API_URL}${questao.imagem_url}`
                    : questao.imagem_url
              }
              alt="Imagem de apoio da questão"
              loading="lazy"
            />
          </div>
        )}

        <div className={styles.alternativas} role="group" aria-label="Alternativas da questão">
          {ALTERNATIVAS.map((letra) => {
            const texto = questao[`alt_${letra}`];
            if (!texto) return null;

            let classe = styles.alternativa;
            if (selecionada === letra) classe += ` ${styles.alternativaSelecionada || ''}`;
            if (mostrarResposta && letra === letraCorreta) {
              classe += ` ${styles.alternativaCorreta || ''}`;
            } else if (mostrarResposta && letra === selecionada && !acertou) {
              classe += ` ${styles.alternativaIncorreta || ''}`;
            }