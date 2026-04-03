const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

// Danh sách các vai trò coi như thuộc bộ phận HR/Quản trị để vào được CRUD
const hrRoles = ['HR', 'admin'];

// ==========================================
// DÀNH CHO EMPLOYEE
// ==========================================
// Ai đăng nhập cũng được xem Profile của chính mình
router.get('/me', CheckLogin, employeeController.getMyProfile);

// ==========================================
// DÀNH CHO HR / ADMIN
// ==========================================
router.get('/', CheckLogin, CheckRole(hrRoles), employeeController.getAllEmployees);
router.get('/:id', CheckLogin, CheckRole(hrRoles), employeeController.getEmployeeById);
router.post('/create', CheckLogin, CheckRole(hrRoles), employeeController.createEmployee);
router.put('/:id', CheckLogin, CheckRole(hrRoles), employeeController.updateEmployee);
router.delete('/:id', CheckLogin, CheckRole(hrRoles), employeeController.deleteEmployee);

module.exports = router;
