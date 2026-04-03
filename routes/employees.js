const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');


const hrRoles = ['HR', 'admin'];



router.get('/me', CheckLogin, employeeController.getMyProfile);

router.get('/', CheckLogin, CheckRole(hrRoles), employeeController.getAllEmployees);
router.get('/:id', CheckLogin, CheckRole(hrRoles), employeeController.getEmployeeById);
router.post('/create', CheckLogin, CheckRole(hrRoles), employeeController.createEmployee);
router.put('/:id', CheckLogin, CheckRole(hrRoles), employeeController.updateEmployee);
router.delete('/:id', CheckLogin, CheckRole(hrRoles), employeeController.deleteEmployee);

module.exports = router;
