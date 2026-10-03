// Lid formasi: ism + telefonni yig'adi va onSubmit'ga uzatadi.
// onSubmit muvaffaqiyatli bo'lsa true qaytarishi kerak — shunda maydonlar tozalanadi.
export function setupLeadForm(form, { onSubmit, onError }) {
  const nameInput = form.querySelector("#name");
  const phoneInput = form.querySelector("#phone");
  const submitBtn = form.querySelector("#submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!name || !phone) {
      onError("Ism va telefon raqamini kiriting");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Yuborilmoqda...";
    try {
      const ok = await onSubmit({ name, phone });
      if (ok) {
        // Faqat ism/telefon tozalanadi — tanlangan mahsulot saqlanib qoladi
        nameInput.value = "";
        phoneInput.value = "";
        nameInput.focus();
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Yuborish";
    }
  });
}
