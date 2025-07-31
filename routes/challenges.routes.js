const express = require('express');
const { createChallenge, updateChallengeStatus, deleteChallengeAndAgentController } =  require('../controllers/challengeController');
const { requireRole } = require('../middleware/roles.middleware');

const router = express.Router();

router.post('/', createChallenge);
router.post('/status', updateChallengeStatus);
router.delete("/delete/:id/:agentId", deleteChallengeAndAgentController);

module.exports = router;