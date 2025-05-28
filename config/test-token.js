const { AccessToken } = require('livekit-server-sdk');

const apiKey = 'APIrJgG2qdj9DUe';
const secret = 'hXzsU3ffu5pfeZZ8rEiEiZle3rRI4w364gbr1fE0k52E';

const token = new AccessToken(apiKey, secret, {
  identity: 'test-user',
  name: 'Test User',
});

token.addGrant({
  roomJoin: true,
  room: 'test-room',
  canPublish: true,
  canSubscribe: true,
});

(async () => {
  try {
    const jwt = await token.toJwt();
    console.log('Generated Token:', jwt);
  } catch (error) {
    console.error('Error generating token:', error);
  }
})();
