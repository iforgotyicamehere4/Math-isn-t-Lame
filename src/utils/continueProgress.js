const CONTINUE_STORAGE_PREFIX = 'mathpop_continue_progress_';
const CONTINUE_REQUEST_KEY = 'mathpop_continue_request';

export const CONTINUE_ROUTES = new Set(['/game', '/capture', '/decimal', '/mathsynth']);

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getCurrentUser() {
  if (!isBrowser()) return null;
  const user = window.localStorage.getItem('mathpop_current_user');
  return user && user !== 'guest' ? user : null;
}

function continueStorageKey(user) {
  return `${CONTINUE_STORAGE_PREFIX}${user}`;
}

export function readContinueProgress(user = getCurrentUser()) {
  if (!isBrowser() || !user) return null;
  try {
    const raw = window.localStorage.getItem(continueStorageKey(user));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !CONTINUE_ROUTES.has(parsed.route)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeContinueProgress(route, state, user = getCurrentUser()) {
  if (!isBrowser() || !user || !CONTINUE_ROUTES.has(route)) return;
  const payload = {
    route,
    user,
    updatedAt: Date.now(),
    state: state || {}
  };
  try {
    window.localStorage.setItem(continueStorageKey(user), JSON.stringify(payload));
  } catch {
    // ignore storage failures
  }
}

export function setContinueRequest(route, user = getCurrentUser()) {
  if (!isBrowser() || !user || !CONTINUE_ROUTES.has(route)) return;
  try {
    window.sessionStorage.setItem(CONTINUE_REQUEST_KEY, JSON.stringify({ route, user, requestedAt: Date.now() }));
  } catch {
    // ignore storage failures
  }
}

function consumeContinueRequest(route, user = getCurrentUser()) {
  if (!isBrowser() || !user || !CONTINUE_ROUTES.has(route)) return false;
  try {
    const raw = window.sessionStorage.getItem(CONTINUE_REQUEST_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const matches = parsed && parsed.route === route && parsed.user === user;
    if (matches) {
      window.sessionStorage.removeItem(CONTINUE_REQUEST_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function attachContinueTracker({
  route,
  isReady,
  readState,
  applyState,
  saveEveryMs = 1200,
  maxResumeAttempts = 40,
  resumeDelayMs = 120
}) {
  if (!CONTINUE_ROUTES.has(route)) return () => {};
  const user = getCurrentUser();
  if (!user) return () => {};

  let stopped = false;
  let saveTimer = null;
  let resumeTimer = null;
  let resumeAttempts = 0;
  const shouldResume = consumeContinueRequest(route, user);
  const saved = readContinueProgress(user);

  const persistNow = () => {
    if (stopped) return;
    if (!isReady()) return;
    writeContinueProgress(route, readState(), user);
  };

  if (shouldResume && saved && saved.route === route && saved.state) {
    resumeTimer = window.setInterval(() => {
      if (stopped) return;
      if (!isReady()) return;
      resumeAttempts += 1;
      const ok = applyState(saved.state);
      if (ok || resumeAttempts >= maxResumeAttempts) {
        window.clearInterval(resumeTimer);
        resumeTimer = null;
      }
    }, resumeDelayMs);
  }

  saveTimer = window.setInterval(persistNow, saveEveryMs);
  window.addEventListener('pagehide', persistNow);
  window.addEventListener('beforeunload', persistNow);
  document.addEventListener('visibilitychange', persistNow);
  persistNow();

  return () => {
    stopped = true;
    if (saveTimer) window.clearInterval(saveTimer);
    if (resumeTimer) window.clearInterval(resumeTimer);
    window.removeEventListener('pagehide', persistNow);
    window.removeEventListener('beforeunload', persistNow);
    document.removeEventListener('visibilitychange', persistNow);
    persistNow();
  };
}
