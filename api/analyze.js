module.exports = async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'dis bonjour' }]
    })
  });

  const text = await response.text();
  return res.status(200).json({ 
    status: response.status, 
    key_present: !!key,
    key_start: key ? key.slice(0,20) : 'ABSENTE',
    response: text.slice(0, 500)
  });
};
