// "Yuborilganlar tarixi" sahifasining kirish nuqtasi — barcha yozuvlarni ko'rsatadi
import { createHistoryLog } from "./components/HistoryLog.js";
import { sendLead, resolveTarget } from "./lib/api.js";

// Xato yozuvni o'sha mahsulotga qayta yuboradi
async function retryLead(item) {
  const target = resolveTarget(item);
  if (!target) return false;
  try {
    const { ok } = await sendLead({ ...target, name: item.name, phone: item.phone });
    return ok;
  } catch (e) {
    return false;
  }
}

const historyLog = createHistoryLog(document.getElementById("logList"), {
  showTime: true,
  onRetry: retryLead,
});

document.getElementById("historyCount").textContent =
  "Jami: " + historyLog.count() + " ta";
