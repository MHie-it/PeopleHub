const express = require('express');
const router = express.Router();
const { CheckLogin, CheckRole } = require('../utils/authHandler');
const { checkIn, checkOut } = require('../controllers/attendanceController');
const roles = require('../schemas/roles');

const allowedRoles = ['Employee', 'Manager', 'admin'];

router.post('/check-in', CheckLogin, CheckRole([allowedRoles]), checkIn);
router.post('/check-out', CheckLogin, CheckRole([allowedRoles]), checkOut);

module.exports = router;