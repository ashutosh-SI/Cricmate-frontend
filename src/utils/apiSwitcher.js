// Simple runtime API base switcher that rewrites fetch('/api/...') calls.
// Modes: 'local' (default, relies on Vite proxy) or 'remote' (hits remote host directly).

const LOCAL_STORAGE_KEY = 'cricmate_api_mode';
const REMOTE_BASE = 'http://54.87.135.228:9009';

let currentMode = null;
let originalFetch = null;

export const getApiMode = () => {
  if (currentMode) return currentMode;
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_STORAGE_KEY) : null;
  currentMode = stored === 'remote' ? 'remote' : 'local';
  return currentMode;
};

export const setApiMode = (mode) => {
  currentMode = mode === 'remote' ? 'remote' : 'local';
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, currentMode);
  } catch {}
};

export const toggleApiMode = () => {
  const next = getApiMode() === 'remote' ? 'local' : 'remote';
  setApiMode(next);
  return next;
};

export const getApiBase = () => {
  return getApiMode() === 'remote' ? REMOTE_BASE : '';
};

// Patch global fetch to rewrite '/api' requests when in remote mode
export const initApiSwitcher = () => {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  if (originalFetch) return; // already patched
  originalFetch = window.fetch.bind(window);
  // Ensure mode initialized
  getApiMode();

  window.fetch = async (input, init) => {
    try {
      const mode = getApiMode();
      const base = mode === 'remote' ? REMOTE_BASE : '';

      // String URL
      if (typeof input === 'string' && input.startsWith('/api')) {
        const url = base ? `${base}${input}` : input;
        return originalFetch(url, init);
      }

      // Request object
      if (input && typeof input === 'object' && 'url' in input) {
        const req = input;
        if (typeof req.url === 'string' && req.url.startsWith('/api')) {
          const url = base ? `${base}${req.url}` : req.url;
          const newRequest = new Request(url, req);
          return originalFetch(newRequest, init);
        }
      }

      return originalFetch(input, init);
    } catch (err) {
      return Promise.reject(err);
    }
  };
};

// For debugging in console if needed
if (typeof window !== 'undefined') {
  window.__cricmateApi = {
    getApiMode,
    setApiMode,
    toggleApiMode,
    getApiBase,
  };
}


