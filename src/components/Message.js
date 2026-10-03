// Muvaffaqiyat / xato xabari qutisi
export function createMessage(el) {
  return {
    show(type, text) {
      el.className = "msg " + type;
      el.textContent = text;
    },
    hide() {
      el.className = "msg";
    },
  };
}
