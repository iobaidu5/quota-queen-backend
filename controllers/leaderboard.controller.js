const leaderboardService = require('../services/leaderboard.service');

module.exports = {
  getLeaderboard: async (req, res) => res.json(await leaderboardService.get(req.query.competitionId))
};
