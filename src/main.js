// Ilovaning kirish nuqtasi — komponentlarni holat (state) bilan bog'laydi
import { PLATFORMS, PLATFORM_LABELS } from "./config/platforms.js";
import * as state from "./state.js";
import { sendLead } from "./lib/api.js";
import { renderPlatformTabs } from "./components/PlatformTabs.js";
import { renderAccountChips } from "./components/AccountChips.js";
import {
  renderProductSelect,
  renderProductTag,
} from "./components/ProductSelect.js";
import { createMessage } from "./components/Message.js";
import { createHistoryLog } from "./components/HistoryLog.js";
import { setupLeadForm } from "./components/LeadForm.js";

const $ = (id) => document.getElementById(id);

const productSelect = $("productSelect");
const message = createMessage($("msgBox"));
const historyLog = createHistoryLog($("logList"), {
  limit: 5,
  moreLink: $("historyMore"),
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

setupLeadForm($("leadForm"), {
  onError: (text) => message.show("error", text),
  onSubmit: async ({ name, phone }) => {
    const account = state.getAccount();
    const product = getSelectedProduct();
    if (!product) {
      message.show("error", "Mahsulotni tanlang");
      return false;
    }

    message.hide();
    const entry = {
      name,
      phone,
      product: product.label,
      providerLabel: state.getProviderLabel(),
    };

    try {
      const { ok, data, status } = await sendLead({
        provider: state.getPlatform(),
        account,
        product,
        name,
        phone,
      });

      if (ok) {
        message.show("success", "Muvaffaqiyatli yuborildi! ✅");
      } else {
        message.show("error", "Xatolik: " + (data.message || data.raw || status));
      }
      historyLog.add({ ...entry, ok });
      return ok;
    } catch (err) {
      message.show(
        "error",
        "Tarmoq xatosi: " +
          err.message +
          ". Agar bu CORS xatosi bo'lsa, dasturchingizga murojaat qiling.",
      );
      historyLog.add({ ...entry, ok: false });
      return false;
    }
  },
});

render();
