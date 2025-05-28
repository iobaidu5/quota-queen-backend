const { AccessToken } = require('livekit-server-sdk');

class LiveKitService {
  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY;
    this.secret = process.env.LIVEKIT_SECRET_KEY;
  }

  // generateToken(userId, roomName) {
  //   const token = new AccessToken(this.apiKey, this.secret, {
  //     identity: userId,
  //     name: userId,
  //   });

  //   token.addGrant({
  //     roomJoin: true,
  //     room: roomName,
  //     canPublish: true,
  //     canSubscribe: true,
  //   });

  //   console.log("token.toJwt() -> ", token.toJwt())

  //   return token.toJwt();
  // }

  generateToken(userId, roomName) {
    const token = new AccessToken(this.apiKey, this.secret, {
      identity: userId,
      name: 'User-' + userId, // Add recognizable name
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: false,
    });

    const jwt = token.toJwt();
    console.log("Generated JWT:", jwt);
    return jwt;
  }
}

module.exports = new LiveKitService();
