module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { summary } = req.body || {};
  if (!summary) return res.status(400).json({ error: 'Missing summary' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: summary },
          { role: 'assistant', content: '{' }
        ]
      })
    });

    const raw = await response.text();
    if (!response.ok) return res.status(500).json({ error: raw.slice(0, 300) });

    const data = JSON.parse(raw);
    const text = '{' + (data.content?.[0]?.text || '');
    const last = text.lastIndexOf('}');
    if (last === -1) return res.status(500).json({ error: 'JSON invalide' });

    return res.status(200).json(JSON.parse(text.slice(0, last + 1)));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
