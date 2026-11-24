const router=require('express').Router();
const C=require('../controllers/usuarioController');
const {somenteAdmin}=require('../middleware/authMiddleware');
router.get('/',somenteAdmin,C.listarTodos);
router.get('/:id',somenteAdmin,C.buscarPorId);
module.exports=router;
