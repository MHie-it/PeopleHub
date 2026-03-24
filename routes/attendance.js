const express = require('express');
const router = express.Router();
const { CheckLogin, CheckRole } = require('../utils/authHandler');
const { checkIn, checkOut } = require('../controllers/attendanceController');

// Cho phép các role: Employee, HR, Manager, admin
const allowedRoles = ['Employee', 'HR', 'Manager', 'admin'];

router.post('/check-in', CheckLogin, CheckRole(allowedRoles), checkIn);
router.post('/check-out', CheckLogin, CheckRole(allowedRoles), checkOut);

module.exports = router;