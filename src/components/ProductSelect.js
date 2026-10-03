// Mahsulot tanlash ro'yxati
export function renderProductSelect(selectEl, { products, selectedIndex }) {
  selectEl.innerHTML = "";
  products.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = p.label;
    selectEl.appendChild(opt);
  });
  selectEl.value = selectedIndex;
}

// Yuqoridagi sariq yorliq: "Mahsulot · Platforma (Akkaunt)"
export function renderProductTag(tagEl, { product, providerLabel }) {
  tagEl.textContent = product ? product.label + " · " + providerLabel : "—";
}
