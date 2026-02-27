const {sql, getpool} = require("../config/db");

//GET: Listar las actividades con procedimiento almacenado

exports.ListarAutores = async (req, res) => {
    try {
        const pool = await getpool();
        const result = await pool.request().execute("sp_Autor_Listar");
        res.json(result.recordset);
    }catch (error) {
        res.status(500).json({message : "Error listando Autores", error: error.message});
    }
}; 

//GET: Mostrar actividad por ID

exports.ListarAutoresxid = async (req, res) => {
    try {
        const IdAutor = parseInt(req.params.IdAutor, 10);
        if(isNaN(IdAutor)){return res.status(400).json({message: "ID inválido"});}
        const pool = await getpool();
        const result = await pool.request()
        .input("IdAutor", sql.Int, IdAutor)
        .execute("sp_Autor_Detalle");

        const row = result.recordset?.[0];
        if(!row){return res.status(404).json({message: "Autor no encontrado"});}
        res.json(row);
    }catch (error) {
        res.status(500).json({message : "Error al obtener Autores", error: error.message});
    }
}; 