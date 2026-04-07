const router = require("express").Router();
const { route } = require("../app");
const controller = require("../controllers/usuarios.controllers");

//GET Listas Usuarios
router.get("/", controller.ListarUsuarios); 

//Get por ID 
router.get("/:IdUsuario", controller.ListarUsuariosxid);

//POST Insertar Autor
router.post("/", controller.insertar);

//PUT Actualizar Usuario
router.put("/:IdUsuario", controller.actualizar);

//DELETE Eliminar Usuario
router.delete("/:IdUsuario", controller.eliminar);

module.exports = router;