const { RoomServiceClient, AccessToken } = require('livekit-server-sdk');
const { nonstandard: { RTCVideoSource, RTCAudioSource }, RTCPeerConnection } = require('@koush/wrtc');

class LiveKitService {
  constructor() {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      throw new Error('Missing LiveKit API credentials');
    }

    this.roomService = new RoomServiceClient(
      process.env.LIVEKIT_URL,
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );
    this.activeRooms = new Map();
  }

  async createRoom(roomName) {
    try {
      await this.roomService.createRoom({
        name: roomName,
        emptyTimeout: 3600,
        maxParticipants: 10,
        maxPublishers: 4
      });
      return { success: true, roomName };
    } catch (error) {
      console.error('Room creation failed:', error);
      throw new Error(`Could not create room: ${error.message}`);
    }
  }

  // async generateUserToken(userId, roomName) {
  //   try {
  //     const token = new AccessToken(
  //       process.env.LIVEKIT_API_KEY,
  //       process.env.LIVEKIT_API_SECRET,
  //       {
  //         identity: userId,
  //         name: `User-${userId}`,
  //         ttl: '8h'
  //       }
  //     );

  //     token.addGrant({
  //       roomJoin: true,
  //       room: roomName,
  //       canPublish: true,
  //       canSubscribe: true,
  //       canPublishData: true
  //     });

  //     return token.toJwt();
  //   } catch (error) {
  //     console.error('Token generation failed:', error);
  //     throw new Error('Failed to generate user token');
  //   }
  // }

  // async  generateUserToken(userId, userMetadata, roomName, LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET) {
  //   try {

  //     console.log("userMetadatavuserMetadata" , userMetadata)



  //     const userName = userMetadata?.first_name || userMetadata?.firstName 
  //     ? `${userMetadata.first_name || userMetadata.firstName} ${userMetadata.last_name || userMetadata.lastName}`
  //     : 'Unknown User';
  //     const token = new AccessToken(
  //      LIVEKIT_API_KEY,
  //      LIVEKIT_API_SECRET,
  //       {
  //         identity: userId, // UUID string from Supabase (e.g. user.id or user.sub)
  //         name: userName,
  //         ttl: '8h'
  //       }
  //     );
  
  //     // Attach full metadata (used for display, moderation, etc.)
  //     token.metadata = JSON.stringify({
  //       email: userMetadata.email,
  //       email_verified: userMetadata.email_verified,
  //       first_name: userMetadata.first_name || userMetadata.firstName,
  //       last_name: userMetadata.last_name || userMetadata.lastName,
  //       phone_verified: userMetadata.phone_verified,
  //       sub: userMetadata.sub,
  //       user_type: userMetadata.user_type,
  //       metadata: JSON.stringify({
  //         avatarUrl: userMetadata.avatarUrl || ""
  //       }),
  //     });
  
  //     token.addGrant({
  //       roomJoin: true,
  //       room: roomName,
  //       canPublish: true,
  //       canSubscribe: true,
  //       canPublishData: true
  //     });
  
  //     return token.toJwt();
  //   } catch (error) {
  //     console.error('Token generation failed:', error);
  //     throw new Error('Failed to generate user token');
  //   }
  // }
  async generateUserToken(userId, userMetadata, roomName, LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET) {
    try {
      // 1. Handle name safely with proper fallbacks
      const firstName = userMetadata?.first_name || userMetadata?.firstName || '';
      const lastName = userMetadata?.last_name || userMetadata?.lastName || '';
      console.log(" firstName ", firstName)
      console.log(" lastName ", lastName)
      const userName = firstName || lastName 
        ? `${firstName} ${lastName}`.trim() 
        : 'Unknown User';

        console.log(" userName ", userName)
  
      const token = new AccessToken(
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET,
        {
          identity: userId,
          name: userName,  // Use the properly constructed name
          ttl: '8h'
        }
      );
  
      // 2. Fix metadata serialization
      token.metadata = JSON.stringify({
        email: userMetadata.email,
        email_verified: userMetadata.email_verified,
        first_name: firstName,
        last_name: lastName,
        phone_verified: userMetadata.phone_verified,
        sub: userMetadata.sub,
        user_type: userMetadata.user_type,
        metadata: JSON.stringify({
          avatarUrl: userMetadata.avatarUrl || ""
        })
      });
  
      token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
      });
  
      return token.toJwt();
    } catch (error) {
      console.error('Token generation failed:', error);
      throw new Error('Failed to generate user token');
    }
  }
  
  async addAIParticipant(roomName, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, aiMetadata = {}) {
    try {
      // Generate token with AI metadata
      const token = new AccessToken(
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET,
        {
          identity: `ai-${Date.now()}`,
          name: aiMetadata.name || "AI Assistant",
          ttl: '8h'
        }
      );

      // Set AI-specific metadata
      token.metadata = JSON.stringify({
        ...aiMetadata,
        isAI: true,
        title: aiMetadata.title || "Virtual Agent",
        designation: aiMetadata.designation || "AI Support",
        avatarUrl: aiMetadata.avatarUrl || "https://example.com/default-ai-avatar.jpg"
      });

      token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
      });

      const aiToken = token.toJwt();

      // Connect AI using a separate service (see next section)
      // This should be handled by your AI service
      console.log(`AI token for room ${roomName}: ${aiToken}`);
      console.log("AI metadata:", JSON.stringify(aiMetadata));

      return { success: true, token: aiToken };
    } catch (error) {
      console.error('AI participant setup failed:', error);
      throw new Error('Failed to initialize AI participant');
    }
  }
  

  // async addAIParticipant(roomName, aiMetadata = {}) {
  //   try {
  //     const pc = new RTCPeerConnection();
  //     const { videoTrack, audioTrack } = this.createAIMediaTracks();

  //     pc.addTransceiver(videoTrack, { direction: 'sendonly' });
  //     pc.addTransceiver(audioTrack, { direction: 'sendonly' });

  //     const aiConnection = {
  //       pc,
  //       videoTrack,
  //       audioTrack,
  //       intervals: []
  //     };

  //     this.activeRooms.set(roomName, aiConnection);
  //     return this.handleSignaling(pc, roomName);
  //   } catch (error) {
  //     console.error('AI participant setup failed:', error);
  //     throw new Error('Failed to initialize AI participant');
  //   }
  // }

  createAIMediaTracks() {
    const videoSource = new RTCVideoSource();
    const videoTrack = videoSource.createTrack();
    const audioSource = new RTCAudioSource();
    const audioTrack = audioSource.createTrack();

    // Start generating media
    this.startVideoGeneration(videoSource);
    this.startAudioGeneration(audioSource);

    return { videoTrack, audioTrack };
  }

  startVideoGeneration(videoSource) {
    let frameCount = 0;
    const interval = setInterval(() => {
      try {
        const frame = this.generateVideoFrame(640, 480, frameCount++);
        videoSource.onFrame(frame);
      } catch (error) {
        console.error('Video frame error:', error);
        clearInterval(interval);
      }
    }, 1000 / 30);

    return interval;
  }

  generateVideoFrame(width, height, frameCount) {
    const ySize = width * height;
    const uvSize = (width / 2) * (height / 2);
    const buffer = Buffer.alloc(ySize + uvSize * 2);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
    const phase = (frameCount % 60) / 60 * Math.PI * 2;

    // Apply a smooth radial gradient that shifts in phase
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const value = 128 + Math.sin((dist / maxDist) * 4 * Math.PI + phase) * 40; // smaller amplitude
        buffer[y * width + x] = Math.max(0, Math.min(255, value));
      }
    }

    // Fill UV planes with neutral chroma (grayscale)
    buffer.fill(128, ySize);

    return {
      data: buffer,
      width,
      height,
      rotation: 0,
      format: 'I420'
    };
  }


  startAudioGeneration(audioSource) {
    const interval = setInterval(() => {
      try {
        audioSource.onData({
          samples: new Int16Array(480),
          sampleRate: 48000,
          bitsPerSample: 16,
          channelCount: 1
        });
      } catch (error) {
        console.error('Audio generation error:', error);
        clearInterval(interval);
      }
    }, 10);

    return interval;
  }

  async handleSignaling(pc, roomName) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      return true;
    } catch (error) {
      console.error('Signaling failed:', error);
      this.cleanupRoom(roomName);
      throw new Error('Signaling process failed');
    }
  }

  // In your livekit-service.ts AI participant creation
  async createAIAudioTrack(room) {
    const audioSource = new RTCAudioSource();
    const audioTrack = audioSource.createTrack();

    // Generate actual audio samples (not silent)
    const sampleRate = 48000;
    const samples = new Int16Array(sampleRate / 100); // 10ms of audio
    let phase = 0;

    setInterval(() => {
      // Generate sine wave at 440Hz (A4 tone)
      for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.sin(phase) * 32767;
        phase += (2 * Math.PI * 440) / sampleRate;
      }

      audioSource.onData({
        samples,
        sampleRate,
        bitsPerSample: 16,
        channelCount: 1,
      });
    }, 10);

    // Publish with proper metadata
    await room.localParticipant.publishTrack(audioTrack, {
      name: 'ai-voice',
      source: Track.Source.Microphone,
      metadata: JSON.stringify({ isAI: true, name: "AI AGENT", desingation: "SALEs VP" })
    });
  }

  cleanupRoom(roomName) {
    const connection = this.activeRooms.get(roomName);
    if (connection) {
      connection.intervals.forEach(clearInterval);
      connection.pc.close();
      this.activeRooms.delete(roomName);
    }
  }
}




module.exports = { LiveKitService };