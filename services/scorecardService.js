// const fs = require('fs');
// const path = require('path');

// module.exports = {
//   post: async (roomId, data) => {
//     try {
//       const dir = path.join(__dirname, '..', 'results');

//       // Create results directory if it doesn't exist
//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir);
//       }

//       const filePath = path.join(dir, `${roomId}.json`);
//       const formattedData = {
//         roomId,
//         timestamp: new Date().toISOString(),
//         payload: data
//       };

//       fs.writeFileSync(filePath, JSON.stringify(formattedData, null, 2), 'utf8');
//       console.log(`Result data saved for room: ${roomId}`);
//       return { success: true, message: 'Data stored successfully' };

//     } catch (error) {
//       console.error('Error writing result data:', error);
//       return { success: false, error: 'Failed to write result data' };
//     }
//   }
// };



const { SupabaseService } = require('../config/supabase-service');

const supabase = new SupabaseService();

console.log("supabase -> ", supabase)

module.exports = {
  post: async (roomId, data) => {
    try {
      const formattedData = {
        room_id: roomId,
        payload: data,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase.from('results').insert([formattedData]);

      if (error) {
        console.error('Supabase insert error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Data stored successfully in Supabase' };
    } catch (err) {
      console.error('Unexpected error writing result data:', err);
      return { success: false, error: 'Failed to write result data' };
    }
  }
};
