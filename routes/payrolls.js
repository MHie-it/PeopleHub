const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

router.post('/:id/send-email', payrollController.sendSalaryEmail);
router.post('/calculate', CheckLogin, CheckRole(["Director", "Boss", "Admin", "HR"]), payrollController.calculate);

module.exports = router;
