module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { summary } = req.body || {};
  if (!summary) return res.status(400).json({ error: 'Missing summary' });

  const prompt = `Tu es un expert Ikigai et coach de performance mentale. Analyse ces reponses de facon profonde et personnalisee.

REPONSES DU CLIENT:
${summary}

Reponds UNIQUEMENT avec du JSON valide. Voici la structure exacte a respecter:
{
  "aime": {
    "synthese": "3 phrases personnalisees sur ce que cette personne aime vraiment",
    "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"]
  },
  "doue": {
    "synthese": "3 phrases personnalisees sur ses vrais talents",
    "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"]
  },
  "besoin": {
    "synthese": "3 phrases personnalisees sur sa contribution possible au monde",
    "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"]
  },
  "remunere": {
    "synthese": "3 phrases personnalisees sur son potentiel economique",
    "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"]
  },
  "passion": {
    "label": "Passion",
    "spheres": "Aime + Done",
    "analyse": "2-3 phrases sur sa passion profonde",
    "note": "Ce qui lui manque encore pour atteindre son ikigai"
  },
  "mission": {
    "label": "Mission",
    "spheres": "Aime + Besoin",
    "analyse": "2-3 phrases sur sa mission de vie",
    "note": "Ce qui lui manque encore pour atteindre son ikigai"
  },
  "vocation": {
    "label": "Vocation",
    "spheres": "Done + Besoin",
    "analyse": "2-3 phrases sur sa vocation",
    "note": "Ce qui lui manque encore pour atteindre son ikigai"
  },
  "profession": {
    "label": "Profession",
    "spheres": "Done + Remunere",
    "analyse": "2-3 phrases sur son activite economique naturelle",
    "note": "Ce qui lui manque encore pour atteindre son ikigai"
  },
  "ikigai": {
    "introduction": "Une phrase poetique et profondement personnalisee qui capture l essence de cette personne",
    "points": [
      "Premier point de convergence tres concret et specifique",
      "Deuxieme point de convergence concret et actionnable",
      "Troisieme point de convergence avec une opportunite precise"
    ],
    "invitation": "Une invitation finale inspirante et personnelle en 2 phrases"
  }
}`;

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
          { role: 'user', content: prompt }
        ]
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(500).json({ error: raw.slice(0, 300) });
    }

    const data = JSON.parse(raw);
    const text = data.content?.[0]?.text || '';
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');

    if (first === -1 || last === -1) {
      return res.status(500).json({ error: 'Reponse IA invalide', raw: text.slice(0, 200) });
    }

    const parsed = JSON.parse(text.slice(first, last + 1));
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
