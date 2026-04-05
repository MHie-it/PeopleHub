const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

const departmentRoles = ['Manager', 'admin', 'Admin', 'HR', 'Boss', 'Director'];

router.post('/create', CheckLogin, CheckRole(departmentRoles), departmentController.createDepartment);
router.get('/list', CheckLogin, CheckRole(departmentRoles), departmentController.getDepartment);
router.put('/update/:id', CheckLogin, CheckRole(departmentRoles), departmentController.updateDepartment);
router.delete('/delete/:id', CheckLogin, CheckRole(departmentRoles), departmentController.deleteDepartment);

module.exports = router;