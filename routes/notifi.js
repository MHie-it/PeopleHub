const express = require('express');
const router = express.Router();
const notifiController = require('../controllers/notifiController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

router.get('/user/:userId', notifiController.getAll);
router.post('/send-all', CheckLogin, CheckRole(['HR', 'admin', 'Manager', 'Boss', 'Director']), notifiController.createGlobal);
router.post('/', notifiController.create);
router.put('/:id/read', notifiController.markAsRead);

module.exports = router;
