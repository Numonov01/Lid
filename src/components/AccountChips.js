// Akkaunt chiplari — faqat platformada bir nechta akkaunt bo'lsa ko'rsatiladi
export function renderAccountChips(el, { accounts, activeId, onSelect }) {
  el.innerHTML = "";
  if (accounts.length < 2) return;

  accounts.forEach((acc) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "account-chip" + (acc.id === activeId ? " active" : "");
    chip.textContent = acc.label;
    chip.addEventListener("click", () => onSelect(acc.id));
    el.appendChild(chip);
  });
}
