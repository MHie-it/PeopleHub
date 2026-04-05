const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

router.post('/', CheckLogin, leaveController.createLeave);
router.get('/approved', CheckLogin, leaveController.getApprovedLeaves);
router.get('/', CheckLogin, leaveController.getAll);
router.put('/:id/leader', CheckLogin, leaveController.leaderAction);
router.put('/:id/boss', CheckLogin, CheckRole(["Director", "Boss"]), leaveController.bossAction);

module.exports = router;
