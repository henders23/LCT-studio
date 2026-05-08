const KEY = 'lct-studio-state';

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

export function saveState(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // LocalStorage can fail in private browsing or locked-down environments.
  }
}
