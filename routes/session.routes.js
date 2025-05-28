const express = require('express');
const { start, join } = require('../controllers/session.controller');

const router = express.Router();

// router.post('/calls', startSession);

router.post('/calls/start', async (req, res) => {
  try {
    const { userId, ...callData } = req.body;
    const result = await start(userId, callData);
    res.json(result);
  } catch (err) {
    console.error('Call start error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/calls/join', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    const result = await callService.join(userId, { sessionId });
    res.json(result);
  } catch (err) {
    console.error('Call join error:', err);
    res.status(500).json({ error: err.message });
  }
});


// router.post('/join', joinSession);

module.exports = router;