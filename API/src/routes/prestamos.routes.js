const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/prestamos.controllers");

//GET Listas Prestamos
router.get("/", controller.ListarPrestamos); 

//Get por ID 
router.get("/:IdPrestamo", controller.ListarPrestamosxid);

module.exports = router;