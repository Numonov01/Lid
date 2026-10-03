// Platforma tab'lari (Fayzlibazar / Xavi.uz)
export function renderPlatformTabs(el, { platforms, labels, active, onSelect }) {
  el.innerHTML = "";
  platforms.forEach((key) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab" + (key === active ? " active" : "");
    btn.textContent = labels[key] || key;
    btn.addEventListener("click", () => onSelect(key));
    el.appendChild(btn);
  });
}
