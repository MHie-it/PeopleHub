const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contractController");
const { CheckLogin, CheckRole } = require("../utils/authHandler");

const roles = ["HR", "admin", "Manager"];

router.get("/me", CheckLogin, contractController.getMyContracts);
router.get("/", CheckLogin, CheckRole(roles), contractController.getContracts);
router.get("/:id", CheckLogin, CheckRole(roles), contractController.getContractById);
router.post("/", CheckLogin, CheckRole(roles), contractController.createContract);
router.put("/:id", CheckLogin, CheckRole(roles), contractController.updateContract);

module.exports = router;