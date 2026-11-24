const UsuarioModel=require('../models/usuarioModel');
async function listarTodos(req,res){try{res.json(await UsuarioModel.listarTodos())}catch(e){res.status(500).json({mensagem:'Erro ao listar usuários.'})}}
async function buscarPorId(req,res){try{const id=Number(req.params.id);if(!Number.isInteger(id))return res.status(400).json({mensagem:'ID inválido.'});const u=await UsuarioModel.buscarPorId(id);if(!u)return res.status(404).json({mensagem:'Usuário não encontrado.'});res.json(u)}catch(e){res.status(500).json({mensagem:'Erro ao buscar usuário.'})}}
module.exports={listarTodos,buscarPorId};
