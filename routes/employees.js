const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

const Roles = ['HR', 'admin'];

router.get('/me', CheckLogin, employeeController.getMyProfile);

router.get('/', CheckLogin, CheckRole(Roles), employeeController.getAllEmployees);
router.get('/:id', CheckLogin, CheckRole(Roles), employeeController.getEmployeeById);
router.post('/create', CheckLogin, CheckRole(Roles), employeeController.createEmployee);
router.put('/:id', CheckLogin, CheckRole(Roles), employeeController.updateEmployee);
router.delete('/:id', CheckLogin, CheckRole(Roles), employeeController.deleteEmployee);

module.exports = router;
