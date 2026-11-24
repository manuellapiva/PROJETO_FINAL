const multer = require('multer');

function filtrarImagem(req, file, cb) {
  const tiposPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!tiposPermitidos.includes(file.mimetype)) {
    return cb(
      new Error('Formato inválido. Envie JPG, PNG ou WEBP.')
    );
  }

  cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: filtrarImagem,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
