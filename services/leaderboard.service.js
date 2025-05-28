const supabase = require('../config/supabase');
module.exports = {
  get: async (competitionId) => {
    let query = supabase.from('transcripts').select('student_id, score').order('score', { ascending: false });
    if (competitionId) query.eq('competition_id', competitionId);
    const { data } = await query;
    return data.map((row, idx) => ({ studentId: row.student_id, score: row.score, rank: idx + 1 }));
  }
};
