// Vercel Serverless Function — Xavi.uz va FayzliBazar.uz CRM'lari uchun CORS proxy
// Brauzer (artifact) shu endpoint'ga so'rov yuboradi, bu funksiya esa
// server-server (CORS cheklovisiz) tegishli CRM API'siga jo'natadi.

// Qo'llab-quvvatlanadigan provayderlar va ularning API domenlari.
// Ikkalasi ham bir xil parametrlar bilan ishlaydi: api_key, stream, offer_id, name, phone.
const PROVIDERS = {
  xavi: "https://api.Xavi.uz/create",
  fayzli: "https://api.FayzliBazar.uz/create",
};

export default async function handler(req, res) {
  // CORS ruxsati — artifact (claude.ai) va boshqa manbalardan kirishga ruxsat
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Brauzer avval OPTIONS so'rovini yuboradi (preflight) — shunga javob beramiz
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Faqat POST so'rovlar qabul qilinadi" });
  }

  try {
    const { name, phone, api_key, stream, offer_id, provider } = req.body;

    if (!name || !phone || !api_key || !stream || !offer_id) {
      return res.status(400).json({
        error: "name, phone, api_key, stream, offer_id maydonlari majburiy",
      });
    }

    const targetUrl = PROVIDERS[provider] || PROVIDERS.xavi;

    const params = new URLSearchParams();
    params.append("api_key", api_key);
    params.append("stream", stream);
    params.append("offer_id", offer_id);
    params.append("name", name);
    params.append("phone", phone);

    const crmResponse = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const text = await crmResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(crmResponse.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Server xatosi: " + err.message });
  }
}
