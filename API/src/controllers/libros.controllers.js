const {sql, getpool} = require("../config/db");

//GET: Listar las actividades con procedimiento almacenado

exports.ListarLibros = async (req, res) => {
    try {
        const pool = await getpool();
        const result = await pool.request().execute("sp_Libro_Listar");
        res.json(result.recordset);
    }catch (error) {
        res.status(500).json({message : "Error listando Libros", error: error.message});
    }
}; 

//GET: Mostrar actividad por ID

exports.ListarLibrosxid = async (req, res) => {
    try {
        const IdLibro = parseInt(req.params.IdLibro, 10);
        if(isNaN(IdLibro)){return res.status(400).json({message: "ID inválido"});}
        const pool = await getpool();
        const result = await pool.request()
        .input("IdLibro", sql.Int, IdLibro)
        .execute("sp_Libro_Detalle");

        const row = result.recordset?.[0];
        if(!row){return res.status(404).json({message: "Libro no encontrado"});}
        res.json(row);
    }catch (error) {
        res.status(500).json({message : "Error al obtener Libros", error: error.message});
    }
};

//POST: Insertar libro
exports.insertar = async (req, res) => {
    try {
        const {
            Titulo,
            AnioPublicacion,
            Genero,
            IdAutor,
        } = req.body;

        // validaciones

        if (!Titulo || !AnioPublicacion || !Genero || !IdAutor) {
            return res.status(400).json({
                message: "Campos inválidos, favor verificar cada uno",
            });
        }

        const pool = await getpool();
        await pool
            .request()
            .input("Titulo", sql.NVarChar(150), Titulo)
            .input("AnioPublicacion", sql.Int, AnioPublicacion)
            .input("Genero", sql.NVarChar(100), Genero)
            .input("IdAutor", sql.Int, IdAutor)
            .execute("sp_InsertarLibro");

        res.status(201).json({
            message: "Libro registrado de forma correcta",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error criminal no se se inserto ningun libro, cambie de carrera mejor",
            error: error.message,
        });
    }
};