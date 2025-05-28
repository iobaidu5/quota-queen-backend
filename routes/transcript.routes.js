const express = require('express');
const { saveTranscript, getTranscript, listTranscripts } = require('../controllers/transcript.controller');

const router = express.Router();

router.post('/', saveTranscript);
router.get('/:id', getTranscript);
router.get('/', listTranscripts);

module.exports = router;