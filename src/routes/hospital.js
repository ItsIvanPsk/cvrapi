const express = require('express');
const router = express.Router();
const { createSession, endSession, playerCheckpoint, sessionList, playerData } = require('../controllers/hospitalController');

router.post('/create_session', createSession);
router.post('/end_session', endSession);
router.post('/player_checkpoint', playerCheckpoint);
router.post('/get_player_data', playerData);
router.post('/get_sessions', sessionList);

module.exports = router;
