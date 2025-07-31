const { createSponsoredChallenge, handleChallengeStatusUpdate, deleteChallengeAndAgentService } =  require('../services/challengeService.service');
const axios = require("axios")


const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split('\n') // or use `.split(',')` if comma-separated
      .map(item => item.trim())
      .filter(Boolean); // removes empty strings
  }
  return [];
};


 const createChallenge = async (req, res) => {
  try {

    const {
      company_name,
      buyer_name,
      scenario_title,
      call_info,
      difficulty,
      industry,
      prospect_background,
      prospect_info,
      ...rest
    } = req.body;


    if (!company_name || !scenario_title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare request body for /agents
    const agentPayload = {
      buyer_name: buyer_name || 'Unknown',
      buyer_company: company_name || "",
      buyer_designation: prospect_info.role || "",
      buyer_personality: prospect_info.personality || "",
      buyer_industry: prospect_info.experience.company || "",
      background: prospect_background || "",
      seller_company:  prospect_info.seller_company || "",
      seller_product: prospect_info.seller_product || "",
      challenges: normalizeToArray(prospect_info.scenario_description),
      // goals: normalizeToArray(prospect_info.goals) || []
      goals: prospect_info.goals || ""
    };



   // const agentResponse = await axios.post('http://alb-tg-ec2-buyerbot-52210291.us-east-2.elb.amazonaws.com/agents', agentPayload);
   
   
   
    // const {
    //   livekit_url,
    //   livekit_api_key,
    //   livekit_api_secret,
    //   agent_id
    // } = agentResponse.data;

    const challengeData = {
      ...req.body,
      livekit_url: "",
      livekit_api_key: "",
      livekit_api_secret: "",
      agent_id: "",
      agent_data: agentPayload
    };

    const newChallenge = await createSponsoredChallenge(challengeData);
    res.status(201).json(newChallenge);
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

 const updateChallengeStatus = async (req, res) => {
  const { id, is_active } = req.body;

  if (!id || typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid id / is_active' });
  }

  try {
    const result = await handleChallengeStatusUpdate(id, is_active);
    return res.status(200).json({ message: 'Challenge status updated', result });
  } catch (error) {
    console.error('Error updating challenge status:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

const deleteChallengeAndAgentController = async (req, res) => {
  const { id, agentId } = req.params;

  try {
    await deleteChallengeAndAgentService(id, agentId);
    res.status(200).json({ message: "Challenge and agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting challenge and agent:", error.message || error);
    res.status(500).json({ error: "Failed to delete challenge and agent" });
  }
};

module.exports = {
  createChallenge,
  updateChallengeStatus,
  deleteChallengeAndAgentController
}