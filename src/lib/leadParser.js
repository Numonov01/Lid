// Jadval qatorlaridan (CSV / Excel / CRM'dan nusxalangan ro'yxat) lidlarni
// ajratadi: telefonni "+998XXXXXXXXX" ko'rinishiga keltiradi, takrorlarni
// olib tashlaydi va tuzatib bo'lmaydigan raqamlarni alohida qaytaradi.

// CRM ro'yxatidagi sana ustuni, masalan "12-okt, 2026, 19:50:27"
const CRM_DATE = /^\d{1,2}-[a-zа-я]+, \d{4}, \d{2}:\d{2}(:\d{2})?$/i;
const CRM_EMPTY = "(qiymatlanmagan)";

// Raqamni "+998XXXXXXXXX" ko'rinishiga keltiradi; tuzatib bo'lmasa null.
// Uchraydigan xatolar: "998+916815153", "+9998979805959" (ortiqcha 9),
// "+1998937237371" (oldida ortiqcha raqam).
export function fixPhone(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 9) return "+998" + digits;
  if (digits.length === 12 && digits.startsWith("998")) return "+" + digits;
  if (digits.length === 13 && digits.slice(1).startsWith("998")) {
    return "+" + digits.slice(1);
  }
  return null;
}

// "𝐔𝐦𝐢𝐝𝐣𝐨𝐧" yoki "A͟l͟isher" kabi bezakli yozuvlarni oddiy harflarga keltiradi
function cleanName(raw) {
  const name = String(raw ?? "")
    .normalize("NFKC")
    .replace(/[̀-ͯ]/g, "")
    .trim();
  return name && name !== CRM_EMPTY ? name : "Mijoz";
}

// Harf qatnashmagan va raqamlari 8 tadan ko'p qiymat — telefon
function looksLikePhone(value) {
  return !/\p{L}/u.test(value) && value.replace(/\D/g, "").length >= 8;
}

// Bitta qatordan { name, rawPhone } ni topadi; topilmasa null
function extractRow(cells) {
  const values = cells.map((c) => String(c ?? "").trim());

  // CRM ro'yxati: ... | ism | (q) | (q) | telefon | sana | ...
  const dateIdx = values.findIndex((v) => CRM_DATE.test(v));
  if (dateIdx >= 4) {
    return { name: values[dateIdx - 4], rawPhone: values[dateIdx - 1] };
  }

  // Oddiy jadval: ism va telefon istalgan tartibda
  const filled = values.filter(Boolean);
  const rawPhone = filled.find(looksLikePhone);
  if (!rawPhone) return null;
  const name =
    filled.find((v) => v !== rawPhone && /\p{L}/u.test(v)) ||
    (filled.length === 2 ? filled.find((v) => v !== rawPhone) : "");
  return { name, rawPhone };
}

// rows — katakchalar massivlari ro'yxati.
// Qaytaradi: { leads: [{name, phone}], invalid: [{name, rawPhone}], duplicates }
export function parseLeads(rows) {
  const leads = [];
  const invalid = [];
  const seen = new Set();
  let duplicates = 0;

  for (const cells of rows) {
    const row = extractRow(cells);
    if (!row) continue;

    const name = cleanName(row.name);
    const phone = fixPhone(row.rawPhone);
    if (!phone) {
      // Bir xil yaroqsiz raqam bir necha marta ko'rsatilmaydi
      if (!invalid.some((x) => x.rawPhone === row.rawPhone)) {
        invalid.push({ name, rawPhone: row.rawPhone });
      }
      continue;
    }
    if (seen.has(phone)) {
      duplicates++;
      continue;
    }
    seen.add(phone);
    leads.push({ name, phone });
  }

  return { leads, invalid, duplicates };
}

// Matnni qatorlarga ajratadi: CRM'dan nusxa — tab, CSV — vergul yoki nuqtali vergul
export function textToRows(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.split(line.includes("\t") ? "\t" : /[,;]/));
}
