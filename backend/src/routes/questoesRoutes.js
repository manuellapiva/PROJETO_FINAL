
const router = require('express').Router();

const QuestoesController = require('../controllers/questoesController');
const { somenteAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', QuestoesController.listarTodos);
router.get('/filtro', QuestoesController.filtrar);
router.get('/:id', QuestoesController.buscarPorId);

router.post(
  '/',
  somenteAdmin,
  upload.single('imagem'),
  QuestoesController.criar
);

router.put(
  '/:id',
  somenteAdmin,
  upload.single('imagem'),
  QuestoesController.atualizar
);

router.delete(
  '/:id',
  somenteAdmin,
  QuestoesController.deletar
);

module.exports = router;
