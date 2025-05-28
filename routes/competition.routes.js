const express = require('express');
const { createCompetition, listCompetitions, getCompetition, updateCompetition, deleteCompetition } = require('../controllers/competition.controller');
const { requireRole } = require('../middleware/roles.middleware');

const router = express.Router();

router.get('/', listCompetitions);
router.post('/', requireRole('recruiter'), createCompetition);
router.get('/:id', getCompetition);
router.put('/:id', requireRole('recruiter'), updateCompetition);
router.delete('/:id', requireRole('admin'), deleteCompetition);


module.exports = router;