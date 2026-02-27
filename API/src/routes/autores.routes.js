const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/autores.controllers");

//GET Listas Autores
router.get("/", controller.ListarAutores); 

//Get por ID 
router.get("/:IdAutor", controller.ListarAutoresxid);

module.exports = router;