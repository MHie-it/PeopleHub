const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

const roles = require('../schemas/roles');

router.post('/create', CheckLogin ,CheckRole(['Manager', 'Admin']), departmentController.createDepartment);
router.get('/list', CheckLogin , CheckRole(['Manager', 'Admin']), departmentController.getDepartment);

module.exports = router;