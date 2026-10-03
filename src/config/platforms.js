// Platformalar (CRM'lar). Har bir platformada bir nechta akkaunt bo'lishi
// mumkin (masalan bir nechta API key). Yangi akkaunt qo'shish uchun
// tegishli platformaning `accounts` ro'yxatiga bitta obyekt qo'shing.
// Yangi mahsulot qo'shish uchun akkauntning `products` ro'yxatiga qator qo'shing.

export const DEFAULT_PLATFORM = "xavi";

export const PLATFORM_LABELS = { fayzli: "Fayzlibazar", xavi: "Xavi.uz" };

export const PLATFORMS = {
  fayzli: {
    accounts: [
      {
        id: "tokhir",
        label: "Tokhir",
        api_key: "9880811763797215",
        products: [
          { label: "Zepter Nabor 3 tasi 1 da", stream: "azTYn17b", offer: 261 },
          { label: "PINK PASSION NABORI", stream: "SbRagE16", offer: 151 },
          { label: "ZERO FIT — Detox kukuni (100 gr)", stream: "GmTl7RGt", offer: 222 },
          { label: "Sidr Kukuni", stream: "AOZGdVDr", offer: 273 },
          { label: "O'tqop (dimlanish) uchun zbor", stream: "CIURG2cE", offer: 265 },
          { label: "Louis Vuitton (LV) atirlari 1+1 45ml", stream: "xufCmVdl", offer: 198 },
          { label: "ZERO FIT — Detox kukuni (new)", stream: "3Hr0sHKr", offer: 222 },
          { label: "Daloilul Hayrot", stream: "XX18XYxI", offer: 251 },
          { label: "Louis Vuitton (LV) atirlari 1+1 45ml (3)", stream: "Ux04M3SX", offer: 198 },
          { label: "Feramon 1+1", stream: "pqnHOnFk", offer: 282 },
          { label: "Louis Vuitton (LV) atirlari 1+1 45ml (4)", stream: "aWnLHTAm", offer: 198 },
          { label: "Tamaki Tashlashga Yordam Beruvchi Kukun", stream: "I0Ljgx7P", offer: 288 },
          { label: "Katushka Aparat", stream: "rphyb19o", offer: 302 },
          { label: "SCORPION BAUME DE NERFS — 100 GR", stream: "3ASBfwIF", offer: 295 },
        ],
      },
      {
        id: "zukhra",
        label: "Zukhra",
        api_key: "5741531778327563",
        products: [
          { label: "Keng rizq yuli", stream: "ovLGxEP7", offer: 163 },
          { label: "Feramon (Feromon)", stream: "ipRWXTV1", offer: 169 },
          { label: "Ashaab 100 mlg Dubai", stream: "VEJh9lKP", offer: 197 },
          { label: "Simfoniy — Louis Vuitton unisex 1+1 45ml", stream: "bTvjdhKx", offer: 199 },
          { label: "Louis Vuitton (LV) atirlari 1+1 45ml", stream: "dDGDj5XA", offer: 198 },
          { label: "Xashoratlar uchun raketka", stream: "oO90hdxw", offer: 184 },
          { label: "AVTO HUD Speedometer", stream: "dfdIMFH5", offer: 179 },
          { label: "Salitsil (salyuni) kislota", stream: "BK48hHDD", offer: 201 },
          { label: "Auonam — soch parvarishi uchun", stream: "wZp5z1a7", offer: 167 },
          { label: "Killer", stream: "3evCM615", offer: 200 },
          { label: "Quvvat asal", stream: "r7KT0Q5M", offer: 133 },
          { label: "Fursan Atir 100 mlg Original Dubai", stream: "GMxsGUbf", offer: 208 },
          { label: "Mini Blendr", stream: "To2zyPgM", offer: 205 },
          { label: "Feramon (1+1) Ayollar va Erkaklar", stream: "jRqD4lar", offer: 203 },
          { label: "Peacholic White Body Tone Up Serum", stream: "NsqltJ2W", offer: 207 },
          { label: "Polycarbon Soat", stream: "ElKBmXM9", offer: 210 },
          { label: "Gerb Soat", stream: "5CovW8FU", offer: 226 },
          { label: "Hydrating Perfect Cream", stream: "9oQ1Dqpd", offer: 194 },
          { label: "Avtomobil uchun katta asvijitel", stream: "no0pxJcz", offer: 181 },
          { label: "Mukoshafatul qulub — Qalblar kashfiyoti", stream: "ydpyK90f", offer: 15 },
          { label: "Qur'oni Karim manolarini tarjimasi", stream: "r3j2ZuqM", offer: 252 },
          { label: "Al-Quran", stream: "U4ZaKfLK", offer: 253 },
          { label: "TOYTO-L3 Starfighter Dron", stream: "5gQqfSDe", offer: 216 },
          { label: "Dyson Fen", stream: "Ami2Q8sM", offer: 42 },
          { label: "Sidr Kukuni 79", stream: "qvJizBEt", offer: 278 },
          { label: "Tamaki Tashlashga Yordam Beruvchi Kukun", stream: "8iklqQDR", offer: 288 },
          { label: "HB-P18 Fonar", stream: "pSVMNwCq", offer: 4 },
          { label: "Wi-Fi Simsiz mini-kamera", stream: "DyBaauPK", offer: 150 },
          { label: "Nafis taqinchoqlar to'plami", stream: "uvaihFZU", offer: 233 },
          { label: "Magic Sand — bolajonlar uchun", stream: "c0pexHPD", offer: 312 },
          { label: "Innova kreatin shampun", stream: "Nxpz1egn", offer: 317 },
        ],
      },
    ],
  },
  xavi: {
    accounts: [
      {
        id: "tokhir",
        label: "Tokhir",
        api_key: "8235421784599192",
        products: [
          { label: "13 xil premium atir toplami", stream: "bmiFVhtk", offer: 278 },
          { label: "Feramon 21+ (30ML)", stream: "FJ0lBOwk", offer: 195 },
          { label: "Ozdiruvchi choy", stream: "oFQHr6By", offer: 255 },
          { label: "Guruch Nabor", stream: "3V4cqpBv", offer: 105 },
          { label: "Hujjat va kitoblar uchun papka", stream: "hhlxfARN", offer: 259 },
          { label: "Skeleton soat", stream: "UNStErBm", offer: 262 },
          { label: "Deyl Karnegi 4 ta qism", stream: "4EJKKR5y", offer: 60 },
          { label: "Harvard Metodi 129", stream: "0C6l1rLN", offer: 285 },
          { label: "Harvard Metodi 109", stream: "lKzRzx17", offer: 289 },
        ],
      },
    ],
  },
};
