const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

const managementRoles = ['HR', 'admin', 'Admin', 'Manager', 'Boss', 'Director'];
const listRoles = [...managementRoles, 'Leader'];

router.get('/me', CheckLogin, employeeController.getMyProfile);
router.put('/me', CheckLogin, employeeController.updateMyProfile);

router.get('/', CheckLogin, CheckRole(listRoles), employeeController.getAllEmployees);
router.post('/create', CheckLogin, CheckRole(managementRoles), employeeController.createEmployee);
router.put('/:id', CheckLogin, CheckRole(listRoles), employeeController.updateEmployee);
router.delete('/:id', CheckLogin, CheckRole(managementRoles), employeeController.deleteEmployee);
router.get('/:id', CheckLogin, CheckRole(listRoles), employeeController.getEmployeeById);

module.exports = router;
