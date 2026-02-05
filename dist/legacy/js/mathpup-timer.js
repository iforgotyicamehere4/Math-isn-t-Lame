let durationMs = 30000;
let intervalId = null;
let endAt = 0;
let remainingMs = 0;
let token = 0;
let onTick = () => {};
let onTimeout = () => {};

export function configureTimer(options = {}) {
  if (Number.isFinite(options.durationMs)) {
    durationMs = Math.max(0, options.durationMs);
  }
  if (typeof options.onTick === 'function') {
    onTick = options.onTick;
  }
  if (typeof options.onTimeout === 'function') {
    onTimeout = options.onTimeout;
  }
}

export function startRound() {
  stopTimer();
  token += 1;
  endAt = performance.now() + durationMs;
  remainingMs = durationMs;
  onTick(remainingMs);
  const currentToken = token;
  intervalId = setInterval(() => {
    if (currentToken !== token) return;
    const remaining = Math.max(0, endAt - performance.now());
    remainingMs = remaining;
    onTick(remainingMs);
    if (remaining <= 0) {
      stopTimer();
      onTimeout();
    }
  }, 250);
}

export function handleAnswer() {
  stopTimer();
  remainingMs = durationMs;
  onTick(remainingMs);
}

export function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function getProblemTimeRemaining() {
  return remainingMs;
}
