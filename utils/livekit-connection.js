export const waitForConnection = (room, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, timeout);

    if (room.state === ConnectionState.Connected) {
      clearTimeout(timer);
      resolve(true);
    } else {
      room.once('connected', () => {
        clearTimeout(timer);
        resolve(true);
      });
    }
  });
};

export const safeDisconnect = async (room) => {
  try {
    if (room && room.state !== ConnectionState.Disconnected) {
      await room.disconnect();
      console.log('Clean disconnection completed'); 
    }
  } catch (error) {
    console.error('Safe disconnect error:', error);
  }
};