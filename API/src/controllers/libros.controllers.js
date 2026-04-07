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
            Stock,
        } = req.body;

        // validaciones

        if (!Titulo || !AnioPublicacion || !Genero || !IdAutor) {
            return res.status(400).json({
                message: "Campos inválidos, favor verificar cada uno",
            });
        }

        const stockNormalizado =
            Stock === undefined || Stock === null || Stock === ''
                ? 0
                : parseInt(Stock, 10);

        if (Number.isNaN(stockNormalizado) || stockNormalizado < 0) {
            return res.status(400).json({
                message: "Stock inválido, debe ser un número mayor o igual a 0",
            });
        }

        const pool = await getpool();
        const procTieneStock = await pool
            .request()
            .query(`
                SELECT TOP 1 1 AS TieneStock
                FROM sys.parameters
                WHERE object_id = OBJECT_ID('dbo.sp_InsertarLibro')
                  AND name = '@Stock';
            `);

        const tablaTieneStock = await pool
            .request()
            .query(`
                SELECT TOP 1 1 AS TieneStock
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'dbo'
                  AND TABLE_NAME = 'Libro'
                  AND COLUMN_NAME = 'Stock';
            `);

        const elProcRecibeStock = !!(procTieneStock.recordset && procTieneStock.recordset.length > 0);
        const laTablaTieneStock = !!(tablaTieneStock.recordset && tablaTieneStock.recordset.length > 0);

        if (laTablaTieneStock && !elProcRecibeStock) {
            await pool
                .request()
                .input("Titulo", sql.NVarChar(150), Titulo)
                .input("AnioPublicacion", sql.Int, AnioPublicacion)
                .input("Genero", sql.NVarChar(100), Genero)
                .input("IdAutor", sql.Int, IdAutor)
                .input("Stock", sql.Int, stockNormalizado)
                .query(`
                    INSERT INTO dbo.Libro (Titulo, AnioPublicacion, Genero, IdAutor, Stock)
                    VALUES (@Titulo, @AnioPublicacion, @Genero, @IdAutor, @Stock);
                `);

            return res.status(201).json({
                message: "Libro registrado de forma correcta",
            });
        }

        const request = pool
            .request()
            .input("Titulo", sql.NVarChar(150), Titulo)
            .input("AnioPublicacion", sql.Int, AnioPublicacion)
            .input("Genero", sql.NVarChar(100), Genero)
            .input("IdAutor", sql.Int, IdAutor);

        if (elProcRecibeStock) {
            request.input("Stock", sql.Int, stockNormalizado);
        }

        await request.execute("sp_InsertarLibro");

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

//PUT: Actualizar libro
exports.actualizar = async (req, res) => {
    try {
        const IdLibro = parseInt(req.params.IdLibro, 10);
        const {
            Titulo,
            IdAutor,
            AnioPublicacion,
            Genero,
            Stock,
        } = req.body;

        if (isNaN(IdLibro)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        if (!Titulo || !IdAutor) {
            return res.status(400).json({
                message: "Campos inválidos, favor verificar cada uno",
            });
        }

        const pool = await getpool();
        const autorExiste = await pool
            .request()
            .input("IdAutor", sql.Int, parseInt(IdAutor, 10))
            .query("SELECT TOP 1 IdAutor FROM dbo.Autor WHERE IdAutor = @IdAutor");

        if (!autorExiste.recordset || autorExiste.recordset.length === 0) {
            return res.status(404).json({ message: "El autor seleccionado no existe" });
        }

        const existeStock = await pool
            .request()
            .query(`
                SELECT TOP 1 1 AS TieneStock
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'dbo'
                  AND TABLE_NAME = 'Libro'
                  AND COLUMN_NAME = 'Stock';
            `);

        const setParts = [
            "Titulo = @Titulo",
            "IdAutor = @IdAutor",
        ];

        const request = pool
            .request()
            .input("IdLibro", sql.Int, IdLibro)
            .input("Titulo", sql.NVarChar(150), Titulo)
            .input("IdAutor", sql.Int, parseInt(IdAutor, 10));

        if (AnioPublicacion !== undefined && AnioPublicacion !== null && AnioPublicacion !== '') {
            setParts.push("AnioPublicacion = @AnioPublicacion");
            request.input("AnioPublicacion", sql.Int, parseInt(AnioPublicacion, 10));
        }

        if (Genero !== undefined && Genero !== null && Genero !== '') {
            setParts.push("Genero = @Genero");
            request.input("Genero", sql.NVarChar(100), Genero);
        }

        if (
            existeStock.recordset &&
            existeStock.recordset.length > 0 &&
            Stock !== undefined &&
            Stock !== null &&
            Stock !== ''
        ) {
            setParts.push("Stock = @Stock");
            request.input("Stock", sql.Int, parseInt(Stock, 10));
        }

        const result = await request.query(`
            UPDATE dbo.Libro
            SET ${setParts.join(",\n                ")}
            WHERE IdLibro = @IdLibro;
        `);

        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        res.status(200).json({ message: "Libro actualizado correctamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar libro",
            error: error.message,
        });
    }
};

//DELETE: Eliminar libro (solo si no tiene prestamos activos)
exports.eliminar = async (req, res) => {
    try {
        const IdLibro = parseInt(req.params.IdLibro, 10);

        if (isNaN(IdLibro)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const pool = await getpool();
        const pendiente = await pool
            .request()
            .input("IdLibro", sql.Int, IdLibro)
            .query(`
                SELECT TOP 1 IdPrestamo
                FROM dbo.Prestamo
                WHERE IdLibro = @IdLibro
                  AND FechaDevolucion IS NULL;
            `);

        if (pendiente.recordset && pendiente.recordset.length > 0) {
            return res.status(409).json({
                message: "El libro tiene préstamos pendientes",
            });
        }

        const tieneHistorial = await pool
            .request()
            .input("IdLibro", sql.Int, IdLibro)
            .query(`
                SELECT TOP 1 IdPrestamo
                FROM dbo.Prestamo
                WHERE IdLibro = @IdLibro;
            `);

        if (tieneHistorial.recordset && tieneHistorial.recordset.length > 0) {
            return res.status(409).json({
                message: "No se puede eliminar el libro porque tiene historial de préstamos",
            });
        }

        const result = await pool
            .request()
            .input("IdLibro", sql.Int, IdLibro)
            .query(`
                DELETE FROM dbo.Libro
                WHERE IdLibro = @IdLibro;
            `);

        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        res.status(200).json({ message: "Libro eliminado correctamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar libro",
            error: error.message,
        });
    }
};