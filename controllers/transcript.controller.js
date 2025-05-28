const transcriptService = require('../services/transcript.service');

module.exports = {
  saveTranscript: async (req, res) => res.status(201).json(await transcriptService.save(req.user.id, req.body)),
  getTranscript: async (req, res) => res.json(await transcriptService.get(req.params.id)),
  listTranscripts: async (req, res) => res.json(await transcriptService.list(req.query))
};