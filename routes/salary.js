const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

router.post('/', CheckLogin, CheckRole(["Director", "Boss"]), salaryController.setSalary);

router.get('/:employeeId', CheckLogin, salaryController.getSalary);

module.exports = router;
