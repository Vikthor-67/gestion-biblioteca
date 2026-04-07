const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/libros.controllers");

//GET Listas Libros
router.get("/", controller.ListarLibros);

//Get por ID 
router.get("/:IdLibro", controller.ListarLibrosxid);

//POST Insertar Autor
router.post("/", controller.insertar);

//PUT Actualizar Libro
router.put("/:IdLibro", controller.actualizar);

//DELETE Eliminar Libro
router.delete("/:IdLibro", controller.eliminar);

module.exports = router;