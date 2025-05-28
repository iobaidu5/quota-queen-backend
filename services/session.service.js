const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const LiveKitService = require('./livekitService');
const { SupabaseService } = require('../config/supabase-service');
// const { AIVideoStreamer } = require('./ai-video-streamer')

// Use your Supabase URL + SERVICE_ROLE key here
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );


const supabase = new SupabaseService();
// const livekit = new LiveKitService();

module.exports = {




  // start: async (userId, { title, description, scheduledAt, callType, participants = [] }) => {
  //   const sessionId = 'sess_' + Date.now();
  //   const roomName = 'room_' + uuidv4();

  //   // 1. Create the call
  //   const call = await supabase.call.create({
  //     data: {
  //       session_id: sessionId,
  //       title,
  //       description,
  //       scheduled_at: scheduledAt,
  //       call_type: callType,
  //       created_by: userId,
  //       room_name: roomName
  //     }
  //   });

  //   // 2. Add participants
  //   if (participants.length > 0) {
  //     const participantData = participants.map(userId => ({
  //       call_id: call.id,
  //       user_id: userId
  //     }));

  //     await supabase.callParticipant.createMany({
  //       data: participantData
  //     });
  //   }

  //   // 3. Generate LiveKit token
  //   const token = LiveKitService.generateToken(userId, roomName);

  //   return {
  //     sessionId,
  //     call,
  //     livekit: {
  //       roomName,
  //       token
  //     }
  //   };
  // },

  join: async (userId, { sessionId }) => {
    const call = await supabase.call.findFirst({
      where: { session_id: sessionId }
    });

    if (!call) {
      throw new Error("Call/session not found");
    }

    const token = LiveKitService.generateToken(userId, call.room_name);

    console.log("token generated -> ", generateToken)

    return {
      joined: true,
      livekit: {
        roomName: call.room_name,
        token
      }
    };
  }
};
