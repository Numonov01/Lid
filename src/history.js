// "Yuborilganlar tarixi" sahifasining kirish nuqtasi — barcha yozuvlarni ko'rsatadi
import { createHistoryLog } from "./components/HistoryLog.js";

const historyLog = createHistoryLog(document.getElementById("logList"), {
  showTime: true,
});

document.getElementById("historyCount").textContent =
  "Jami: " + historyLog.count() + " ta";
