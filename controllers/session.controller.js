const sessionService = require('../services/session.service');

module.exports = {
  startSession: async (req, res) => res.json(await sessionService.start(req.user.id, req.body)),
  joinSession: async (req, res) => res.json(await sessionService.join(req.user.id, req.body))
};