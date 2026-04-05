const express = require("express");
const router = express.Router();
const { CheckLogin, CheckRole } = require("../utils/authHandler");
const userAdminController = require("../controllers/userAdminController");

const userMgmtRoles = ["admin", "Admin", "Manager", "Boss"];

router.get("/", CheckLogin, CheckRole(userMgmtRoles), userAdminController.listUsers);
router.get("/:id", CheckLogin, CheckRole(userMgmtRoles), userAdminController.getUserById);
router.put("/:id", CheckLogin, CheckRole(userMgmtRoles), userAdminController.updateUser);
router.delete("/:id", CheckLogin, CheckRole(userMgmtRoles), userAdminController.softDeleteUser);

module.exports = router;
