const express = require('express');
const router = express.Router();
const notifiController = require('../controllers/notifiController');

router.get('/user/:userId', notifiController.getAll);
router.post('/', notifiController.create);
router.put('/:id/read', notifiController.markAsRead);

module.exports = router;
