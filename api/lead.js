// Vercel Serverless Function — Xavi.uz CRM uchun CORS proxy
// Brauzer (artifact) shu endpoint'ga so'rov yuboradi, bu funksiya esa
// server-server (CORS cheklovisiz) Xavi.uz API'ga jo'natadi.

export default async function handler(req, res) {
  // CORS ruxsati — artifact (claude.ai) va boshqa manbalardan kirishga ruxsat
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Brauzer avval OPTIONS so'rovini yuboradi (preflight) — shunga javob beramiz
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Faqat POST so\'rovlar qabul qilinadi' });
  }

  try {
    const { name, phone, api_key, stream, offer_id } = req.body;

    if (!name || !phone || !api_key || !stream || !offer_id) {
      return res.status(400).json({ error: 'name, phone, api_key, stream, offer_id maydonlari majburiy' });
    }

    const params = new URLSearchParams();
    params.append('api_key', api_key);
    params.append('stream', stream);
    params.append('offer_id', offer_id);
    params.append('name', name);
    params.append('phone', phone);

    const xaviResponse = await fetch('https://api.Xavi.uz/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = await xaviResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(xaviResponse.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
}
