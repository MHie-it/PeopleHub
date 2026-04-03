const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");
const { CheckLogin, CheckRole } = require("../utils/authHandler");

router.post(
  "/create",
  CheckLogin,
  CheckRole(["Admin", "Manager"]),
  shiftController.createShift,
);
router.get(
  "/list",
  CheckLogin,
  CheckRole(["Admin", "Manager", "Employee"]),
  shiftController.listShifts,
);
module.exports = router;
