const scoreCardService = require('../services/scorecardService');

const postResult = async (req, res) => {
  const { roomId } = req.params;
  const data = req.body;

  if (!roomId || !data) {
    return res.status(400).json({ error: 'roomId and body data are required' });
  }

  try {
    const result = await scoreCardService.post(roomId, data);
    if (result.success) {
      return res.status(200).json({ message: 'Result stored successfully' });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  postResult,
};
