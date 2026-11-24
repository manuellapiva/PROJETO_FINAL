require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(
  path.join(__dirname, 'uploads')
));

app.get('/', (req, res) => {
  res.json({ nome: 'BuscFísica API', versao: '2.0.0', status: 'online' });
});

app.get('/health', async (req, res) => {
  try {
    const pool = require('./src/config/database');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Falha na conexão com o banco:', error.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/auth', require('./src/routes/authRoutes'));

const { verificarToken } = require('./src/middleware/authMiddleware');

app.use('/topico', verificarToken, require('./src/routes/topicoRoutes'));
app.use('/questoes', verificarToken, require('./src/routes/questoesRoutes'));
app.use('/dificuldade', verificarToken, require('./src/routes/dificuldadeRoutes'));
app.use('/materia', verificarToken, require('./src/routes/materiaRoutes'));
app.use('/usuario', verificarToken, require('./src/routes/usuarioRoutes'));
app.use('/vestibulares', verificarToken, require('./src/routes/vestibularesRoutes'));

// Respostas completas não são disponibilizadas em uma listagem pública.
// O gabarito é retornado somente no endpoint autenticado de detalhe da questão.

app.use((error, req, res, next) => {
  console.error('Erro não tratado na API:', error);

  // Erros relacionados ao upload
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        mensagem: 'A imagem ultrapassa o limite de 5 MB.'
      });
    }

    return res.status(400).json({
      mensagem: 'Erro ao enviar a imagem.'
    });
  }

  if (error.message?.includes('Formato inválido')) {
    return res.status(400).json({
      mensagem: error.message
    });
  }

  return res.status(500).json({
    mensagem: 'Erro interno do servidor.'
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`BuscFísica API em http://localhost:${port}`);
  });
}

module.exports = app;
