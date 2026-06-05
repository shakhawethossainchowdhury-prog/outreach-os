export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-instantly-key');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const apiKey = req.headers['x-instantly-key'];
  if (!apiKey) { res.status(401).json({ error: 'No API key provided' }); return; }

  const { action, campaign_id } = req.query;

  try {
    let url;
    if (action === 'sequences' && campaign_id) {
      // Fetch email sequences for a specific campaign
      url = `https://api.instantly.ai/api/v2/campaigns/${campaign_id}`;
    } else {
      // Fetch all campaigns
      url = 'https://api.instantly.ai/api/v2/campaigns?limit=100';
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { res.status(500).json({ error: 'Invalid response from Instantly', raw: text.substring(0,200) }); return; }

    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
