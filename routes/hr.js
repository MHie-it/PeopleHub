const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');

// Route POST: /hr/create-employee
router.post('/create-employee', hrController.createEmployee);

module.exports = router;