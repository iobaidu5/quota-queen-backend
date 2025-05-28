const fs = require('fs');
const path = require('path');

module.exports = {
  post: async (roomId, data) => {
    try {
      const dir = path.join(__dirname, '..', 'results');

      // Create results directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const filePath = path.join(dir, `${roomId}.json`);
      const formattedData = {
        roomId,
        timestamp: new Date().toISOString(),
        payload: data
      };

      fs.writeFileSync(filePath, JSON.stringify(formattedData, null, 2), 'utf8');
      console.log(`Result data saved for room: ${roomId}`);
      return { success: true, message: 'Data stored successfully' };

    } catch (error) {
      console.error('Error writing result data:', error);
      return { success: false, error: 'Failed to write result data' };
    }
  }
};
