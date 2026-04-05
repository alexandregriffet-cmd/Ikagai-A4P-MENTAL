module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

if (!process.env.ANTHROPIC_API_KEY) {
return res.status(500).json({ error: ‘ANTHROPIC_API_KEY manquante dans Vercel’ });
}

const { summary } = req.body || {};
if (!summary) return res.status(400).json({ error: ‘Missing summary’ });

const prompt = `Tu es un expert Ikigai. Analyse ces reponses et reponds UNIQUEMENT avec du JSON valide, sans aucun texte avant ou apres.

REPONSES:
${summary}

JSON attendu:
{
“aime”:{“synthese”:“3 phrases personnalisees”,“mots_cles”:[“mot1”,“mot2”,“mot3”,“mot4”,“mot5”]},
“doue”:{“synthese”:“3 phrases personnalisees”,“mots_cles”:[“mot1”,“mot2”,“mot3”,“mot4”,“mot5”]},
“besoin”:{“synthese”:“3 phrases personnalisees”,“mots_cles”:[“mot1”,“mot2”,“mot3”,“mot4”,“mot5”]},
“remunere”:{“synthese”:“3 phrases personnalisees”,“mots_cles”:[“mot1”,“mot2”,“mot3”,“mot4”,“mot5”]},
“passion”:{“label”:“Passion”,“spheres”:“Aime + Done”,“analyse”:“2 phrases”,“note”:“ce qui manque”},
“mission”:{“label”:“Mission”,“spheres”:“Aime + Besoin”,“analyse”:“2 phrases”,“note”:“ce qui manque”},
“vocation”:{“label”:“Vocation”,“spheres”:“Done + Besoin”,“analyse”:“2 phrases”,“note”:“ce qui manque”},
“profession”:{“label”:“Profession”,“spheres”:“Done + Remunere”,“analyse”:“2 phrases”,“note”:“ce qui manque”},
“ikigai”:{“introduction”:“phrase poetique”,“points”:[“point1”,“point2”,“point3”],“invitation”:“invitation finale”}
}`;

try {
const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’
},
body: JSON.stringify({
model: ‘claude-3-5-sonnet-20241022’,
max_tokens: 2000,
messages: [
{ role: ‘user’, content: prompt },
{ role: ‘assistant’, content: ‘{’ }
]
})
});

```
const raw = await response.text();

if (!response.ok) {
  return res.status(500).json({ error: 'Anthropic ' + response.status, detail: raw.slice(0, 500) });
}

const data = JSON.parse(raw);
const text = '{' + (data.content?.[0]?.text || '');
const last = text.lastIndexOf('}');
if (last === -1) return res.status(500).json({ error: 'Reponse invalide', raw: text.slice(0, 300) });

const parsed = JSON.parse(text.slice(0, last + 1));
return res.status(200).json(parsed);
```

} catch (e) {
return res.status(500).json({ error: e.message });
}
};
