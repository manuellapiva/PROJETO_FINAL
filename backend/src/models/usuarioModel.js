const pool = require('../config/database');
async function listarTodos() {
 const r=await pool.query('SELECT id_user,nome,email,tipo FROM usuario ORDER BY id_user'); return r.rows;
}
async function buscarPorId(id) {
 const r=await pool.query('SELECT id_user,nome,email,tipo FROM usuario WHERE id_user=$1',[id]); return r.rows[0];
}
module.exports={listarTodos,buscarPorId};
