import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CustomButton from '../components/CustomButton';
import { colors, radius } from '../styles/theme';

export default function LoginScreen({ onAuthenticate, loading = false }) {
  const [register, setRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);

  async function submit() {
    setMessage('');
    setMessageIsError(false);

    if (!email.trim() || !password || (register && !nome.trim())) {
      setMessage('Preencha todos os campos.');
      setMessageIsError(true);
      return;
    }

    if (register && password.length < 8) {
      setMessage('A senha precisa ter pelo menos 8 caracteres.');
      setMessageIsError(true);
      return;
    }

    try {
      const result = await onAuthenticate({
        register,
        nome: nome.trim(),
        email: email.trim(),
        password,
      });

      if (register && result?.registered) {
        setRegister(false);
        setPassword('');
        setMessage('Cadastro realizado! Agora entre com seu e-mail e senha.');
      }
    } catch (error) {
      setMessage(error.message || 'Não foi possível concluir a solicitação.');
      setMessageIsError(true);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.brand}>BUSCFÍSICA</Text>
            <Image
              source={require('../assets/logo_buscfisica.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.loginSection}>
            <Text style={styles.title}>
              {register ? 'CADASTRO' : 'LOGIN'}
            </Text>

            <Text style={styles.subtitle}>
              {register
                ? 'Crie sua conta para acessar o BuscFísica.'
                : 'Faça login para acessar sua conta.'}
            </Text>

            {message ? (
              <Text style={[
                styles.message,
                messageIsError ? styles.errorMessage : styles.successMessage,
              ]}>
                {message}
              </Text>
            ) : null}

            {register ? (
              <View style={styles.formRow}>
                <Text style={styles.label}>NOME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#888"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  autoComplete="name"
                  maxLength={100}
                />
              </View>
            ) : null}

            <View style={styles.formRow}>
              <Text style={styles.label}>E-MAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>SENHA</Text>
              <TextInput
                style={styles.input}
                placeholder={register ? 'Mínimo de 8 caracteres' : 'Digite sua senha'}
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={register ? 'new-password' : 'current-password'}
              />
            </View>

            <CustomButton
              title={register ? 'CRIAR CONTA' : 'ENTRAR'}
              onPress={submit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {register ? 'Já possui uma conta?' : 'Primeiro acesso?'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setRegister((value) => !value);
                  setMessage('');
                }}
              >
                <Text style={styles.switchText}>
                  {register ? 'Fazer login' : 'Cadastre-se'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    width: '100%',
    backgroundColor: colors.dark,
    alignItems: 'center',
    paddingVertical: 18,
  },
  logo: {
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 22,
  },
  loginSection: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#4c005e',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 45,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 30,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 18,
    lineHeight: 20,
  },
  errorMessage: { color: '#ffb3b3' },
  successMessage: { color: '#c5ffb4' },
  formRow: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: '#d9d9d9',
    paddingHorizontal: 20,
    paddingVertical: 13,
    color: '#24142a',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.lilacButton,
    marginTop: 3,
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
  },
  switchRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  switchLabel: {
    color: '#ddd',
    fontSize: 14,
  },
  switchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
