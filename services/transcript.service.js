const supabase = require('../config/supabase');

module.exports = {
  save: async (userId, { competitionId, content }) => {
    const { data } = await supabase.from('transcripts').insert([{ student_id: userId, competition_id: competitionId, content }]).select().single();
    return data;
  },
  get: async (id) => (await supabase.from('transcripts').select().eq('id', id).single()).data,
  list: async (filters) => {
    let query = supabase.from('transcripts').select();
    if (filters.studentId) query.eq('student_id', filters.studentId);
    if (filters.competitionId) query.eq('competition_id', filters.competitionId);
    const { data } = await query;
    return data;
  }
};