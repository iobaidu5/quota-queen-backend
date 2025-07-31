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

module.exports = {


  create: async (userId, roomId) => {
    try {
      const formattedData = {
        user_id: userId,
        room_id: roomId,
        payload: {},
        result_score: {},
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase.from('results').insert([formattedData]);

      if (error) {
        console.error('Supabase insert error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Record Initialized successfully in Database' };
    } catch (err) {
      console.error('Unexpected error writing result data:', err);
      return { success: false, error: 'Failed to write result data' };
    }
  },

  post: async (userId, roomId, data) => {
    try {
      if (!userId || !roomId || !data) {
        return { success: false, error: 'userId, roomId and data are required' };
      }

      const { scores, ...restData } = data;

      const updatedData = {
        payload: restData,
        result_score: scores,
        timestamp: new Date().toISOString()
      };

      const resultScoreRaw = scores || {};
      const isEmpty = Object.keys(resultScoreRaw).length === 0;

      const parsedCategories = Object.entries(resultScoreRaw).map(([name, data]) => {
        const percentage = parseFloat(data.percentage?.replace("%", "") || "0");
        const weight = parseFloat(data.weight?.replace("%", "") || "0");
        return { name, ...data, percentage, weight };
      });

      const totalScore = parsedCategories.reduce((sum, cat) => {
        return sum + (cat.percentage * (cat.weight / 100));
      }, 0);

      const leaderboard = {
        user_id: userId,
        score: totalScore,
        category: ""
      }

      // First update
      const { error: updateError } = await supabase
        .from('results')
        .update(updatedData)
        .eq('room_id', roomId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        return { success: false, error: updateError.message };
      }

      // Then insert
      const { error: insertError } = await supabase
        .from('leaderboard_entries')
        .insert(leaderboard);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return { success: false, error: insertError.message };
      }

      const { data: allEntries, error: fetchError } = await supabase
        .from('leaderboard_entries')
        .select('id, score')
        .order('score', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // 3. Assign new ranks
      const entriesWithRank = allEntries.map((entry, index) => ({
        id: entry.id,
        rank: index + 1
      }));

      // 4. Update each entry with new rank
      for (const entry of entriesWithRank) {
        const { error: updateError } = await supabase
          .from('leaderboard_entries')
          .update({ rank: entry.rank })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`Rank update failed for ID ${entry.id}:`, updateError);
        }
      }

      return { success: true, message: 'Result updated successfully in Database' };
    } catch (err) {
      console.error('Unexpected error updating result data:', err);
      return { success: false, error: 'Failed to update result data' };
    }
  }


};
