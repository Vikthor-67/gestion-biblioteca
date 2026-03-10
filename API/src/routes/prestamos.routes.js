const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/prestamos.controllers");

//GET Listas Prestamos
router.get("/", controller.ListarPrestamos);

//POST Insertar Prestamo
router.post("/", controller.insertar);

//Get por ID 
router.get("/:IdPrestamo", controller.ListarPrestamosxid);

//PUT Actualizar Fecha de Devolución
router.put("/:IdPrestamo", controller.actualizarFechaDevolucion);

module.exports = router;