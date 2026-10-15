import { PLATFORMS, PLATFORM_LABELS } from "../config/platforms.js";

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
      phone: normalizePhone(phone),
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

// CRM raqamni faqat "+998XXXXXXXXX" ko'rinishida qabul qiladi:
// "90 123 45 67" yoki "998901234567" kabi yozuvlarni shu ko'rinishga keltiradi
export function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9) return "+998" + digits;
  if (digits.length === 12 && digits.startsWith("998")) return "+" + digits;
  return phone.trim();
}

// CRM ishlamay qolganda JSON o'rniga HTML sahifa qaytaradi (masalan 503) —
// butun HTML'ni ko'rsatmaslik uchun faqat sarlavhasi olinadi
export function errorText(data, status) {
  const text = data.message || data.error || data.raw || String(status);
  if (!/<html/i.test(text)) return text;
  const title = (text.match(/<title>([^<]*)<\/title>/i) || [])[1];
  return (
    "CRM serveri javob bermayapti (" + (title ? title.trim() : status) +
    "). Birozdan keyin qayta urinib ko'ring."
  );
}

// Tarixdagi yozuv qaysi platforma / akkaunt / mahsulotga yuborilganini topadi.
// Yangi yozuvlarda `target` saqlanadi; eskilarida esa nomlar bo'yicha qidiriladi.
// Qaytaradi: { provider, account, product } yoki topilmasa null
export function resolveTarget(item) {
  if (item.target) {
    const { provider, accountId, stream, offer } = item.target;
    const account = PLATFORMS[provider]?.accounts.find((a) => a.id === accountId);
    return account ? { provider, account, product: { stream, offer } } : null;
  }
  for (const [provider, platform] of Object.entries(PLATFORMS)) {
    for (const account of platform.accounts) {
      const label = (PLATFORM_LABELS[provider] || provider) + " (" + account.label + ")";
      if (label !== item.providerLabel) continue;
      const product = account.products.find((p) => p.label === item.product);
      if (product) return { provider, account, product };
    }
  }
  return null;
}
