const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');


router.post('/create-employee', hrController.createEmployee);
router.delete('/delete-employee', hrController.deleteEmployee);

module.exports = router;