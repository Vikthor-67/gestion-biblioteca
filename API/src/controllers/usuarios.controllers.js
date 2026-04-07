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

//POST: Insertar usuario
exports.insertar = async (req, res) => {
    try {
        const {
            Nombre,
            Email,
            Telefono,
        } = req.body;

        // validaciones

        if (!Nombre || !Email || !Telefono) {
            return res.status(400).json({
                message: "Campos inválidos, favor verificar cada uno",
            });
        }

        const pool = await getpool();
        await pool
            .request()
            .input("Nombre", sql.NVarChar(150), Nombre)
            .input("Email", sql.NVarChar(200), Email)
            .input("Telefono", sql.NVarChar(30), Telefono)
            .execute("sp_InsertarUsuario");

        res.status(201).json({
            message: "Usuario registrado de forma correcta",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error criminal no se se inserto ningun usuario, cambie de carrera mejor",
            error: error.message,
        });
    }
};

//PUT: Actualizar usuario
exports.actualizar = async (req, res) => {
    try {
        const IdUsuario = parseInt(req.params.IdUsuario, 10);
        const { Nombre, Email, Telefono } = req.body;

        if (isNaN(IdUsuario)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        if (!Nombre || !Email || !Telefono) {
            return res.status(400).json({
                message: "Campos inválidos, favor verificar cada uno",
            });
        }

        const pool = await getpool();
        const result = await pool
            .request()
            .input("IdUsuario", sql.Int, IdUsuario)
            .input("Nombre", sql.NVarChar(150), Nombre)
            .input("Email", sql.NVarChar(200), Email)
            .input("Telefono", sql.NVarChar(30), Telefono)
            .query(`
                UPDATE dbo.Usuario
                SET Nombre = @Nombre,
                    Email = @Email,
                    Telefono = @Telefono
                WHERE IdUsuario = @IdUsuario;
            `);

        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar usuario",
            error: error.message,
        });
    }
};

//DELETE: Eliminar usuario (solo si no tiene prestamos activos)
exports.eliminar = async (req, res) => {
    try {
        const IdUsuario = parseInt(req.params.IdUsuario, 10);

        if (isNaN(IdUsuario)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const pool = await getpool();
        const pendiente = await pool
            .request()
            .input("IdUsuario", sql.Int, IdUsuario)
            .query(`
                SELECT TOP 1 IdPrestamo
                FROM dbo.Prestamo
                WHERE IdUsuario = @IdUsuario
                  AND FechaDevolucion IS NULL;
            `);

        if (pendiente.recordset && pendiente.recordset.length > 0) {
            return res.status(409).json({
                message: "El usuario tiene préstamos pendientes",
            });
        }

        const result = await pool
            .request()
            .input("IdUsuario", sql.Int, IdUsuario)
            .query(`
                DELETE FROM dbo.Usuario
                WHERE IdUsuario = @IdUsuario;
            `);

        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar usuario",
            error: error.message,
        });
    }
};
