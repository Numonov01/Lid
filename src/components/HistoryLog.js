// "So'nggi yuborilganlar" ro'yxati — localStorage'da saqlanadi
import { loadJSON, saveJSON } from "../lib/storage.js";

const STORAGE_KEY = "lead_history";
const MAX_STORED = 50;

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

function itemHtml(item, index, showTime, canRetry) {
  const details =
    escapeHtml(item.phone) +
    (item.product ? " · " + escapeHtml(item.product) : "") +
    (item.providerLabel ? " · " + escapeHtml(item.providerLabel) : "");
  const time =
    showTime && item.time
      ? `<div class="time">${formatTime(item.time)}</div>`
      : "";
  const retry =
    canRetry && !item.ok
      ? `<button type="button" class="retry" data-index="${index}" title="Qayta yuborish" aria-label="Qayta yuborish">↻</button>`
      : "";

  return `
    <div class="log-item">
      <div>
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="phone">${details}</div>
        ${time}
      </div>
      <div class="log-actions">
        ${retry}
        <span class="status ${item.ok ? "ok" : "fail"}">${item.ok ? "Yuborildi" : "Xato"}</span>
      </div>
    </div>`;
}

// el — ro'yxat konteyneri.
// limit — nechta yozuv ko'rsatilsin (berilmasa hammasi).
// moreLink — "To'liq ko'rish" havolasi; yozuvlar limitdan ko'p bo'lsagina ko'rinadi.
// onRetry(item) — xato yozuvni qayta yuboradi va true/false qaytaradi;
// berilsa, xato yozuvlar yonida qayta yuborish tugmasi chiqadi.
export function createHistoryLog(
  el,
  { limit = Infinity, showTime = false, moreLink, onRetry } = {},
) {
  let history = loadJSON(STORAGE_KEY, []);

  function render() {
    el.innerHTML = history.length
      ? history
          .slice(0, limit)
          .map((item, i) => itemHtml(item, i, showTime, !!onRetry))
          .join("")
      : '<div class="empty">Hali hech narsa yuborilmagan</div>';
    if (moreLink) moreLink.hidden = history.length <= limit;
  }

  el.addEventListener("click", async (e) => {
    const btn = e.target.closest("button.retry");
    if (!btn) return;
    // Yuborish davomida ro'yxat o'zgarishi mumkin — indeks emas, obyektning o'zi saqlanadi
    const item = history[btn.dataset.index];
    btn.disabled = true;
    btn.classList.add("spinning");

    if (await onRetry(item)) {
      item.ok = true;
      saveJSON(STORAGE_KEY, history);
    }
    render();
  });

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
