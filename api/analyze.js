export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const { summary } = req.body;
if (!summary) return res.status(400).json({ error: ‘Missing summary’ });

const prompt = `Tu es un expert Ikigaï et coach de performance mentale A4P Mental.

Voici les réponses d’une personne au questionnaire Ikigaï :

${summary}

Analyse ces réponses de façon profonde et personnalisée. Réponds UNIQUEMENT en JSON valide.`;

try {
const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’
},
body: JSON.stringify({
model: ‘claude-opus-4-5’,
max_tokens: 2000,
messages: [
{ role: ‘user’, content: prompt },
{ role: ‘assistant’, content: ‘{’ }
]
})
});

```
if (!response.ok) {
  const err = await response.text();
  return res.status(500).json({ error: err });
}

const data = await response.json();
const text = '{' + (data.content?.[0]?.text || '');
const last = text.lastIndexOf('}');
const parsed = JSON.parse(text.slice(0, last + 1));
return res.status(200).json(parsed);
```

} catch (e) {
return res.status(500).json({ error: e.message });
}
}
