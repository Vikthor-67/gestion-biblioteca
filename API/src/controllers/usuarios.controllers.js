const {sql, getpool} = require("../config/db");

//GET: Listar las actividades con procedimiento almacenado

exports.ListarUsuarios = async (req, res) => {
    try {
        const pool = await getpool();
        const result = await pool.request().execute("sp_Usuario_Listar");
        res.json(result.recordset);
    }catch (error) {
        res.status(500).json({message : "Error listando Usuarios", error: error.message});
    }
}; 

//GET: Mostrar actividad por ID

exports.ListarUsuariosxid = async (req, res) => {
    try {
        const IdUsuario = parseInt(req.params.IdUsuario, 10);
        if(isNaN(IdUsuario)){return res.status(400).json({message: "ID inválido"});}
        const pool = await getpool();
        const result = await pool.request()
        .input("IdUsuario", sql.Int, IdUsuario)
        .execute("sp_Usuario_Detalle");

        const row = result.recordset?.[0];
        if(!row){return res.status(404).json({message: "Usuario no encontrado"});}
        res.json(row);
    }catch (error) {
        res.status(500).json({message : "Error al obtener Usuarios", error: error.message});
    }
};