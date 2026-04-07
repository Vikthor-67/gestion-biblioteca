const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/autores.controllers");

//GET Listas Autores
router.get("/", controller.ListarAutores); 

//POST Insertar Autor
router.post("/", controller.insertar);

//PUT Actualizar Autor
router.put("/:IdAutor", controller.actualizar);

//DELETE Eliminar Autor
router.delete("/:IdAutor", controller.eliminar);

//Get por ID 
router.get("/:IdAutor", controller.ListarAutoresxid);

module.exports = router;