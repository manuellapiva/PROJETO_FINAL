import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Header from './src/components/Header';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import FormulasScreen from './src/screens/FormulasScreen';
import AdminScreen from './src/screens/AdminScreen';

import { request, extractArray } from './src/services/api';
import {
  getStoredValue,
  setStoredValue,
  deleteStoredValue,
} from './src/services/storage';
import { colors } from './src/styles/theme';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [screen, setScreen] = useState('login');

  const [questions, setQuestions] = useState([]);
  const [vestibulares, setVestibulares] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [topicos, setTopicos] = useState([]);

  const [vest, setVest] = useState('');
  const [materia, setMateria] = useState('');
  const [topico, setTopico] = useState('');

  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState('');

  const isAdmin = user?.tipo === 'admin';

  useEffect(() => {
    async function restoreSession() {
      try {
        // Chaves atuais do frontend; as antigas do app também são aceitas
        // para preservar sessões já existentes.
        const savedToken =
          (await getStoredValue('jwtToken')) ||
          (await getStoredValue('jwt'));

        const savedUser =
          (await getStoredValue('usuario')) ||
          (await getStoredValue('user'));

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
          setScreen(parsedUser?.tipo === 'admin' ? 'admin' : 'home');
        } else {
          setScreen('login');
        }
      } catch (error) {
        console.log('Erro ao restaurar sessão:', error);
        setScreen('login');
      } finally {
        setAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function handleAuthenticate({ register, nome, email, password }) {
    setAuthSubmitting(true);

    try {
      if (register) {
        await request('/auth/registrar', null, {
          method: 'POST',
          body: JSON.stringify({ nome, email, password }),
        });

        return { registered: true };
      }

      const data = await request('/auth/login', null, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const newToken = data?.token || data?.jwt;
      const newUser = data?.usuario || data?.user || data;

      if (!newToken) {
        throw new Error('O servidor não retornou o token de autenticação.');
      }

      setToken(newToken);
      setUser(newUser);
      setScreen(newUser?.tipo === 'admin' ? 'admin' : 'home');

      await setStoredValue('jwtToken', newToken);
      await setStoredValue('usuario', JSON.stringify(newUser));

      // Limpa as chaves antigas para evitar sessões duplicadas.
      await deleteStoredValue('jwt');
      await deleteStoredValue('user');

      return { authenticated: true };
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await Promise.all([
        deleteStoredValue('jwtToken'),
        deleteStoredValue('usuario'),
        deleteStoredValue('jwt'),
        deleteStoredValue('user'),
      ]);
    } catch (error) {
      console.log('Erro ao limpar sessão:', error);
    }

    setToken(null);
    setUser(null);
    setQuestions([]);
    setVest('');
    setMateria('');
    setTopico('');
    setScreen('login');
  }

  async function loadFilters() {
    try {
      const [vestData, materiaData, topicoData] = await Promise.all([
        request('/vestibulares', token),
        request('/materia', token),
        request('/topico', token),
      ]);

      setVestibulares(extractArray(vestData, ['vestibulares', 'dados']));
      setMaterias(extractArray(materiaData, ['materias', 'dados']));
      setTopicos(extractArray(topicoData, ['topicos', 'dados']));
    } catch (error) {
      console.log('Erro ao carregar filtros:', error);
      setQuestionsError(error.message || 'Não foi possível carregar os filtros.');
    }
  }

  async function loadQuestions(filters = {}) {
    if (!token) return;

    const selectedVest = filters.vest ?? vest;
    const selectedMateria = filters.materia ?? materia;
    const selectedTopic = filters.topico ?? topico;

    setQuestionsLoading(true);
    setQuestionsError('');

    try {
      const params = new URLSearchParams();

      if (selectedVest) {
        const item = vestibulares.find(
          (entry) => String(entry.id) === String(selectedVest)
        );
        if (item?.sigla) params.append('vestibular', item.sigla);
      }

      if (selectedMateria) {
        const item = materias.find(
          (entry) => String(entry.id_mat ?? entry.id) === String(selectedMateria)
        );
        if (item?.nome_mat) params.append('materia', item.nome_mat);
      }

      if (selectedTopic) {
        const item = topicos.find(
          (entry) => String(entry.id_top ?? entry.id) === String(selectedTopic)
        );
        if (item?.nome_top) params.append('topico', item.nome_top);
      }

      const path = params.toString()
        ? `/questoes/filtro?${params.toString()}`
        : '/questoes';

      const data = await request(path, token);
      setQuestions(extractArray(data, ['questoes', 'dados', 'resultados']));
    } catch (error) {
      console.log('Erro ao carregar questões:', error);
      setQuestionsError(error.message || 'Erro ao carregar questões.');
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }

  useEffect(() => {
    if (token && screen === 'list') {
      loadFilters();
      loadQuestions({ vest: '', materia: '', topico: '' });
    }
  }, [token, screen]);

  function navigate(destination) {
    if (destination === 'admin' && !isAdmin) return;
    setScreen(destination);
  }

  function clearFilters() {
    setVest('');
    setMateria('');
    setTopico('');
    loadQuestions({ vest: '', materia: '', topico: '' });
  }

  async function checkAnswer(questionId) {
    if (!token) throw new Error('Sua sessão expirou. Entre novamente.');
    return request(`/questoes/${questionId}`, token);
  }

  if (authLoading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparando o BuscFísica...</Text>
      </View>
    );
  }

  if (!token || !user || screen === 'login') {
    return (
      <View style={styles.loginRoot}>
        <StatusBar style="light" />
        <LoginScreen
          onAuthenticate={handleAuthenticate}
          loading={authSubmitting}
        />
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <Header
        active={screen}
        onNavigate={navigate}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      <View style={styles.main}>
        {screen === 'home' ? (
          <HomeScreen onNavigate={navigate} onLogout={handleLogout} />
        ) : null}

        {screen === 'list' ? (
          <QuestionsScreen
            items={questions}
            vests={vestibulares}
            materias={materias}
            topicos={topicos}
            vest={vest}
            materia={materia}
            topico={topico}
            onVestChange={setVest}
            onMateriaChange={(value) => {
              setMateria(value);
              setTopico('');
            }}
            onTopicoChange={setTopico}
            onApplyFilters={() => loadQuestions()}
            onClearFilters={clearFilters}
            onCheckAnswer={checkAnswer}
            loading={questionsLoading}
            error={questionsError}
            onLogout={handleLogout}
          />
        ) : null}

        {screen === 'formulas' ? (
          <FormulasScreen onLogout={handleLogout} />
        ) : null}

        {screen === 'admin' && isAdmin ? (
          <AdminScreen token={token} onLogout={handleLogout} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
  },
  loginRoot: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: colors.background,
  },
  loadingScreen: {
    flex: 1,
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.primary,
    fontWeight: '800',
    marginTop: 14,
  },
});
