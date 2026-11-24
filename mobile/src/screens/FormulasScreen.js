import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Footer from '../components/Footer';
import { colors, radius } from '../styles/theme';

const groups = [
  {
    title: 'MECÂNICA',
    formulas: [
      ['VELOCIDADE MÉDIA', 'Vm = ΔS / Δt'],
      ['MRU', 'S = S₀ + V·T'],
      ['TORRICELLI', 'v² = v₀² + 2·a·Δs'],
    ],
  },
  {
    title: 'TERMOLOGIA',
    formulas: [
      ['CALOR SENSÍVEL', 'Q = m·c·Δt'],
      ['CALOR LATENTE', 'Q = m·L'],
      ['1ª LEI DA TERMODINÂMICA', 'Q = τ + ΔU'],
    ],
  },
  {
    title: 'ONDULATÓRIA',
    formulas: [
      ['FREQUÊNCIA', 'f = 1/T'],
      ['LEI DE SNELL', 'n₁sen(θ₁)=n₂sen(θ₂)'],
      ['EQ. DE GAUSS', "1/f = 1/p + 1/p'"],
    ],
  },
  {
    title: 'ELETRICIDADE',
    formulas: [
      ['LEI DE COULOMB', 'F = k·q₁·q₂ / d²'],
      ['CORRENTE ELÉTRICA', 'i = Q / Δt'],
      ['POTÊNCIA ELÉTRICA', 'P = U·i'],
    ],
  },
];

export default function FormulasScreen({ onLogout }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={styles.title}>FÓRMULAS</Text>
        <Text style={styles.subtitle}>VEJA AS FÓRMULAS MAIS USADAS</Text>
      </View>

      <View style={styles.cards}>
        {groups.map((group) => (
          <View key={group.title} style={styles.card}>
            <Text style={styles.cardTitle}>{group.title}</Text>
            {group.formulas.map(([label, formula]) => (
              <View key={label} style={styles.formula}>
                <Text style={styles.formulaLabel}>{label}</Text>
                <View style={styles.formulaBox}>
                  <Text style={styles.formulaText}>{formula}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Footer onLogout={onLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 25,
  },
  heading: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  title: {
    color: '#4d005f',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: '#4d005f',
    fontSize: 12,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  cards: {
    paddingHorizontal: 15,
    gap: 25,
  },
  card: {
    backgroundColor: '#4d005f',
    width: '100%',
    borderRadius: 25,
    padding: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 25,
  },
  formula: {
    marginBottom: 25,
    gap: 10,
  },
  formulaLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  formulaBox: {
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  formulaText: {
    color: '#222',
    fontSize: 18,
    fontStyle: 'italic',
    fontFamily: 'serif',
    textAlign: 'center',
  },
});