// localStorage o'ramlari — maxfiy rejim yoki bloklangan saytlarda
// localStorage xato tashlashi mumkin, shuning uchun hammasi try/catch ichida.

export function load(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
}

export function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveJSON(key, value) {
  save(key, JSON.stringify(value));
}
