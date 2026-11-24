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

            
            return (
              <button
                key={letra}
                type="button"
                className={classe}
                onClick={() => {
                  if (!mostrarResposta) {
                    setSelecionada(letra);
                    setErro('');
                  }
                }}
                disabled={mostrarResposta}
                aria-pressed={selecionada === letra}
              >
                {texto}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.btnResposta}
          onClick={conferirResposta}
          disabled={carregando}
        >
          {carregando
            ? 'CORRIGINDO...'
            : mostrarResposta ? 'OCULTAR CORREÇÃO' : 'CONFERIR RESPOSTA'}
        </button>

        {erro && <p className={styles.erroQuestao} role="alert">{erro}</p>}

        {mostrarResposta && resposta && (
          <section className={styles.caixaResposta} aria-live="polite">
            <div className={styles.respostaConteudo}>
              <h3>{acertou ? 'Muito bem! Você acertou.' : 'Vamos revisar esta questão.'}</h3>
              <p><strong>Gabarito:</strong> {resposta.resp_correta}</p>
              {!letraCorreta && (
                <p>Não foi possível identificar automaticamente a letra do gabarito. Confira o texto acima.</p>
              )}
              <hr />
              <p>{resposta.explicacao_prof || 'Não há explicação cadastrada para esta questão.'}</p>

              <div className={styles.divLinks}>
                {resposta.videoaula ? (
                  <div className={styles.videoaulaBox}>
                    <p className={styles.videoaulaTitulo}>Videoaula</p>
                    <a
                      href={resposta.videoaula.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.videoaulaLink}
                    >
                      Assistir videoaula
                    </a>
                  </div>
                ) : (
                  <div className={styles.videoaulaBox}>
                    <p className={styles.videoaulaIndisponivel}>Videoaula não disponível para esta questão.</p>
                  </div>
                )}
                {resposta.contas_url ? (
                  <div className={styles.videoaulaBox}>
                    <p className={styles.videoaulaTitulo}>Contas</p>
                    <a
                      href={resposta.contas_url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.videoaulaLink}
                    >
                      Ver Contas
                    </a>
                  </div>
                ) : (
                  <div className={styles.videoaulaBox}>
                    <p className={styles.videoaulaIndisponivel}>Contas não disponíveis para esta questão.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
