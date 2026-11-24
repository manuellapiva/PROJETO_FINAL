const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

function validarEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function gerarToken(usuario) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET não configurado corretamente.');
  }

  return jwt.sign(
    { id: usuario.id_user, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { expiresIn: '4h' }
  );
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!validarEmail(email) || typeof password !== 'string' || !password) {
      return res.status(400).json({ mensagem: 'Informe um e-mail válido e sua senha.' });
    }

    const { rows } = await pool.query(
      `SELECT id_user, nome, email, senha_hash, tipo
       FROM usuario
       WHERE lower(email) = lower($1)`,
      [email.trim()]
    );
    const usuario = rows[0];

    if (!usuario || !(await bcrypt.compare(password, usuario.senha_hash))) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    const token = gerarToken(usuario);
    res.json({
      token,
      usuario: {
        id: usuario.id_user,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ mensagem: 'Não foi possível realizar o login.' });
  }
}

async function registrar(req, res) {
  try {
    const { nome, email, password } = req.body || {};
    if (
      typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100 ||
      !validarEmail(email) || typeof password !== 'string' || password.length < 8
    ) {
      return res.status(400).json({
        mensagem: 'Informe nome, e-mail válido e senha com pelo menos 8 caracteres.',
      });
    }

    const senha_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO usuario (nome, email, senha_hash, tipo)
       VALUES ($1, $2, $3, 'user')
       RETURNING id_user, nome, email, tipo`,
      [nome.trim(), email.trim().toLowerCase(), senha_hash]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro no cadastro:', error.message);
    res.status(500).json({ mensagem: 'Não foi possível criar a conta.' });
  }
}

module.exports = { login, registrar };
