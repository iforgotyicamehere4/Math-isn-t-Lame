let durationMs = 30000;
let intervalId = null;
let endAt = 0;
let remainingMs = 0;
let token = 0;
let onTick = () => {};
let onTimeout = () => {};

function configureTimer(options = {}) {
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

function startRound() {
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

function handleAnswer() {
  stopTimer();
  remainingMs = durationMs;
  onTick(remainingMs);
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function getProblemTimeRemaining() {
  return remainingMs;
}

function resetTimer() {
  stopTimer();
  durationMs = 30000;
  endAt = 0;
  remainingMs = 0;
  token = 0;
  onTick = () => {};
  onTimeout = () => {};
}

if (typeof window !== 'undefined') {
  window.mathPupTimer = {
    configureTimer,
    startRound,
    handleAnswer,
    stopTimer,
    getProblemTimeRemaining,
    resetTimer
  };
}

export {
  configureTimer,
  startRound,
  handleAnswer,
  stopTimer,
  getProblemTimeRemaining,
  resetTimer
};
