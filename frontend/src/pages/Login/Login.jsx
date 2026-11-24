import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logo from '/img/logo_buscfisica.png';
import API_URL from '../../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (isRegistering && password.length < 8) {
      setMessage('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegistering ? '/auth/registrar' : '/auth/login';
      const payload = isRegistering
        ? { nome: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.mensagem || 'Não foi possível concluir a solicitação.');
      }

      if (isRegistering) {
        setIsRegistering(false);
        setPassword('');
        setMessage('Cadastro realizado! Agora entre com seu e-mail e senha.');
        return;
      }

      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      if (data.usuario?.tipo === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setMessage(error.message || 'Falha de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function alternarModo() {
    setIsRegistering((current) => !current);
    setMessage('');
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>BUSCFÍSICA</h1>
          <img src={logo} alt="Logo BuscFísica" />
        </div>
      </header>

      <main className={styles.mainContainer}>
        <section className={styles.loginSection}>
          <h2>{isRegistering ? 'CADASTRO' : 'LOGIN'}</h2>
          <p className={styles.subtitle}>
            {isRegistering
              ? 'Crie sua conta para acessar o BuscFísica.'
              : 'Faça login para acessar sua conta.'}
          </p>

          {message && <p className={styles.message} role="status">{message}</p>}

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className={styles.formRow}>
                <label htmlFor="name">NOME</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>
            )}

            <div className={styles.formRow}>
              <label htmlFor="email">E-MAIL</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="password">SENHA</label>
              <input
                id="password"
                type="password"
                placeholder={isRegistering ? 'Mínimo de 8 caracteres' : 'Digite sua senha'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                minLength={isRegistering ? 8 : undefined}
                required
              />
            </div>

            <div className={styles.buttonRow}>
              <button type="submit" disabled={loading}>
                {loading
                  ? 'AGUARDE...'
                  : isRegistering ? 'CRIAR CONTA' : 'ENTRAR'}
              </button>
            </div>
          </form>

          <p className={styles.loginLink}>
            <span>{isRegistering ? 'Já possui uma conta?' : 'Primeiro acesso?'}</span>
            <button type="button" onClick={alternarModo} className={styles.modeButton}>
              {isRegistering ? 'Fazer login' : 'Cadastre-se'}
            </button>
          </p>
        </section>
      </main>
    </>
  );
}
