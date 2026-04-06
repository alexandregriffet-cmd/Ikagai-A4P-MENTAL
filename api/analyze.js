module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
        system: 'Tu es un expert Ikigai. Reponds UNIQUEMENT avec du JSON valide. Aucun texte avant ou apres le JSON.',
        messages: [{ role: 'user', content: `Analyse ces reponses Ikigai et reponds en JSON:\n\n${summary}\n\nStructure JSON requise:\n{"aime":{"synthese":"analyse","mots_cles":["a","b","c","d","e"]},"doue":{"synthese":"analyse","mots_cles":["a","b","c","d","e"]},"besoin":{"synthese":"analyse","mots_cles":["a","b","c","d","e"]},"remunere":{"synthese":"analyse","mots_cles":["a","b","c","d","e"]},"passion":{"label":"Passion","spheres":"Aime + Done","analyse":"analyse","note":"note"},"mission":{"label":"Mission","spheres":"Aime + Besoin","analyse":"analyse","note":"note"},"vocation":{"label":"Vocation","spheres":"Done + Besoin","analyse":"analyse","note":"note"},"profession":{"label":"Profession","spheres":"Done + Remunere","analyse":"analyse","note":"note"},"ikigai":{"introduction":"intro","points":["p1","p2","p3"],"invitation":"invitation"}}` }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'API error ' + response.status, detail: err.slice(0, 200) });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first === -1 || last === -1) {
      return res.status(500).json({ error: 'No JSON', raw: text.slice(0, 200) });
    }
    const parsed = JSON.parse(text.slice(first, last + 1));
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
