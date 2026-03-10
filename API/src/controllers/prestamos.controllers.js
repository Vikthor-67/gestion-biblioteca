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

//POST: Insertar Prestamo (FechaDevolucion es NULL inicialmente)
exports.insertar = async (req, res) => {
    try {
        const {
            FechaPrestamo,
            IdLibro,
            IdUsuario,
            Latitud,
            Longitud,
        } = req.body;

        // validaciones

        if (!FechaPrestamo || !IdLibro || !IdUsuario) {
            return res.status(400).json({
                message: "Campos inválidos, favor verificar cada uno",
            });
        }

        const idLibroNum = parseInt(IdLibro, 10);
        const idUsuarioNum = parseInt(IdUsuario, 10);
        const fechaPrestamoDate = new Date(FechaPrestamo);
        const latitudNum =
            Latitud === undefined || Latitud === null || Latitud === ''
                ? null
                : Number(Latitud);
        const longitudNum =
            Longitud === undefined || Longitud === null || Longitud === ''
                ? null
                : Number(Longitud);

        if (isNaN(idLibroNum) || isNaN(idUsuarioNum) || isNaN(fechaPrestamoDate.getTime())) {
            return res.status(400).json({
                message: "Datos inválidos en el préstamo",
            });
        }

        if ((latitudNum !== null && Number.isNaN(latitudNum)) || (longitudNum !== null && Number.isNaN(longitudNum))) {
            return res.status(400).json({
                message: "Latitud o Longitud inválidas",
            });
        }

        const pool = await getpool();
        const libroExiste = await pool
            .request()
            .input("IdLibro", sql.Int, idLibroNum)
            .query("SELECT TOP 1 IdLibro FROM dbo.Libro WHERE IdLibro = @IdLibro");

        if (!libroExiste.recordset || libroExiste.recordset.length === 0) {
            return res.status(404).json({
                message: "El libro seleccionado no existe",
            });
        }

        const usuarioExiste = await pool
            .request()
            .input("IdUsuario", sql.Int, idUsuarioNum)
            .query("SELECT TOP 1 IdUsuario FROM dbo.Usuario WHERE IdUsuario = @IdUsuario");

        if (!usuarioExiste.recordset || usuarioExiste.recordset.length === 0) {
            return res.status(404).json({
                message: "El usuario seleccionado no existe",
            });
        }

        await pool
            .request()
            .input("FechaPrestamo", sql.Date, fechaPrestamoDate)
            .input("FechaDevolucion", sql.DateTime, null)
            .input("IdLibro", sql.Int, idLibroNum)
            .input("IdUsuario", sql.Int, idUsuarioNum)
            .input("Latitud", sql.Decimal(10, 7), latitudNum)
            .input("Longitud", sql.Decimal(10, 7), longitudNum)
            .query(`
                INSERT INTO dbo.Prestamo (FechaPrestamo, FechaDevolucion, IdLibro, IdUsuario, Latitud, Longitud)
                VALUES (@FechaPrestamo, @FechaDevolucion, @IdLibro, @IdUsuario, @Latitud, @Longitud);
            `);

        res.status(201).json({
            message: "Prestamo registrado de forma correcta",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error criminal no se se inserto ningun prestamo, cambie de carrera mejor",
            error: error.message,
        });
    }
};

//PUT: Actualizar Fecha de Devolución
exports.actualizarFechaDevolucion = async (req, res) => {
    try {
        const IdPrestamo = parseInt(req.params.IdPrestamo, 10);
        const { FechaDevolucion } = req.body;

        if (isNaN(IdPrestamo)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        if (!FechaDevolucion) {
            return res.status(400).json({
                message: "FechaDevolucion es requerida",
            });
        }

        const pool = await getpool();
        const result = await pool
            .request()
            .input("IdPrestamo", sql.Int, IdPrestamo)
            .input("FechaDevolucion", sql.DateTime, FechaDevolucion)
            .query(`
                UPDATE dbo.Prestamo
                SET FechaDevolucion = @FechaDevolucion
                WHERE IdPrestamo = @IdPrestamo;
            `);

        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            return res.status(404).json({
                message: "Préstamo no encontrado",
            });
        }

        res.status(200).json({
            message: "Fecha de devolución actualizada correctamente",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar la fecha de devolución",
            error: error.message,
        });
    }
};