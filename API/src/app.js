const express = require("express");
const cors = require("cors");

const autoresRoutes = require("./routes/autores.routes");
const librosRoutes = require("./routes/libros.routes");
const prestamosRoutes = require("./routes/prestamos.routes");
const usuariosRoutes = require("./routes/usuarios.routes");

const app = express();

app.use(cors());
app.use(express.json());


//RUTAS
app.get("/", (req, res) => {
    res.json({ok: true, message: "API de Biblioteca funcionando correctamente"});
});

app.use("/api/autores", autoresRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/usuarios", usuariosRoutes);


module.exports = app;