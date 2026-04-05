const express = require("express");
const router = express.Router();
const positionController = require("../controllers/positions");
const { CheckLogin, CheckRole } = require("../utils/authHandler");

const positionRoles = ["admin", "Admin", "HR", "Manager", "Boss", "Director"];

router.get("/", CheckLogin, positionController.getPositions);

router.post("/", CheckLogin, CheckRole(positionRoles), positionController.createPosition);

router.put("/:id", CheckLogin, CheckRole(positionRoles), positionController.updatePosition);

router.delete("/:id", CheckLogin, CheckRole(positionRoles), positionController.deletePosition);

module.exports = router;