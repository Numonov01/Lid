// Ommaviy lid yuborish: CSV / TXT / Excel fayl yoki CRM'dan nusxalangan
// ro'yxatni o'qiydi, lidlarni ajratadi va ketma-ket yuboradi.
// sendOne({name, phone}) — bitta lidni yuboradi va true/false qaytaradi.
import { parseLeads, textToRows } from "../lib/leadParser.js";

// Excel kutubxonasi faqat .xlsx/.xls tanlanganda yuklanadi
const XLSX_URL = "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function readRows(file) {
  if (/\.xlsx?$/i.test(file.name)) {
    const XLSX = await import(XLSX_URL);
    const wb = XLSX.read(await file.arrayBuffer());
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
  }
  return textToRows(await file.text());
}

export function setupBulkUpload(root, { sendOne, onError }) {
  const fileInput = root.querySelector("#bulkFile");
  const pasteInput = root.querySelector("#bulkPaste");
  const info = root.querySelector("#bulkInfo");
  const sendBtn = root.querySelector("#bulkSend");

  let leads = [];

  function showParsed({ leads: parsed, invalid, duplicates }) {
    leads = parsed;
    sendBtn.hidden = !leads.length;
    sendBtn.textContent = "Hammasini yuborish (" + leads.length + ")";

    let html = "<b>" + leads.length + " ta lid tayyor</b>";
    if (duplicates) html += " · " + duplicates + " ta takror olib tashlandi";
    if (invalid.length) {
      html +=
        " · " + invalid.length + " ta yaroqsiz raqam:" +
        '<ul class="bulk-invalid">' +
        invalid
          .map((x) => "<li>" + escapeHtml(x.name) + " — " + escapeHtml(x.rawPhone) + "</li>")
          .join("") +
        "</ul>";
    }
    info.innerHTML = leads.length || invalid.length ? html : "";
  }

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    pasteInput.value = "";
    try {
      const result = parseLeads(await readRows(file));
      if (!result.leads.length && !result.invalid.length) {
        onError("Faylda ism va telefon topilmadi");
      }
      showParsed(result);
    } catch (err) {
      onError("Faylni o'qib bo'lmadi: " + err.message);
    }
  });

  pasteInput.addEventListener("input", () => {
    fileInput.value = "";
    showParsed(parseLeads(textToRows(pasteInput.value)));
  });

  sendBtn.addEventListener("click", async () => {
    if (!leads.length) return;
    sendBtn.disabled = fileInput.disabled = pasteInput.disabled = true;

    let okCount = 0;
    let failCount = 0;
    // CRM'ni bosib qo'ymaslik uchun ketma-ket yuboriladi
    for (let i = 0; i < leads.length; i++) {
      sendBtn.textContent = "Yuborilmoqda... " + (i + 1) + "/" + leads.length;
      if (await sendOne(leads[i])) okCount++;
      else failCount++;
    }

    info.textContent =
      "Tugadi: " + okCount + " ta yuborildi" +
      (failCount ? ", " + failCount + " ta xato (tarixdan ↻ bilan qayta yuboring)" : "");
    sendBtn.disabled = fileInput.disabled = pasteInput.disabled = false;
    fileInput.value = "";
    pasteInput.value = "";
    leads = [];
    sendBtn.hidden = true;
  });
}
