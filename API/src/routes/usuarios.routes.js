const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/usuarios.controllers");

//GET Listas Usuarios
router.get("/", controller.ListarUsuarios); 

//Get por ID 
router.get("/:IdUsuario", controller.ListarUsuariosxid);

module.exports = router;