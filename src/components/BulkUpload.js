// Ommaviy lid yuborish: CSV / TXT / Excel fayl yoki CRM'dan nusxalangan
// ro'yxatni o'qiydi, lidlarni ajratadi va ketma-ket yuboradi.
// Yuborishni pauza qilish, davom ettirish va bekor qilish mumkin: navbat
// (qaysi lidgacha yuborilgani) localStorage'da saqlanadi, shuning uchun
// davom ettirilganda — hatto sahifa yopilib qayta ochilsa ham — yuborish
// to'xtagan joyidan davom etadi, boshidan emas.
// sendOne({name, phone}) — bitta lidni yuboradi va true/false qaytaradi.
import { parseLeads, textToRows } from "../lib/leadParser.js";
import { loadJSON, saveJSON } from "../lib/storage.js";

// Excel kutubxonasi faqat .xlsx/.xls tanlanganda yuklanadi
const XLSX_URL = "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";
const QUEUE_KEY = "bulk_queue";

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
  const pauseBtn = root.querySelector("#bulkPause");
  const cancelBtn = root.querySelector("#bulkCancel");

  // Ro'yxatdan o'qilgan, hali yuborish boshlanmagan lidlar
  let parsed = [];
  // Yuborish navbati: { leads, index, ok, fail } — index: keyingi yuboriladigan lid
  let queue = loadJSON(QUEUE_KEY, null);
  let running = false;
  let pauseRequested = false;

  const saveQueue = () => saveJSON(QUEUE_KEY, queue);

  function setInputsLocked(locked) {
    fileInput.disabled = pasteInput.disabled = locked;
  }

  function progressText() {
    return (
      queue.index + "/" + queue.leads.length + " yuborildi" +
      " (" + queue.ok + " ta muvaffaqiyatli" +
      (queue.fail ? ", " + queue.fail + " ta xato" : "") + ")"
    );
  }

  function showParsed({ leads, invalid, duplicates }) {
    parsed = leads;
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

  // Navbat to'xtab turibdi: "Davom ettirish" va "Bekor qilish" ko'rinadi
  function showPaused() {
    const left = queue.leads.length - queue.index;
    info.innerHTML =
      "<b>Pauza:</b> " + progressText() + ". Qolgan " + left + " ta lid " +
      "davom ettirilganda to'xtagan joyidan yuboriladi.";
    sendBtn.hidden = false;
    sendBtn.disabled = false;
    sendBtn.textContent = "Davom ettirish (qolgan " + left + ")";
    pauseBtn.hidden = true;
    cancelBtn.hidden = false;
    setInputsLocked(true);
  }

  function showRunning() {
    sendBtn.hidden = true;
    pauseBtn.hidden = false;
    pauseBtn.disabled = false;
    pauseBtn.textContent = "Pauza";
    cancelBtn.hidden = true;
    setInputsLocked(true);
  }

  // Navbatni yopadi va yakuniy natijani ko'rsatadi
  function finish(prefix) {
    const { ok, fail, index, leads } = queue;
    const skipped = leads.length - index;
    info.textContent =
      prefix + ": " + ok + " ta yuborildi" +
      (fail ? ", " + fail + " ta xato (tarixdan ↻ bilan qayta yuboring)" : "") +
      (skipped ? ", " + skipped + " ta yuborilmadi" : "");
    queue = null;
    saveQueue();
    parsed = [];
    fileInput.value = "";
    pasteInput.value = "";
    sendBtn.hidden = pauseBtn.hidden = cancelBtn.hidden = true;
    sendBtn.disabled = false;
    setInputsLocked(false);
  }

  async function run() {
    running = true;
    pauseRequested = false;
    showRunning();

    // CRM'ni bosib qo'ymaslik uchun ketma-ket yuboriladi
    while (queue.index < queue.leads.length && !pauseRequested) {
      info.textContent =
        "Yuborilmoqda... " + (queue.index + 1) + "/" + queue.leads.length;
      if (await sendOne(queue.leads[queue.index])) queue.ok++;
      else queue.fail++;
      // Har bir liddan keyin saqlanadi — to'xtatilsa ham shu joydan davom etadi
      queue.index++;
      saveQueue();
    }

    running = false;
    if (queue.index >= queue.leads.length) finish("Tugadi");
    else showPaused();
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

  sendBtn.addEventListener("click", () => {
    if (running) return;
    // Yangi yuborish — navbat ro'yxatdan tuziladi; aks holda to'xtagan navbat davom etadi
    if (!queue) {
      if (!parsed.length) return;
      queue = { leads: parsed, index: 0, ok: 0, fail: 0 };
      saveQueue();
    }
    run();
  });

  pauseBtn.addEventListener("click", () => {
    // Yuborilayotgan lid tugashi kutiladi, keyin to'xtaydi
    pauseRequested = true;
    pauseBtn.disabled = true;
    pauseBtn.textContent = "To'xtatilmoqda...";
  });

  cancelBtn.addEventListener("click", () => {
    if (running || !queue) return;
    if (!confirm("Qolgan lidlar yuborilmaydi. Bekor qilinsinmi?")) return;
    finish("Bekor qilindi");
  });

  // Yuborish davomida sahifa yopilsa ogohlantiradi
  window.addEventListener("beforeunload", (e) => {
    if (running) e.preventDefault();
  });

  // Oldingi safar tugallanmay qolgan yuborish bo'lsa — davom ettirishni taklif qiladi
  if (queue && queue.index < queue.leads.length) {
    showPaused();
  } else if (queue) {
    queue = null;
    saveQueue();
  }
}
