export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

if (!process.env.ANTHROPIC_API_KEY) {
return res.status(500).json({ error: ‘Clé API manquante dans Vercel Environment Variables’ });
}

const { summary } = req.body || {};
if (!summary) return res.status(400).json({ error: ‘Missing summary’ });

const prompt = `Tu es un expert Ikigai. Analyse ces reponses et reponds UNIQUEMENT avec du JSON valide.

REPONSES:
${summary}

STRUCTURE JSON ATTENDUE:
{
“aime”:{“synthese”:“analyse 3 phrases”,“mots_cles”:[“a”,“b”,“c”,“d”,“e”]},
“doue”:{“synthese”:“analyse 3 phrases”,“mots_cles”:[“a”,“b”,“c”,“d”,“e”]},
“besoin”:{“synthese”:“analyse 3 phrases”,“mots_cles”:[“a”,“b”,“c”,“d”,“e”]},
“remunere”:{“synthese”:“analyse 3 phrases”,“mots_cles”:[“a”,“b”,“c”,“d”,“e”]},
“passion”:{“label”:“Passion”,“spheres”:“Aime + Done”,“analyse”:“analyse”,“note”:“ce qui manque”},
“mission”:{“label”:“Mission”,“spheres”:“Aime + Besoin”,“analyse”:“analyse”,“note”:“ce qui manque”},
“vocation”:{“label”:“Vocation”,“spheres”:“Done + Besoin”,“analyse”:“analyse”,“note”:“ce qui manque”},
“profession”:{“label”:“Profession”,“spheres”:“Done + Remunere”,“analyse”:“analyse”,“note”:“ce qui manque”},
“ikigai”:{“introduction”:“phrase poetique”,“points”:[“point1”,“point2”,“point3”],“invitation”:“invitation”}
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
model: ‘claude-sonnet-4-5’,
max_tokens: 2000,
messages: [
{ role: ‘user’, content: prompt },
{ role: ‘assistant’, content: ‘{’ }
]
})
});

```
const responseText = await response.text();

if (!response.ok) {
  return res.status(500).json({ 
    error: 'Anthropic ' + response.status,
    detail: responseText.slice(0, 300)
  });
}

const data = JSON.parse(responseText);
const text = '{' + (data.content?.[0]?.text || '');
const last = text.lastIndexOf('}');
if (last === -1) return res.status(500).json({ error: 'JSON invalide', raw: text.slice(0, 200) });

const parsed = JSON.parse(text.slice(0, last + 1));
return res.status(200).json(parsed);
```

} catch (e) {
return res.status(500).json({ error: e.message });
}
}
