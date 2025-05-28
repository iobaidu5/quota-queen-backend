const competitionService = require('../services/competition.service');

module.exports = {
  listCompetitions: async (req, res) => res.json(await competitionService.list()),
  createCompetition: async (req, res) => res.status(201).json(await competitionService.create(req.user.id, req.body)),
  getCompetition: async (req, res) => res.json(await competitionService.get(req.params.id)),
  updateCompetition: async (req, res) => res.json(await competitionService.update(req.params.id, req.body)),
  deleteCompetition: async (req, res) => { await competitionService.delete(req.params.id); res.sendStatus(204); }
};
