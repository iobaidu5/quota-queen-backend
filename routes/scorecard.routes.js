const express = require('express');
const resultController  = require('../controllers/scorecard.controller');

const router = express.Router();

router.post('/result/:roomId', resultController.postResult);

module.exports = router;