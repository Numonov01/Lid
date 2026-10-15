// Ilovaning kirish nuqtasi — komponentlarni holat (state) bilan bog'laydi
import { PLATFORMS, PLATFORM_LABELS } from "./config/platforms.js";
import * as state from "./state.js";
import {
  sendLead,
  normalizePhone,
  errorText,
  resolveTarget,
} from "./lib/api.js";
import { renderPlatformTabs } from "./components/PlatformTabs.js";
import { renderAccountChips } from "./components/AccountChips.js";
import {
  renderProductSelect,
  renderProductTag,
} from "./components/ProductSelect.js";
import { createMessage } from "./components/Message.js";
import { createHistoryLog } from "./components/HistoryLog.js";
import { setupLeadForm } from "./components/LeadForm.js";
import { setupBulkUpload } from "./components/BulkUpload.js";

const $ = (id) => document.getElementById(id);

const productSelect = $("productSelect");
const message = createMessage($("msgBox"));
const historyLog = createHistoryLog($("logList"), {
  limit: 5,
  moreLink: $("historyMore"),
  onRetry: retryLead,
});

function getSelectedProduct() {
  return state.getAccount().products[productSelect.value];
}

function updateProductTag() {
  renderProductTag($("productTag"), {
    product: getSelectedProduct(),
    providerLabel: state.getProviderLabel(),
  });
}

// Platforma, akkaunt va mahsulotlarni joriy holat bo'yicha qayta chizadi
function render() {
  const account = state.getAccount();

  renderPlatformTabs($("platformTabs"), {
    platforms: Object.keys(PLATFORMS),
    labels: PLATFORM_LABELS,
    active: state.getPlatform(),
    onSelect: (key) => {
      state.setPlatform(key);
      render();
    },
  });

  renderAccountChips($("accountChips"), {
    accounts: state.getAccounts(),
    activeId: account.id,
    onSelect: (id) => {
      state.setAccount(id);
      render();
    },
  });

  renderProductSelect(productSelect, {
    products: account.products,
    selectedIndex: state.getProductIndex(),
  });

  updateProductTag();
}

productSelect.addEventListener("change", () => {
  state.setProductIndex(productSelect.value);
  updateProductTag();
});

// Lidni yuboradi va natijani xabar qutisida ko'rsatadi; true/false qaytaradi
async function deliver(lead) {
  message.hide();
  try {
    const { ok, data, status } = await sendLead(lead);
    if (ok) {
      message.show("success", "Muvaffaqiyatli yuborildi! ✅");
    } else {
      message.show("error", "Xatolik: " + errorText(data, status));
    }
    return ok;
  } catch (err) {
    message.show(
      "error",
      "Tarmoq xatosi: " +
        err.message +
        ". Agar bu CORS xatosi bo'lsa, dasturchingizga murojaat qiling.",
    );
    return false;
  }
}

// Bitta lidni tanlangan mahsulotga yuboradi va tarixga yozadi
async function submitLead({ name, phone: rawPhone }) {
  const phone = normalizePhone(rawPhone);
  const provider = state.getPlatform();
  const account = state.getAccount();
  const product = getSelectedProduct();
  if (!product) {
    message.show("error", "Mahsulotni tanlang");
    return false;
  }

  const ok = await deliver({ provider, account, product, name, phone });
  historyLog.add({
    name,
    phone,
    product: product.label,
    providerLabel: state.getProviderLabel(),
    // Xato bo'lsa tarixdan qayta yuborish uchun
    target: {
      provider,
      accountId: account.id,
      stream: product.stream,
      offer: product.offer,
    },
    ok,
  });
  return ok;
}

// Tarixdagi xato yozuvni o'sha mahsulotga qayta yuboradi
async function retryLead(item) {
  const target = resolveTarget(item);
  if (!target) {
    message.show("error", "Bu lidning mahsuloti topilmadi — qo'lda yuboring");
    return false;
  }
  return deliver({ ...target, name: item.name, phone: item.phone });
}

const showError = (text) => message.show("error", text);

setupLeadForm($("leadForm"), { onError: showError, onSubmit: submitLead });
setupBulkUpload($("bulkUpload"), { onError: showError, sendOne: submitLead });

render();
