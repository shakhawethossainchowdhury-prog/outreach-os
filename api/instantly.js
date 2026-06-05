export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { path } = req.query;
  const apiKey = req.headers['x-instantly-key'];
  if (!apiKey) { res.status(401).json({ error: 'No API key' }); return; }

  const endpoint = path ? path.join('/') : 'campaigns';
  const queryString = Object.entries(req.query)
    .filter(([k]) => k !== 'path')
    .map(([k,v]) => `${k}=${v}`).join('&');

  const url = `https://api.instantly.ai/api/v2/${endpoint}${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
