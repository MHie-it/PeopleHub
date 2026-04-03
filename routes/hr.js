const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');


router.get('/list-employees', hrController.listEmployees);
router.post('/create-employee', hrController.createEmployee);
router.delete('/delete-employee', hrController.deleteEmployee);

module.exports = router;