import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Footer from '../components/Footer';
import { colors, radius } from '../styles/theme';

export default function HomeScreen({ onNavigate, onLogout }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageContent}>
        <View style={styles.main}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              DOMINE A FÍSICA PARA O VESTIBULAR
            </Text>
            <Text style={styles.heroDescription}>
              Acesse questões organizadas por vestibular e tópicos. Pratique e aprimore seus conhecimentos.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onNavigate('list')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Buscar questões</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cards}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Treine Física de Verdade</Text>
              <Text style={styles.cardText}>
                Questões dos vestibulares pra você praticar sem parar.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Busca Avançada</Text>
              <Text style={styles.cardText}>
                Filtre por vestibular e tópico e encontre exatamente o conteúdo que precisa estudar.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Melhores seus resultados</Text>
              <Text style={styles.cardText}>
                Veja explicações completas e videoaulas para te ajudarem no seu desenvolvimento.
              </Text>
            </View>
          </View>

          <View style={styles.bottom}>
            <Text style={styles.bottomTitle}>Pronto para começar?</Text>
            <Text style={styles.bottomText}>
              Se naquela questão você esqueceu como faz, veja as fórmulas.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onNavigate('formulas')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Veja as Fórmulas</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 30,
    paddingBottom: 0,
  },
  pageContent: {
    width: '100%',
    paddingHorizontal: 20,
  },
  main: {
    width: '100%',
    alignItems: 'center',
  },
  hero: {
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#111',
    fontSize: 42,
    lineHeight: 47,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroDescription: {
    color: '#111',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 30,
  },
  primaryButton: {
    width: 250,
    minHeight: 60,
    borderRadius: radius.pill,
    backgroundColor: '#4d0062',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  cards: {
    width: '100%',
    marginTop: 60,
    gap: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#8f2bb3',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4d0062',
    padding: 25,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  bottom: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    marginTop: 60,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#9a35ff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  bottomTitle: {
    color: '#111',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 22,
  },
  bottomText: {
    color: '#111',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: 25,
  },
});