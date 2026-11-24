const jwt = require('jsonwebtoken');
function verificarToken(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ mensagem: 'Token não fornecido.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}
function somenteAdmin(req, res, next) {
  if (req.user?.tipo !== 'admin') return res.status(403).json({ mensagem: 'Acesso restrito a administradores.' });
  next();
}
module.exports = { verificarToken, somenteAdmin };
