const express = require('express');
const resultController  = require('../controllers/scorecard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/result/:userId', verifyToken, resultController.get);
router.post('/create/:userId/:roomId', verifyToken, resultController.create);
router.post('/result/:roomId', resultController.postResult);
router.get("/history/:userId", verifyToken, resultController.getResultHistory);

module.exports = router;