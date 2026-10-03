// "So'nggi yuborilganlar" ro'yxati — localStorage'da saqlanadi
import { loadJSON, saveJSON } from "../lib/storage.js";

const STORAGE_KEY = "lead_history";
const MAX_STORED = 100;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear() +
    " " + pad(d.getHours()) + ":" + pad(d.getMinutes())
  );
}

function itemHtml(item, showTime) {
  const details =
    escapeHtml(item.phone) +
    (item.product ? " · " + escapeHtml(item.product) : "") +
    (item.providerLabel ? " · " + escapeHtml(item.providerLabel) : "");
  const time =
    showTime && item.time
      ? `<div class="time">${formatTime(item.time)}</div>`
      : "";

  return `
    <div class="log-item">
      <div>
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="phone">${details}</div>
        ${time}
      </div>
      <span class="status ${item.ok ? "ok" : "fail"}">${item.ok ? "Yuborildi" : "Xato"}</span>
    </div>`;
}

// el — ro'yxat konteyneri.
// limit — nechta yozuv ko'rsatilsin (berilmasa hammasi).
// moreLink — "To'liq ko'rish" havolasi; yozuvlar limitdan ko'p bo'lsagina ko'rinadi.
export function createHistoryLog(el, { limit = Infinity, showTime = false, moreLink } = {}) {
  let history = loadJSON(STORAGE_KEY, []);

  function render() {
    el.innerHTML = history.length
      ? history.slice(0, limit).map((item) => itemHtml(item, showTime)).join("")
      : '<div class="empty">Hali hech narsa yuborilmagan</div>';
    if (moreLink) moreLink.hidden = history.length <= limit;
  }

  render();

  return {
    count: () => history.length,
    add(item) {
      history.unshift({ ...item, time: Date.now() });
      history = history.slice(0, MAX_STORED);
      saveJSON(STORAGE_KEY, history);
      render();
    },
  };
}
