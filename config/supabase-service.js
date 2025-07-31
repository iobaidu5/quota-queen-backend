const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

class SupabaseService {
  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }


  from(table) {
    return this.client.from(table);
  }

  async createCall({ userId, title, description, scheduledAt, callType }) {
    const { data, error } = await this.client
      .from('calls')
      .insert([{
        session_id: `sess_${Date.now()}`,
        title,
        description,
        scheduled_at: "2025-05-17 19:44:00+00",
        call_type: callType,
        host_id: userId,
        room_name: `room_${uuidv4()}`,
        status: 'scheduled'
      }])
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getCallByRoom(roomName) {
    const { data, error } = await this.client
      .from('calls')
      .select('*')
      .eq('room_name', roomName)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = { SupabaseService };