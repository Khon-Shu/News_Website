const express = require("express");
const admin_router = express.Router();
const {
  getAdmin,
  getAdminById,
  deleteAdmin,
  updateAdmin,
  addAdmin,
  loginAdmin
} = require("../controller/admin_controller.js");


//LOGIN ADMIN
admin_router.post('/login', loginAdmin)

// GET ALL THE ADMIN
admin_router.get("/", getAdmin);

//ADD ADMIN IN THE DATABASE
admin_router.post("/", addAdmin);

//UPDATE ADMIN
admin_router.put("/:id", updateAdmin);

//DELETE ADMIN
admin_router.delete("/:id", deleteAdmin);

//GET ADMIN BY ID
admin_router.get("/:id", getAdminById);

module.exports = admin_router;
