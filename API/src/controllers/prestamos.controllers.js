const {sql, getpool} = require("../config/db");

//GET: Listar las actividades con procedimiento almacenado

exports.ListarPrestamos = async (req, res) => {
    try {
        const pool = await getpool();
        const result = await pool.request().execute("sp_Prestamo_Listar");
        res.json(result.recordset);
    }catch (error) {
        res.status(500).json({message : "Error listando Prestamos", error: error.message});
    }
}; 

//GET: Mostrar actividad por ID

exports.ListarPrestamosxid = async (req, res) => {
    try {
        const IdPrestamo = parseInt(req.params.IdPrestamo, 10);
        if(isNaN(IdPrestamo)){return res.status(400).json({message: "ID inválido"});}
        const pool = await getpool();
        const result = await pool.request()
        .input("IdPrestamo", sql.Int, IdPrestamo)
        .execute("sp_Prestamo_Detalle");

        const row = result.recordset?.[0];
        if(!row){return res.status(404).json({message: "Prestamo no encontrado"});}
        res.json(row);
    }catch (error) {
        res.status(500).json({message : "Error al obtener Prestamos", error: error.message});
    }
};