const supabase = require('../config/supabase');
const axios = require("axios")

const createSponsoredChallenge = async (challengeData) => {
  try {
    const payload = {
      company_name: challengeData.company_name,
      product_name: challengeData.seller_product,
      company_description: challengeData.company_description,
      scenario_title: challengeData.scenario_title,
      scenario_description: challengeData.scenario_description,
      prospect_background: challengeData.prospect_background,
      research_notes: challengeData.research_notes,
      call_info: challengeData.call_info,
      company_info: {
        address: challengeData.company_info?.address,
        phone: challengeData.company_info?.phone,
        website: challengeData.company_info?.website
      },
      prospect_info: {
        name: challengeData.prospect_info?.name,
        role: challengeData.prospect_info?.role,
        email: challengeData.prospect_info?.email,
        phone: challengeData.prospect_info?.phone
      },
      industry: challengeData.industry,
      difficulty: challengeData.difficulty,
      prize_description: challengeData.prize_description,
      prize_worth: challengeData.prize_worth,
      additional_instructions: challengeData.additional_instructions,
      livekit_url: challengeData.livekit_url ,
      livekit_api_key: challengeData.livekit_api_key,
      livekit_api_secret: challengeData.livekit_api_secret,
      agent_id: challengeData.agent_id,
      agent_data: challengeData.agent_data,
      is_active: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sponsored_challenges')
      .insert([payload])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Supabase Error:', error);
    throw new Error('Failed to create challenge in database');
  }
};

const handleChallengeStatusUpdate = async (id, is_active) => {
  const updatePayload = { is_active };

  if (is_active) {
    // ✅ ACTIVATION LOGIC
    const { data: challengeData, error: fetchError } = await supabase
      .from('sponsored_challenges')
      .select('agent_data')
      .eq('id', id)
      .single();

    if (fetchError || !challengeData?.agent_data) {
      throw new Error('Failed to fetch agent_data');
    }

    const agent_data = challengeData.agent_data;

    const agentResponse = await axios.post(
      'http://alb-tg-ec2-buyerbot-52210291.us-east-2.elb.amazonaws.com/agents',
      agent_data
    );

    const {
      livekit_url,
      livekit_api_key,
      livekit_api_secret,
      agent_id
    } = agentResponse.data;

    Object.assign(updatePayload, {
      livekit_url,
      livekit_api_key,
      livekit_api_secret,
      agent_id
    });

  } else {
    // ✅ DEACTIVATION LOGIC
    const { data: challengeData, error: fetchError } = await supabase
      .from('sponsored_challenges')
      .select('agent_id')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error('Failed to fetch agent_id');

    const agent_id = challengeData?.agent_id;

    if (agent_id) {
      await axios.delete(`http://alb-tg-ec2-buyerbot-52210291.us-east-2.elb.amazonaws.com/agents/${agent_id}`);
    }

    Object.assign(updatePayload, {
      livekit_url: "",
      livekit_api_key: "",
      livekit_api_secret: "",
      agent_id: ""
    });
  }

  const { error: updateError } = await supabase
    .from('sponsored_challenges')
    .update(updatePayload)
    .eq('id', id);

  if (updateError) throw new Error(updateError.message);

  return { id, ...updatePayload };
};

const deleteChallengeAndAgentService = async (id, agentId) => {
  try {
    // Delete the agent from external service
    await axios.delete(`http://alb-tg-ec2-buyerbot-52210291.us-east-2.elb.amazonaws.com/agents/${agentId}`);

    // Delete the challenge from Supabase
    const { error } = await supabase
      .from("sponsored_challenges")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createSponsoredChallenge,
  handleChallengeStatusUpdate,
  deleteChallengeAndAgentService
}