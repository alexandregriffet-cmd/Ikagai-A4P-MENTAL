module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { summary } = req.body || {};
    
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: 'Reponds uniquement en JSON valide sans aucun texte avant ou apres.',
        messages: [{ role: 'user', content: 'Analyse ikigai:\n' + summary + '\n\nJSON: {"aime":{"synthese":"texte","mots_cles":["a","b","c","d","e"]},"doue":{"synthese":"texte","mots_cles":["a","b","c","d","e"]},"besoin":{"synthese":"texte","mots_cles":["a","b","c","d","e"]},"remunere":{"synthese":"texte","mots_cles":["a","b","c","d","e"]},"passion":{"label":"Passion","spheres":"Aime+Done","analyse":"texte","note":"texte"},"mission":{"label":"Mission","spheres":"Aime+Besoin","analyse":"texte","note":"texte"},"vocation":{"label":"Vocation","spheres":"Done+Besoin","analyse":"texte","note":"texte"},"profession":{"label":"Profession","spheres":"Done+Remunere","analyse":"texte","note":"texte"},"ikigai":{"introduction":"texte","points":["p1","p2","p3"],"invitation":"texte"}}' }]
      })
    });

    const raw = await r.text();
    if (!r.ok) return res.status(200).json({ error: 'Anthropic: ' + raw.slice(0, 200) });

    const data = JSON.parse(raw);
    const txt = data.content[0].text;
    const f = txt.indexOf('{');
    const l = txt.lastIndexOf('}');
    const result = JSON.parse(txt.slice(f, l + 1));
    return res.status(200).json(result);

  } catch(e) {
    return res.status(200).json({ error: e.message });
  }
};
