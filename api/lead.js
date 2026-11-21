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

    if (provider === "sotuvchi") {
      return sendSotuvchi(res, { name, phone, api_key, stream, offer_id });
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

// Sotuvchi.com — API v2 (sotuvchi-api-guide.md, 4-bo'lim).
// Buyurtma boshqa domenda: sotuvchi.com/api (apiv3 emas). Kalit faqat
// "Authorization: Bearer" sarlavhasida — URL'da server logida qolmasligi uchun.
// Telefon "998901234567" ko'rinishida (+ belgisiz). Muvaffaqiyat: 201 {ok, id}.
const SOTUVCHI_ORDER_URL = "https://sotuvchi.com/api/v2/order";

async function sendSotuvchi(res, { name, phone, api_key, stream, offer_id }) {
  const crmResponse = await fetch(SOTUVCHI_ORDER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + api_key,
    },
    body: JSON.stringify({
      offer_id,
      stream,
      name,
      phone: String(phone).replace(/\D/g, ""),
    }),
  });

  const text = await crmResponse.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  // 409 duplicate_order — shu raqam shu offerga allaqachon qabul qilingan.
  // Hujjat tavsiyasi: xato emas, qayta yubormang — shuning uchun muvaffaqiyat
  // deb qaytaramiz (aks holda tarixda "qayta yuborish" tugmasi chiqib qoladi).
  if (crmResponse.status === 409 && data && data.code === "duplicate_order") {
    return res.status(200).json({ ...data, ok: true, duplicate: true });
  }

  // Xato: {ok:false, code, message, errors?}. validation_failed'da qaysi maydon
  // xatoligini ham xabarga qo'shamiz, kodni esa boshiga — forma shuni ko'rsatadi.
  if (!crmResponse.ok && data && data.code) {
    const details = data.errors
      ? " — " +
        Object.entries(data.errors)
          .map(([field, msg]) => field + ": " + [].concat(msg).join(", "))
          .join("; ")
      : "";
    data.message = data.code + (data.message ? " (" + data.message + ")" : "") + details;
  }

  return res.status(crmResponse.status).json(data);
}
