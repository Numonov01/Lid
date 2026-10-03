// Forma va API bitta domenda (shu Vercel loyihasi), shuning uchun
// nisbiy yo'l ishlatiladi — CORS sozlash shart emas.
const PROXY_URL = "/api/lead";

// Lidni proxy orqali CRM'ga yuboradi.
// Qaytaradi: { ok: boolean, data: object, status: number }
export async function sendLead({ provider, account, product, name, phone }) {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      api_key: account.api_key,
      stream: product.stream,
      offer_id: product.offer,
      name,
      phone,
    }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { raw: text };
  }

  // CRM muvaffaqiyatda {ok:true} yoki {success:true} qaytaradi,
  // xatoda {success:false, message:"..."} qaytaradi — HTTP status 200
  // bo'lsa ham xato bo'lishi mumkin, shuning uchun ikkalasini ham tekshiramiz.
  const ok = res.ok && data && data.success !== false && data.ok !== false;

  return { ok, data, status: res.status };
}
