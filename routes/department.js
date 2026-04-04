const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

const roles = require('../schemas/roles');

router.post('/create', CheckLogin ,CheckRole(['Manager', 'admin']), departmentController.createDepartment);
router.get('/list', CheckLogin , CheckRole(['Manager', 'admin']), departmentController.getDepartment);

module.exports = router;