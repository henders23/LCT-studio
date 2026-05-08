const KEY = 'lct-studio-state';

export function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; }
}

export function saveState(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}
