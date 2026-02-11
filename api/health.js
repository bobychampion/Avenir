export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const hasToken = Boolean(process.env.HF_TOKEN);
  const model = process.env.HF_MODEL || 'black-forest-labs/FLUX.1-schnell';
  res.status(200).json({ ok: true, hasToken, model });
}
