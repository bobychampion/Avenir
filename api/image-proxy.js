export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.HF_TOKEN;
  const defaultModel = process.env.HF_MODEL || 'black-forest-labs/FLUX.1-schnell';
  if (!token) {
    res.status(500).json({ error: 'Missing HF_TOKEN on server.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }

  const prompt = body?.prompt;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required.' });
    return;
  }

  const modelKey = body?.model;
  const allowlist = {
    'flux-schnell': 'black-forest-labs/FLUX.1-schnell',
    'sdxl-turbo': 'stabilityai/sdxl-turbo',
    'sdxl-lightning': 'stabilityai/sdxl-lightning'
  };
  const model = allowlist[modelKey] || defaultModel;

  try {
    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!hfResponse.ok) {
      const text = await hfResponse.text();
      res.status(hfResponse.status).json({ error: text || 'Hugging Face error' });
      return;
    }

    const contentType = hfResponse.headers.get('content-type') || 'image/png';
    const arrayBuffer = await hfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', contentType);
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
}
