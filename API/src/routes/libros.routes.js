const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/libros.controllers");

//GET Listas Libros
router.get("/", controller.ListarLibros);

//Get por ID 
router.get("/:IdLibro", controller.ListarLibrosxid);

module.exports = router;