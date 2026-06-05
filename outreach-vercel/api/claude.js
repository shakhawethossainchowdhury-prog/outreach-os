export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { messages, max_tokens = 1000 } = req.body;
  if (!messages) { res.status(400).json({ error: 'messages required' }); return; }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) { res.status(500).json({ error: 'Groq key not configured' }); return; }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens,
        messages: messages.map(m => ({
          role: m.role,
          content: Array.isArray(m.content)
            ? m.content.map(c => c.text || '').join('') 
            : m.content
        }))
      })
    });
    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message || 'Groq error' });
      return;
    }
    // Convert Groq response format to Anthropic format so frontend works unchanged
    res.status(200).json({
      content: [{ type: 'text', text: data.choices[0].message.content }]
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
