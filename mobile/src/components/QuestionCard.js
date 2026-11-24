import React, { useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../styles/theme';
import { getImageUrl } from '../services/api';

const OPTIONS = ['a', 'b', 'c', 'd', 'e'];

function getCorrectLetter(answer) {
  const match = String(answer || '').trim().match(/^([A-E])\s*[).:\-]/i);
  return match ? match[1].toLowerCase() : null;
}

export default function QuestionCard({ question, onCheckAnswer }) {
  const [selected, setSelected] = useState('');
  const [answerData, setAnswerData] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  const correctLetter = getCorrectLetter(answerData?.resp_correta);
  const acertou = Boolean(correctLetter && selected === correctLetter);
  const imageUrl = getImageUrl(question.imagem_url);

  async function toggleAnswer() {
    if (showAnswer) {
      setShowAnswer(false);
      return;
    }

    if (!selected) {
      setError('Selecione uma alternativa antes de conferir.');
      return;
    }

    if (answerData) {
      setShowAnswer(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await onCheckAnswer(question.idq);
      const details = data?.questao || data?.questoes || data?.dados || data;
      setAnswerData(details || {});
      setShowAnswer(true);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar a correção.');
    } finally {
      setLoading(false);
    }
  }

  async function openLink(url) {
    if (!url) return;
    try {
      await Linking.openURL(url.trim());
    } catch {
      setError('Não foi possível abrir este link.');
    }
  }

  const tags = [
    question.sigla,
    question.ano,
    question.topico,
    question.materia,
    question.dificuldade,
  ].filter(Boolean);

  return (
    <View style={styles.outer}>
      <View style={styles.tags}>
        {tags.map((tag, index) => (
          <Text key={`${tag}-${index}`} style={styles.tag}>{String(tag)}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.statement}>
          {question.enunciado || 'Enunciado não disponível.'}
        </Text>

        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : null}

        {imageError ? (
          <Text style={styles.imageError}>Não foi possível carregar a imagem de apoio.</Text>
        ) : null}

        <View style={styles.options}>
          {OPTIONS.map((letter) => {
            const value = question[`alt_${letter}`];
            if (!value) return null;

            const isSelected = selected === letter;
            const isCorrect = showAnswer && letter === correctLetter;
            const isWrong = showAnswer && isSelected && !acertou;

            return (
              <TouchableOpacity
                key={letter}
                activeOpacity={0.85}
                disabled={showAnswer}
                onPress={() => {
                  setSelected(letter);
                  setError('');
                }}
                style={[
                  styles.option,
                  isSelected && styles.selected,
                  isCorrect && styles.correct,
                  isWrong && styles.incorrect,
                ]}
              >
                <Text style={styles.optionText}>{value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.answerButton, loading && styles.disabled]}
          onPress={toggleAnswer}
          disabled={loading}
        >
          <Text style={styles.answerButtonText}>
            {loading ? 'CORRIGINDO...' : showAnswer ? 'OCULTAR CORREÇÃO' : 'CONFERIR RESPOSTA'}
          </Text>
        </TouchableOpacity>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {showAnswer && answerData ? (
          <View style={styles.answerBox}>
            <Text style={styles.answerTitle}>
              {acertou ? 'Muito bem! Você acertou.' : 'Vamos revisar esta questão.'}
            </Text>
            <Text style={styles.answerText}>
              Gabarito: {answerData.resp_correta || 'Não informado'}
            </Text>
            {!correctLetter ? (
              <Text style={styles.answerText}>
                Não foi possível identificar automaticamente a letra do gabarito.
              </Text>
            ) : null}
            <View style={styles.separator} />
            <Text style={styles.answerText}>
              {answerData.explicacao_prof || 'Não há explicação cadastrada para esta questão.'}
            </Text>

            <View style={styles.links}>
              <View style={styles.linkCard}>
                <Text style={styles.linkTitle}>VIDEOAULA</Text>
                {answerData.videoaula ? (
                  <TouchableOpacity onPress={() => openLink(answerData.videoaula)}>
                    <Text style={styles.linkText}>Assistir videoaula</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.unavailable}>Videoaula não disponível.</Text>
                )}
              </View>
              <View style={styles.linkCard}>
                <Text style={styles.linkTitle}>CONTAS</Text>
                {answerData.contas_url ? (
                  <TouchableOpacity onPress={() => openLink(answerData.contas_url)}>
                    <Text style={styles.linkText}>Ver contas</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.unavailable}>Contas não disponíveis.</Text>
                )}
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 12,
    marginBottom: 24,
  },
  tags: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: colors.lilac,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: radius.pill,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: colors.lilac,
    borderRadius: 16,
    padding: 14,
  },
  statement: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 18,
  },
  image: {
    width: '100%',
    height: 230,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 18,
  },
  imageError: {
    color: '#fff',
    marginBottom: 15,
  },
  options: {
    gap: 10,
  },
  option: {
    minHeight: 54,
    backgroundColor: '#d8d8d8',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 13,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: '#fff',
    borderColor: colors.primary,
  },
  correct: {
    backgroundColor: colors.successBackground,
    borderColor: colors.success,
  },
  incorrect: {
    backgroundColor: colors.dangerBackground,
    borderColor: colors.danger,
  },
  optionText: {
    color: '#24142a',
    fontSize: 14,
    lineHeight: 21,
  },
  answerButton: {
    alignSelf: 'center',
    width: '100%',
    marginTop: 22,
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  answerButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  disabled: { opacity: 0.6 },
  error: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 12,
  },
  answerBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#7b2cbf',
    borderRadius: 12,
  },
  answerTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 19,
    marginBottom: 12,
  },
  answerText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 7,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginVertical: 10,
  },
  links: {
    gap: 10,
    marginTop: 12,
  },
  linkCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    padding: 13,
  },
  linkTitle: {
    color: '#1f2937',
    fontWeight: '800',
    marginBottom: 7,
  },
  linkText: {
    color: '#7b2cbf',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  unavailable: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
