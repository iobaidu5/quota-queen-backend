const supabase = require('../config/supabase');

module.exports = {
  list: async () => (await supabase.from('competitions').select()).data,
  create: async (userId, body) => (await supabase.from('competitions').insert([{ ...body, created_by: userId }]).select().single()).data,
  get: async (id) => (await supabase.from('competitions').select().eq('id', id).single()).data,
  update: async (id, body) => (await supabase.from('competitions').update(body).eq('id', id).single()).data,
  delete: async (id) => await supabase.from('competitions').delete().eq('id', id)
};
