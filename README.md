# Lead Proxy — Xavi.uz CRM uchun

Bu — bitta faylli serverless proxy. Vazifasi: artifact (brauzer) dan kelgan
so'rovni server tomonidan Xavi.uz API'ga yo'naltirish, CORS muammosisiz.

## Deploy qilish (Vercel, 2 daqiqa)

1. [vercel.com](https://vercel.com) ga GitHub orqali kiring (bepul akkaunt yetarli)
2. Bu papkani (`lead-proxy`) GitHub'ga yuklang (yangi repo yarating)
   yoki Vercel CLI orqali to'g'ridan-to'g'ri deploy qiling:
   ```
   npm i -g vercel
   cd lead-proxy
   vercel
   ```
3. Deploy tugagach, Vercel sizga shunday domen beradi:
   `https://lead-proxy-xxxxx.vercel.app`
4. Sizning endpoint manzilingiz:
   `https://lead-proxy-xxxxx.vercel.app/api/lead`

## Formadagi API_URL'ni yangilash

Artifact (forma) ichidagi `API_URL` qiymatini shu yangi manzilga almashtiring:

```js
const API_URL = 'https://lead-proxy-xxxxx.vercel.app/api/lead';
```

Forma endi `api_key`, `stream`, `offer_id`, `name`, `phone` larni shu proxy'ga
JSON sifatida yuboradi, proxy esa ularni Xavi.uz kutgan formatda
(`application/x-www-form-urlencoded`) qayta yuboradi.

## Muqobil: o'zingizning serveringizga qo'shish

Agar sizda allaqachon Node.js/Express server bo'lsa (masalan fayzlibazar.uz
bilan bir joyda), shu faylni alohida deploy qilish shart emas — xuddi shu
mantiqni (`api/lead.js` ichidagi kodni) o'z backend'ingizga bitta route
sifatida qo'shishingiz mumkin:

```js
app.post('/api/lead', async (req, res) => {
  // yuqoridagi handler mantig'i
});
```
