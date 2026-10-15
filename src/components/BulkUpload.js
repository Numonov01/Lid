// Fayldan ommaviy lid yuborish: CSV / TXT / Excel faylni o'qiydi,
// har bir qatordan ism va telefonni topadi va ketma-ket yuboradi.
// sendOne({name, phone}) — bitta lidni yuboradi va true/false qaytaradi.

// Excel kutubxonasi faqat .xlsx/.xls tanlanganda yuklanadi
const XLSX_URL = "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

// Raqamlari soni 9–13 bo'lgan va harf qatnashmagan qiymat — telefon
function isPhone(value) {
  if (/[a-zа-яё]/i.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 13;
}

// Qatordan {name, phone} ni ajratadi; topilmasa null
function parseRow(cells) {
  const values = cells.map((c) => String(c ?? "").trim()).filter(Boolean);
  const phone = values.find(isPhone);
  const name = values.find((v) => v !== phone && /[a-zа-яё]/i.test(v));
  return phone && name ? { name, phone } : null;
}

function splitLine(line) {
  return line.split(/[,;\t]/);
}

async function readRows(file) {
  if (/\.xlsx?$/i.test(file.name)) {
    const XLSX = await import(XLSX_URL);
    const wb = XLSX.read(await file.arrayBuffer());
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
  }
  const text = await file.text();
  return text.split(/\r?\n/).map(splitLine);
}

export function setupBulkUpload(root, { sendOne, onError }) {
  const fileInput = root.querySelector("#bulkFile");
  const info = root.querySelector("#bulkInfo");
  const sendBtn = root.querySelector("#bulkSend");

  let leads = [];

  function reset() {
    leads = [];
    sendBtn.hidden = true;
    info.textContent = "";
  }

  fileInput.addEventListener("change", async () => {
    reset();
    const file = fileInput.files[0];
    if (!file) return;

    try {
      const rows = await readRows(file);
      const nonEmpty = rows.filter((r) => r.some((c) => String(c ?? "").trim()));
      leads = nonEmpty.map(parseRow).filter(Boolean);
      const skipped = nonEmpty.length - leads.length;

      if (!leads.length) {
        onError("Faylda ism va telefon topilmadi");
        return;
      }
      info.textContent =
        leads.length + " ta lid topildi" +
        (skipped ? " (" + skipped + " ta qator o'tkazib yuborildi)" : "");
      sendBtn.hidden = false;
      sendBtn.textContent = "Hammasini yuborish (" + leads.length + ")";
    } catch (err) {
      onError("Faylni o'qib bo'lmadi: " + err.message);
    }
  });

  sendBtn.addEventListener("click", async () => {
    if (!leads.length) return;
    sendBtn.disabled = true;
    fileInput.disabled = true;

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
      (failCount ? ", " + failCount + " ta xato" : "");
    sendBtn.disabled = false;
    fileInput.disabled = false;
    fileInput.value = "";
    leads = [];
    sendBtn.hidden = true;
  });
}
