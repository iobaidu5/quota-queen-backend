const scoreCardService = require('../services/scorecardService');

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const get = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const { data, error } = await supabase
      .from('results')
      .select('result_score, payload')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch latest result' });
    }

    return res.status(200).json({ result: data });
  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getResultHistory = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const { data, error } = await supabase
      .from("results")
      .select("result_score, payload, timestamp")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch result history" });
    }

    return res.status(200).json({ results: data });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const create = async (req, res) => {
  const { userId, roomId } = req.params;

  if (!roomId || !userId) {
    return res.status(400).json({ error: 'roomId and userId are required' });
  }

  try {
    const result = await scoreCardService.create(userId, roomId);
    if (result.success) {
      return res.status(200).json({ message: 'Result Initialized successfully' });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const postResult = async (req, res) => {
  const { roomId } = req.params;
  const data = req.body;
  const userId = data.user_id;

  if (!userId || !roomId || !data) {
    return res.status(400).json({ error: 'userId, roomId and body data are required' });
  }

  try {
    const result = await scoreCardService.post(userId, roomId, data);
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
  create,
  get,
  getResultHistory
};
