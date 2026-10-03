// Tanlangan platforma / akkaunt / mahsulot holati.
// Tanlovlar localStorage'da saqlanadi, sahifa qayta ochilganda tiklanadi.
import {
  PLATFORMS,
  PLATFORM_LABELS,
  DEFAULT_PLATFORM,
} from "./config/platforms.js";
import { load, save } from "./lib/storage.js";

const savedPlatform = load("active_platform");
let activePlatform = PLATFORMS[savedPlatform] ? savedPlatform : DEFAULT_PLATFORM;

export function getPlatform() {
  return activePlatform;
}

export function setPlatform(key) {
  activePlatform = key;
  save("active_platform", key);
}

export function getAccounts() {
  return PLATFORMS[activePlatform].accounts;
}

export function getAccount() {
  const accounts = getAccounts();
  const saved = load("active_account_" + activePlatform);
  return accounts.find((a) => a.id === saved) || accounts[0];
}

export function setAccount(accountId) {
  save("active_account_" + activePlatform, accountId);
}

function productKey() {
  return "last_product_index_" + activePlatform + "_" + getAccount().id;
}

export function getProductIndex() {
  const index = load(productKey());
  return index !== null && getAccount().products[index] ? index : "0";
}

export function setProductIndex(index) {
  save(productKey(), index);
}

// Masalan: "Xavi.uz (Tokhir)"
export function getProviderLabel() {
  return (
    (PLATFORM_LABELS[activePlatform] || activePlatform) +
    " (" +
    getAccount().label +
    ")"
  );
}
