// Capture The Fraction - mathanomical pace slowed + 2-minute timer
// - Mathanomical fall duration increased (slower pace)
// - Mathanomical round timer set to 2 minutes (120000 ms)
// - Keeps all prior behavior: mixed-number mathanomical problems, 5 choices with tricky distractors,
//   pause/resume preserving remaining time, one correct answer guaranteed per round.
// @ts-nocheck

if (window.__CaptureCleanup) window.__CaptureCleanup();
window.__CaptureCleanup = null;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const levelSelect = document.getElementById("levelSelect");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const scoreEl = document.getElementById("scoreDisplay");
const streakEl = document.getElementById("streakDisplay");
const targetEl = document.getElementById("targetFraction");
const inputEl = document.getElementById("fractionInput");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint"); // optional
const denominatorHelpPopup = document.getElementById("denominatorHelpPopup");
const denominatorHelpText = document.getElementById("denominatorHelpText");
const denominatorHelpClose = document.getElementById("denominatorHelpClose");

let bubbles = [];
let animationId = null;
let lastTimestamp = null;
let gamePaused = false;
let gameStarted = false;
let roundActive = false;
let score = 0;
let streak = 0;
let currentProblem = null;
let miniGameActive = false;
let miniGameDone = false;
const DAILY_CHALLENGE_POINTS = 8000;
const dailyChallenge = (() => {
  const raw = window.__CaptureDailyChallenge;
  if (!raw || !raw.enabled || raw.gameId !== 'capture') return null;
  return {
    id: String(raw.id || ''),
    dateKey: String(raw.dateKey || ''),
    level: String(raw.level || 'easy'),
    requiredCorrect: Math.max(1, Number(raw.requiredCorrect) || 10),
    points: Math.max(1, Number(raw.points) || DAILY_CHALLENGE_POINTS),
    claimed: Boolean(raw.claimed),
    progress: raw.progress && typeof raw.progress === 'object' ? raw.progress : null
  };
})();

// Round timer state for pause/resume
let roundTimer = null;
let roundStartTimestamp = 0;    // performance.now() when the current round timer started
let roundRemainingMs = 0;       // ms remaining for the current round
let retryUsedThisRound = false;
let reviewPauseTimer = null;
let reviewPauseToken = 0;

const recentTargets = [];
const RECENT_LIMIT = 8;
const MINI_POINTS_PER_CIRCLE = 900;
const MINI_POTTY_BONUS = 200;
const MINI_SHOT_COOLDOWN = 240;
const MINI_DURATION_MS = 25000;
const MINI_SPAWN_INTERVAL_MS = 900;
let easy25Deck = [];
let easy25DeckIndex = 0;

const BENNY_COLORS = [
  { id: 'solid-01', name: 'Sky', type: 'solid', primary: '#7dd3fc' },
  { id: 'tone-01', name: 'Mint/Lime', type: 'tone', primary: '#6ee7b7', secondary: '#a3e635' },
  { id: 'solid-02', name: 'Lavender', type: 'solid', primary: '#c4b5fd' },
  { id: 'tone-02', name: 'Ocean/Blue', type: 'tone', primary: '#38bdf8', secondary: '#2563eb' },
  { id: 'solid-03', name: 'Sunshine', type: 'solid', primary: '#fde047' },
  { id: 'tone-03', name: 'Blush/Coral', type: 'tone', primary: '#f9a8d4', secondary: '#fb7185' },
  { id: 'solid-04', name: 'Mint', type: 'solid', primary: '#5eead4' },
  { id: 'tone-04', name: 'Berry/Plum', type: 'tone', primary: '#f472b6', secondary: '#a855f7' },
  { id: 'solid-05', name: 'Lime', type: 'solid', primary: '#a3e635' },
  { id: 'tone-05', name: 'Teal/Blue', type: 'tone', primary: '#22d3ee', secondary: '#0ea5e9' },
  { id: 'solid-06', name: 'Rose', type: 'solid', primary: '#fb7185' },
  { id: 'tone-06', name: 'Berry/Sun', type: 'tone', primary: '#f472b6', secondary: '#facc15' },
  { id: 'solid-07', name: 'Blue', type: 'solid', primary: '#60a5fa' },
  { id: 'tone-07', name: 'Grape/Indigo', type: 'tone', primary: '#818cf8', secondary: '#4f46e5' },
  { id: 'solid-08', name: 'Spring', type: 'solid', primary: '#86efac' },
  { id: 'tone-08', name: 'Ice/Lavender', type: 'tone', primary: '#a5b4fc', secondary: '#e0f2fe' },
  { id: 'solid-09', name: 'Bubblegum', type: 'solid', primary: '#f9a8d4' },
  { id: 'tone-09', name: 'Lemon/Lime', type: 'tone', primary: '#fde047', secondary: '#bef264' },
  { id: 'solid-10', name: 'Soft Gray', type: 'solid', primary: '#cbd5f5' },
  { id: 'tone-10', name: 'Cloud/Blue', type: 'tone', primary: '#7487a0ff', secondary: '#93c5fd' },
  { id: 'solid-11', name: 'Minty Blue', type: 'solid', primary: '#7dd3fc' },
  { id: 'tone-11', name: 'Aqua/Mint', type: 'tone', primary: '#2dd4bf', secondary: '#99f6e4' },
  { id: 'solid-12', name: 'Grape', type: 'solid', primary: '#c084fc' },
  { id: 'tone-12', name: 'Lilac/Rose', type: 'tone', primary: '#d8b4fe', secondary: '#fda4af' },
  { id: 'solid-13', name: 'Coral', type: 'solid', primary: '#fb7185' },
  { id: 'tone-13', name: 'Kiwi/Green', type: 'tone', primary: '#bef264', secondary: '#4ade80' },
  { id: 'solid-14', name: 'Ice Blue', type: 'solid', primary: '#91d7fdc2' },
  { id: 'tone-14', name: 'Sky/Indigo', type: 'tone', primary: '#60a5fa', secondary: '#6366f1' },
  { id: 'solid-15', name: 'Periwinkle', type: 'solid', primary: '#a5b4fc' },
  { id: 'tone-15', name: 'Mint/Teal', type: 'tone', primary: '#5eead4', secondary: '#14b8a6' },
  { id: 'solid-16', name: 'Sunbeam', type: 'solid', primary: '#fde68a' },
  { id: 'tone-16', name: 'Pink/Coral', type: 'tone', primary: '#fda4af', secondary: '#fb7185' },
  { id: 'solid-17', name: 'Cool Blue', type: 'solid', primary: '#93c5fd' },
  { id: 'tone-17', name: 'Lime/Teal', type: 'tone', primary: '#a3e635', secondary: '#2dd4bf' },
  { id: 'solid-18', name: 'Soft Plum', type: 'solid', primary: '#d8b4fe' },
  { id: 'tone-18', name: 'Sky/Mint', type: 'tone', primary: '#7dd3fc', secondary: '#6ee7b7' },
  { id: 'solid-19', name: 'Seafoam', type: 'solid', primary: '#99f6e4' },
  { id: 'tone-19', name: 'Berry/Sky', type: 'tone', primary: '#f472b6', secondary: '#60a5fa' },
  { id: 'solid-20', name: 'Sunny', type: 'solid', primary: '#facc15' },
  { id: 'tone-20', name: 'Cool Mint', type: 'tone', primary: '#5eead4', secondary: '#38bdf8' },
  { id: 'solid-21', name: 'Twilight', type: 'solid', primary: '#a78bfa' },
  { id: 'tone-21', name: 'Blue/Teal', type: 'tone', primary: '#3b82f6', secondary: '#14b8a6' },
  { id: 'solid-22', name: 'Spring Leaf', type: 'solid', primary: '#4ade80' },
  { id: 'tone-22', name: 'Lilac/Ice', type: 'tone', primary: '#c4b5fd', secondary: '#bae6fd' },
  { id: 'solid-23', name: 'Blush', type: 'solid', primary: '#fda4af' },
  { id: 'tone-23', name: 'Mint/Sky', type: 'tone', primary: '#5eead4', secondary: '#38bdf8' },
  { id: 'solid-24', name: 'Cool Mint', type: 'solid', primary: '#2dd4bf' },
  { id: 'tone-24', name: 'Sun/Lav', type: 'tone', primary: '#fde047', secondary: '#c4b5fd' },
  { id: 'solid-25', name: 'Powder', type: 'solid', primary: '#e2e8f0' },
  { id: 'tone-25', name: 'Rose/Mint', type: 'tone', primary: '#fb7185', secondary: '#6ee7b7' }
];

const keysDown = new Set();
let bennyState = null;
let miniCircles = [];
let miniShots = [];
let lastShotAt = 0;
let miniEndAt = 0;
let miniLastSpawnAt = 0;
let miniBennyEl = null;
let miniClearBonusCooldownUntil = 0;
let miniJoystick = null;
let miniStick = null;
let miniShootBtn = null;
let miniJoystickActive = false;
let miniJoystickVector = { x: 0, y: 0 };
let miniJoystickCenter = { x: 0, y: 0 };
const miniJoystickRadius = 28;
const BUG_SYMBOLS = ['+', '-', '*', '/', '=', '>', '<', '≈', '≠', '√', '%'];
const BUG_HEADS = ['0', '8', '9', '∞', 'θ', 'π'];
const BUG_HANDS_LEFT = ['(', '{', '<', '['];
const BUG_HANDS_RIGHT = [')', '}', '>', ']'];
const BUG_FEET_LEFT = ['_', '/', '='];
const BUG_FEET_RIGHT = ['_', '\\', '='];
const BROKEN_PHRASES = [
  'x+/=y',
  'if n then ?',
  '2x==/4',
  'sum( ) ?',
  'frac//mix',
  '÷ by zero?',
  '(a+b] =',
  'solve: ??',
  'x<=>/y',
  '∫ no dx'
];

let targetFractionClickHandler = null;
let denominatorCloseHandler = null;
let denominatorEscHandler = null;
let denominatorBackdropHandler = null;

function currentUser() {
  return localStorage.getItem('mathpop_current_user') || 'guest';
}

function profileStatsKey() {
  return `mathpop_profile_stats_${currentUser()}`;
}

function loadProfileStats() {
  const raw = localStorage.getItem(profileStatsKey());
  if (!raw) {
    return { totalPoints: 0, totalCorrect: 0, totalAttempted: 0, pupStreakRecord: 0, levelsCompleted: [], games: {} };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      totalPoints: Number(parsed.totalPoints) || 0,
      totalCorrect: Number(parsed.totalCorrect) || 0,
      totalAttempted: Number(parsed.totalAttempted) || 0,
      pupStreakRecord: Number(parsed.pupStreakRecord) || 0,
      levelsCompleted: Array.isArray(parsed.levelsCompleted) ? parsed.levelsCompleted : [],
      games: parsed.games && typeof parsed.games === 'object' ? parsed.games : {}
    };
  } catch {
    return { totalPoints: 0, totalCorrect: 0, totalAttempted: 0, pupStreakRecord: 0, levelsCompleted: [], games: {} };
  }
}

function ensureGameStats(stats, gameId) {
  if (!stats.games[gameId]) {
    stats.games[gameId] = { points: 0, correct: 0, attempted: 0, bestScore: 0, streakRecord: 0, gamesPlayed: 0 };
  }
  return stats.games[gameId];
}

function saveProfileStats(stats) {
  localStorage.setItem(profileStatsKey(), JSON.stringify(stats));
}

function dailyChallengeKey() {
  return `mathpop_daily_challenge_state_${currentUser()}`;
}

function loadDailyChallengeState() {
  const raw = localStorage.getItem(dailyChallengeKey());
  if (!raw) return { claims: {}, progress: {}, streak: 0, lastClaimDate: null, totalCompleted: 0 };
  try {
    const parsed = JSON.parse(raw);
    return {
      claims: parsed?.claims && typeof parsed.claims === 'object' ? parsed.claims : {},
      progress: parsed?.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
      streak: Number(parsed?.streak) || 0,
      lastClaimDate: parsed?.lastClaimDate || null,
      totalCompleted: Number(parsed?.totalCompleted) || 0
    };
  } catch {
    return { claims: {}, progress: {}, streak: 0, lastClaimDate: null, totalCompleted: 0 };
  }
}

function saveDailyChallengeState(state) {
  localStorage.setItem(dailyChallengeKey(), JSON.stringify(state));
}

function dateKeyOffset(baseDateKey, dayOffset) {
  const d = new Date(`${baseDateKey}T12:00:00`);
  d.setDate(d.getDate() + dayOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function updateDailyChallengeHint() {
  const hintTarget = document.getElementById('captureDailyHint');
  if (!hintTarget) return;
  if (!dailyChallenge) {
    hintTarget.textContent = '';
    return;
  }
  if (dailyChallenge.claimed) {
    hintTarget.textContent = 'Daily challenge complete. Come back tomorrow for a new one.';
    return;
  }
  const correct = Number(dailyChallenge.progress?.correct) || 0;
  const activeLevel = currentLevel();
  if (activeLevel !== dailyChallenge.level) {
    hintTarget.textContent = `Daily Challenge is on ${dailyChallenge.level}. Switch level to earn ${dailyChallenge.points} pts.`;
    return;
  }
  hintTarget.textContent = `Daily Challenge: ${dailyChallenge.level} | ${correct}/${dailyChallenge.requiredCorrect} correct | Reward ${dailyChallenge.points} pts`;
}

function applyDailyChallengeProgress(stats, gameStats, levelName, wasCorrect) {
  if (!dailyChallenge || !dailyChallenge.id || !dailyChallenge.dateKey) return { awarded: false };
  if (dailyChallenge.claimed) return { awarded: false };
  if (levelName !== dailyChallenge.level) return { awarded: false };
  const state = loadDailyChallengeState();
  const claim = state.claims?.[dailyChallenge.dateKey];
  if (claim && claim.challengeId === dailyChallenge.id) {
    dailyChallenge.claimed = true;
    updateDailyChallengeHint();
    return { awarded: false };
  }
  if (!state.progress || typeof state.progress !== 'object') state.progress = {};
  const prev = state.progress[dailyChallenge.dateKey];
  if (!prev || prev.challengeId !== dailyChallenge.id) {
    state.progress[dailyChallenge.dateKey] = {
      challengeId: dailyChallenge.id,
      correct: 0,
      score: 0,
      completed: false,
      completedAt: null
    };
  }
  const entry = state.progress[dailyChallenge.dateKey];
  if (wasCorrect) {
    entry.correct = (Number(entry.correct) || 0) + 1;
    entry.score = (Number(entry.score) || 0) + 100;
  }
  if (!entry.completed && Number(entry.correct) >= dailyChallenge.requiredCorrect) {
    entry.completed = true;
    entry.completedAt = new Date().toISOString();
  }
  let awarded = false;
  if (entry.completed) {
    if (!state.claims || typeof state.claims !== 'object') state.claims = {};
    if (!state.claims[dailyChallenge.dateKey]) {
      state.claims[dailyChallenge.dateKey] = {
        challengeId: dailyChallenge.id,
        points: dailyChallenge.points,
        claimedAt: new Date().toISOString()
      };
      const previousDate = state.lastClaimDate;
      if (previousDate === dailyChallenge.dateKey) {
        // no-op
      } else if (previousDate === dateKeyOffset(dailyChallenge.dateKey, -1)) {
        state.streak = (Number(state.streak) || 0) + 1;
      } else {
        state.streak = 1;
      }
      state.lastClaimDate = dailyChallenge.dateKey;
      state.totalCompleted = (Number(state.totalCompleted) || 0) + 1;
      stats.totalPoints += dailyChallenge.points;
      gameStats.points += dailyChallenge.points;
      awarded = true;
    }
    dailyChallenge.claimed = true;
  }
  dailyChallenge.progress = {
    challengeId: dailyChallenge.id,
    correct: Number(entry.correct) || 0,
    score: Number(entry.score) || 0,
    completed: Boolean(entry.completed),
    completedAt: entry.completedAt || null
  };
  saveDailyChallengeState(state);
  updateDailyChallengeHint();
  return { awarded };
}

// ---------- Canvas helper ----------
function syncCanvasSize() {
  if (!canvas) return;
  const w = Math.max(300, Math.floor(canvas.clientWidth || 800));
  const h = Math.max(200, Math.floor(canvas.clientHeight || 600));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}
const resizeHandler = () => syncCanvasSize();
window.addEventListener("resize", resizeHandler);

// ---------- Math helpers ----------
function gcd(a, b) {
  let x = Math.abs(Math.trunc(a || 0));
  let y = Math.abs(Math.trunc(b || 0));
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}
function simplify(num, den) {
  num = Math.trunc(num);
  den = Math.trunc(den);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  const g = gcd(num, den);
  return { num: Math.trunc(num / g), den: Math.trunc(den / g) };
}
function fractionsEqual(a, b) {
  if (!a || !b) return false;
  const fa = simplify(a.num, a.den);
  const fb = simplify(b.num, b.den);
  if (!fa || !fb) return false;
  return fa.num === fb.num && fa.den === fb.den;
}
function toImproper(whole, num, den) {
  return { num: whole * den + num, den };
}
function addFractions(a, b) {
  const num = a.num * b.den + b.num * a.den;
  const den = a.den * b.den;
  return simplify(num, den);
}
function subFractions(a, b) {
  const num = a.num * b.den - b.num * a.den;
  const den = a.den * b.den;
  return simplify(num, den);
}
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Display helpers ----------
function formatDisplay(fr) {
  if (!fr) return "";
  if (fr.whole !== undefined && fr.whole !== 0 && fr.num !== 0) {
    return `${fr.whole} ${Math.abs(fr.num)}/${fr.den}`;
  }
  if (fr.den === 1) return `${fr.num}`;
  if (Math.abs(fr.num) >= fr.den) {
    const whole = Math.trunc(fr.num / fr.den);
    const rem = Math.abs(fr.num % fr.den);
    if (rem === 0) return `${whole}`;
    return `${whole} ${rem}/${fr.den}`;
  }
  return `${fr.num}/${fr.den}`;
}
function parseFractionInput(text) {
  if (!text) return null;
  text = text.trim();
  const mixedMatch = text.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const n = parseInt(mixedMatch[2], 10);
    const d = parseInt(mixedMatch[3], 10);
    if (!Number.isFinite(whole) || !Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    const sign = whole < 0 ? -1 : 1;
    return simplify(whole * d + sign * n, d);
  }
  const fracMatch = text.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const n = parseInt(fracMatch[1], 10);
    const d = parseInt(fracMatch[2], 10);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return simplify(n, d);
  }
  const intMatch = text.match(/^(-?\d+)$/);
  if (intMatch) {
    const n = parseInt(intMatch[1], 10);
    return simplify(n, 1);
  }
  return null;
}

// ---------- Levels & timing ----------
function currentLevel() {
  return (levelSelect && levelSelect.value) || "easy";
}
const LEVEL_CONFIG = {
  easy: {
    choiceCount: 3,
    roundTimeMs: 90000,
    fallDurationSeconds: 90,
    miniTriggerScore: 1200,
    miniTargetCount: 6,
    miniMaxCount: 8,
    miniSpeed: 170
  },
  easy25: {
    choiceCount: 3,
    roundTimeMs: 90000,
    fallDurationSeconds: 90,
    miniTriggerScore: 1300,
    miniTargetCount: 7,
    miniMaxCount: 9,
    miniSpeed: 190
  },
  medium25: {
    choiceCount: 4,
    roundTimeMs: 45000,
    fallDurationSeconds: 46,
    miniTriggerScore: 1600,
    miniTargetCount: 8,
    miniMaxCount: 11,
    miniSpeed: 225
  },
  medium: {
    choiceCount: 4,
    roundTimeMs: 45000,
    fallDurationSeconds: 46,
    miniTriggerScore: 1600,
    miniTargetCount: 8,
    miniMaxCount: 11,
    miniSpeed: 225
  },
  mathanomical: {
    choiceCount: 5,
    roundTimeMs: 120000,
    fallDurationSeconds: 180,
    miniTriggerScore: 2000,
    miniTargetCount: 10,
    miniMaxCount: 14,
    miniSpeed: 280
  }
};
function getLevelConfig(level) {
  return LEVEL_CONFIG[level] || LEVEL_CONFIG.easy;
}
// mathanomical mixed numbers config - user requested 1 1/8 up to 10 9/10
const LEVEL_RANGES = {
  easy: { min: 1, max: 25 },
  easy25: { minDen: 2, maxDen: 19, maxNum: 20 },
  medium25: { minDen: 2, maxDen: 12, maxNum: 20 },
  medium: { min: 2, max: 20 }, // denominators for medium
  mathanomical: { minWhole: 1, maxWhole: 10, minDen: 8, maxDen: 10 },
};

// ---------- Bubble ----------
class Bubble {
  constructor(labelFrac, x) {
    this.fraction = labelFrac; // {num,den} or mixed-like display object accepted by formatDisplay
    this.x = x;
    this.y = -40;
    this.radius = 40;
    this.w = 92;
    this.h = 114;
    this.sprite = createSyntaxBugSprite();
    this.speed = computePxPerSec(currentLevel()); // px/sec
  }

  update(deltaSec) {
    this.y += this.speed * deltaSec;
    if (this.y - this.radius > (canvas ? canvas.height : 600)) {
      handleBubbleHitBottom();
    }
  }

  draw() {
    if (!ctx) return;
    drawSyntaxBug(ctx, this.x, this.y, this.w, this.h, this.sprite, formatDisplay(this.fraction) || '');
  }

  isClicked(mouseX, mouseY) {
    return (
      mouseX >= this.x - this.w * 0.5 &&
      mouseX <= this.x + this.w * 0.5 &&
      mouseY >= this.y - this.h * 0.48 &&
      mouseY <= this.y + this.h * 0.52
    );
  }
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function createSyntaxBugSprite() {
  return {
    head: pick(BUG_HEADS),
    phrase: pick(BROKEN_PHRASES),
    armL: pick(BUG_SYMBOLS),
    armR: pick(BUG_SYMBOLS),
    handL: pick(BUG_HANDS_LEFT),
    handR: pick(BUG_HANDS_RIGHT),
    legL: pick(['1', '7', '|', '/']),
    legR: pick(['2', '4', '|', '\\']),
    footL: pick(BUG_FEET_LEFT),
    footR: pick(BUG_FEET_RIGHT),
    tilt: (Math.random() - 0.5) * 0.36,
    limbWarpL: (Math.random() - 0.5) * 16,
    limbWarpR: (Math.random() - 0.5) * 16,
    hue: randInt(188, 328)
  };
}

function drawSyntaxBug(context, x, y, w, h, sprite, torsoLabel) {
  const bodyTop = y - h * 0.28;
  const bodyH = h * 0.52;
  const bodyW = w * 0.64;
  const bodyX = x - bodyW * 0.5;
  const bodyY = bodyTop;
  const headY = y - h * 0.48;
  const legY = y + h * 0.22;

  context.save();
  context.translate(x, y);
  context.rotate(sprite.tilt);
  context.translate(-x, -y);

  // Ground/contact shadow
  context.fillStyle = 'rgba(2, 8, 24, 0.52)';
  context.beginPath();
  context.ellipse(x, y + h * 0.5, w * 0.44, h * 0.1, 0, 0, Math.PI * 2);
  context.fill();

  // Ambient soft glow for pseudo-4D depth
  context.fillStyle = `hsla(${sprite.hue}, 78%, 62%, 0.17)`;
  context.beginPath();
  context.ellipse(x, y + 6, w * 0.62, h * 0.58, 0, 0, Math.PI * 2);
  context.fill();

  // Torso plate
  const torsoGradient = context.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH);
  torsoGradient.addColorStop(0, '#203764');
  torsoGradient.addColorStop(0.55, '#17284c');
  torsoGradient.addColorStop(1, '#0a132a');
  context.fillStyle = torsoGradient;
  roundRect(context, bodyX, bodyY, bodyW, bodyH, 14);
  context.fill();
  context.strokeStyle = 'rgba(180, 210, 255, 0.88)';
  context.lineWidth = 2;
  roundRect(context, bodyX, bodyY, bodyW, bodyH, 14);
  context.stroke();

  // Bevel highlight
  context.strokeStyle = 'rgba(234, 247, 255, 0.34)';
  context.lineWidth = 1.2;
  roundRect(context, bodyX + 4, bodyY + 3, bodyW - 8, bodyH - 9, 10);
  context.stroke();

  // Head glyph
  context.fillStyle = '#eff8ff';
  context.font = `900 ${Math.max(20, Math.round(h * 0.2))}px "Courier New", monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = 'rgba(120, 170, 255, 0.5)';
  context.shadowBlur = 10;
  context.fillText(sprite.head, x, headY);
  context.shadowBlur = 0;

  // Disfigured arms/hands
  context.fillStyle = '#e8f4ff';
  context.font = `800 ${Math.max(15, Math.round(h * 0.12))}px "Courier New", monospace`;
  context.fillText(sprite.armL, x - bodyW * 0.7 + sprite.limbWarpL * 0.2, bodyY + bodyH * 0.34);
  context.fillText(sprite.armR, x + bodyW * 0.7 + sprite.limbWarpR * 0.2, bodyY + bodyH * 0.31);
  context.font = `700 ${Math.max(13, Math.round(h * 0.1))}px "Courier New", monospace`;
  context.fillText(sprite.handL, x - bodyW * 0.86 + sprite.limbWarpL * 0.3, bodyY + bodyH * 0.5);
  context.fillText(sprite.handR, x + bodyW * 0.86 + sprite.limbWarpR * 0.3, bodyY + bodyH * 0.47);

  // Torso broken phrase + target fraction
  context.fillStyle = '#f6fbff';
  context.font = '700 11px "Courier New", monospace';
  context.fillText(sprite.phrase, x, bodyY + bodyH * 0.28);
  context.font = '900 15px "Courier New", monospace';
  context.fillStyle = '#bdf8c8';
  context.fillText(torsoLabel, x, bodyY + bodyH * 0.62);

  // Legs + feet
  context.fillStyle = '#e9f4ff';
  context.font = `900 ${Math.max(14, Math.round(h * 0.12))}px "Courier New", monospace`;
  context.fillText(sprite.legL, x - bodyW * 0.2 + sprite.limbWarpL * 0.1, legY);
  context.fillText(sprite.legR, x + bodyW * 0.2 + sprite.limbWarpR * 0.1, legY + 2);
  context.font = `800 ${Math.max(12, Math.round(h * 0.09))}px "Courier New", monospace`;
  context.fillText(sprite.footL, x - bodyW * 0.27, legY + 14);
  context.fillText(sprite.footR, x + bodyW * 0.27, legY + 14);

  context.restore();
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}
function computePxPerSec(level) {
  syncCanvasSize();
  const distance = (canvas ? canvas.height : 600) + 80;
  const secs = getLevelConfig(level).fallDurationSeconds || 14;
  return distance / Math.max(0.001, secs);
}

// ---------- Ensure correct included ----------
function ensureCorrectIncluded(arrChoices, correct) {
  if (!correct) return arrChoices;
  if (arrChoices.some(c => fractionsEqual(c, correct))) return arrChoices;
  if (arrChoices.length > 0) {
    const idx = Math.min(arrChoices.length - 1, Math.max(0, Math.floor(Math.random() * arrChoices.length)));
    arrChoices[idx] = correct;
  } else {
    arrChoices.push(correct);
  }
  return arrChoices;
}

// ---------- Mathanomical problem generator (mixed numbers) ----------
function pickMixedNumberForMathanomical() {
  const cfg = LEVEL_RANGES.mathanomical;
  const whole = randInt(cfg.minWhole, cfg.maxWhole);
  const den = randInt(cfg.minDen, cfg.maxDen); // 8..10
  const num = randInt(1, den - 1);
  return { whole, num, den, toImproper: () => simplify(whole * den + num, den) };
}

function generateMathanomicalProblem(choiceCount = 5) {
  // create two mixed operands
  let a = pickMixedNumberForMathanomical();
  let b = pickMixedNumberForMathanomical();
  const op = Math.random() < 0.5 ? "+" : "-";

  let A = a.toImproper();
  let B = b.toImproper();
  let rawRes = op === "+" ? addFractions(A, B) : subFractions(A, B);

  if (!rawRes) return generateMathanomicalProblem(choiceCount);

  const simplifiedResult = simplify(rawRes.num, rawRes.den);
  if (!simplifiedResult) return generateMathanomicalProblem(choiceCount);

  const display = `${formatDisplay(a)} ${op} ${formatDisplay(b)}`;

  // Generate tricky distractors:
  const choices = [simplifiedResult];
  let attempts = 0;
  while (choices.length < choiceCount && attempts++ < 1000) {
    const t = Math.random();
    let cand = null;
    if (t < 0.22) {
      // forgot to convert: add numerators but use one denominator
      const wrongNum = A.num + (op === "+" ? B.num : -B.num);
      cand = simplify(wrongNum, A.den);
    } else if (t < 0.44) {
      // off-by-one in whole part
      const approxWhole = Math.max(0, Math.trunc((A.num / A.den) + (op === "+" ? (B.num / B.den) : -(B.num / B.den))) + randInt(-1,1));
      const dn = randInt(-1,1);
      const dd = simplifiedResult.den;
      cand = simplify(Math.max(1, approxWhole * dd + Math.max(0, simplifiedResult.num + dn)), dd);
    } else if (t < 0.66) {
      // denominator error: choose nearby denominator
      cand = simplify(Math.max(1, simplifiedResult.num + randInt(-2,2)), Math.max(1, simplifiedResult.den + randInt(-2,2)));
    } else {
      // swap numerator/denominator-like confusion
      cand = simplify(Math.max(1, simplifiedResult.den + randInt(-1,2)), Math.max(1, simplifiedResult.num + randInt(1,3)));
    }
    if (!cand) continue;
    if (!choices.some(c => fractionsEqual(c, cand))) choices.push(cand);
  }

  // fallback fillers if needed
  const fallback = [{ num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }, { num: 7, den: 12 }];
  for (const f of fallback) {
    if (choices.length >= choiceCount) break;
    if (!choices.some(c => fractionsEqual(c, f))) choices.push(f);
  }

  ensureCorrectIncluded(choices, simplifiedResult);

  // sanitize and unique
  const final = [];
  for (const c of shuffleArr(choices)) {
    const s = simplify(c.num, c.den);
    if (!s) continue;
    if (!final.some(u => fractionsEqual(u, s))) final.push(s);
    if (final.length >= choiceCount) break;
  }
  // fill if short
  let fi = 0;
  while (final.length < choiceCount && fi < fallback.length) {
    if (!final.some(u => fractionsEqual(u, fallback[fi]))) final.push(fallback[fi]);
    fi++;
  }

  const hint = `Hint: Convert mixed numbers to improper fractions, use a common denominator, then ${op === "+" ? "add" : "subtract"} numerators and simplify.`;

  return {
    type: "mathanomical",
    op,
    display,
    correct: simplifiedResult,
    hint,
    choices: final.slice(0, choiceCount)
  };
}

// small helpers for easy/medium generators (kept simple)
function pickSimpleForEasy() {
  const range = LEVEL_RANGES.easy;
  const den = randInt(2, Math.min(range.max, 12));
  const num = randInt(1, Math.min(den - 1, Math.max(1, Math.floor(den * 0.6))));
  return simplify(num, den);
}
function pickSimpleFractionForMedium() {
  const range = LEVEL_RANGES.medium;
  const den = randInt(range.min, range.max);
  const num = randInt(1, den - 1);
  return simplify(num, den);
}

function generateEasyProblem(choiceCount = 3) {
  const simplified = pickSimpleForEasy();
  const range = LEVEL_RANGES.easy;
  const maxFactor = Math.max(2, Math.floor(range.max / Math.max(1, Math.max(simplified.num, simplified.den))));
  const factor = randInt(2, Math.max(2, Math.min(6, maxFactor)));
  const displayed = { num: simplified.num * factor, den: simplified.den * factor };
  const correct = simplify(displayed.num, displayed.den);
  if (!correct) return generateEasyProblem(choiceCount);

  const choices = [correct];
  let attempts = 0;
  while (choices.length < choiceCount && attempts++ < 300) {
    const dn = randInt(-3, 3);
    const dd = randInt(-3, 3);
    const n = Math.max(1, correct.num + dn);
    const d = Math.max(n + 1, correct.den + dd);
    const cand = simplify(n, d);
    if (!cand) continue;
    if (!choices.some(c => fractionsEqual(c, cand))) choices.push(cand);
  }
  const fallback = [{ num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }];
  for (const f of fallback) {
    if (choices.length >= choiceCount) break;
    if (!choices.some(c => fractionsEqual(c, f))) choices.push(f);
  }
  ensureCorrectIncluded(choices, correct);
  const g = gcd(displayed.num, displayed.den);
  const hint = g > 1 ? `Hint: Both numerator and denominator are divisible by ${g}.` : "Hint: Look for a common factor.";
  return { type: "easy", display: `${displayed.num}/${displayed.den}`, correct, hint, choices: shuffleArr(choices).map(simplify) };
}

function generateMediumProblem(choiceCount = 4) {
  const op = Math.random() < 0.5 ? "+" : "-";
  const A = pickSimpleFractionForMedium();
  const B = pickSimpleFractionForMedium();
  if (!A || !B) return generateMediumProblem(choiceCount);
  let rawRes = op === "+" ? addFractions(A, B) : subFractions(A, B);
  if (!rawRes) return generateMediumProblem(choiceCount);
  const simplifiedResult = simplify(rawRes.num, rawRes.den);
  if (!simplifiedResult) return generateMediumProblem(choiceCount);
  const display = `${formatDisplay(A)} ${op} ${formatDisplay(B)}`;
  const choices = [simplifiedResult];
  let attempts = 0;
  while (choices.length < choiceCount && attempts++ < 400) {
    const t = Math.random();
    let cand = null;
    if (t < 0.33) {
      const wrongNum = A.num + B.num;
      cand = simplify(wrongNum, A.den);
    } else if (t < 0.66) {
      const dn = randInt(-2,2);
      const dd = randInt(-2,2);
      cand = simplify(Math.max(1, simplifiedResult.num + dn), Math.max(1, simplifiedResult.den + dd));
    } else {
      cand = simplify(Math.max(1, simplifiedResult.den + randInt(-1,1)), Math.max(1, simplifiedResult.num + randInt(1,3)));
    }
    if (!cand) continue;
    if (!choices.some(c => fractionsEqual(c, cand))) choices.push(cand);
  }
  const fallback = [{ num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }];
  for (const f of fallback) {
    if (choices.length >= choiceCount) break;
    if (!choices.some(c => fractionsEqual(c, f))) choices.push(f);
  }
  ensureCorrectIncluded(choices, simplifiedResult);
  const common = lcm(A.den, B.den);
  const hint = `Hint: Convert to common denominator (${common}), then ${op === "+" ? "add" : "subtract"} numerators and simplify.`;
  return { type: "medium", op, display, correct: simplifiedResult, hint, choices: shuffleArr(choices).map(simplify) };
}

function pickImproperBasicForMedium25() {
  const cfg = LEVEL_RANGES.medium25;
  for (let tries = 0; tries < 80; tries++) {
    const den = randInt(cfg.minDen, cfg.maxDen);
    const maxNumForDen = Math.min(cfg.maxNum, den + 9);
    const num = randInt(den + 1, Math.max(den + 1, maxNumForDen));
    const fr = simplify(num, den);
    if (!fr) continue;
    if (fr.num <= fr.den) continue;
    if (fr.num > cfg.maxNum) continue;
    return fr;
  }
  return { num: 7, den: 4 };
}

function generateMedium25Problem(choiceCount = 4) {
  const op = Math.random() < 0.5 ? "+" : "-";
  const A = pickImproperBasicForMedium25();
  const B = pickImproperBasicForMedium25();
  if (!A || !B) return generateMedium25Problem(choiceCount);

  let rawRes = op === "+" ? addFractions(A, B) : subFractions(A, B);
  if (!rawRes) return generateMedium25Problem(choiceCount);
  const simplifiedResult = simplify(rawRes.num, rawRes.den);
  if (!simplifiedResult) return generateMedium25Problem(choiceCount);

  const display = `${formatDisplay(A)} ${op} ${formatDisplay(B)}`;
  const choices = [simplifiedResult];
  let attempts = 0;
  while (choices.length < choiceCount && attempts++ < 500) {
    const t = Math.random();
    let cand = null;
    if (t < 0.34) {
      const wrongNum = op === "+" ? A.num + B.num : Math.max(1, A.num - B.num);
      cand = simplify(wrongNum, Math.max(A.den, B.den));
    } else if (t < 0.67) {
      const n = Math.max(1, simplifiedResult.num + randInt(-3, 3));
      const d = Math.max(1, simplifiedResult.den + randInt(-2, 2));
      cand = simplify(n, d);
    } else {
      cand = simplify(
        Math.max(1, simplifiedResult.den + randInt(-1, 2)),
        Math.max(1, simplifiedResult.num + randInt(1, 3))
      );
    }
    if (!cand) continue;
    if (!choices.some(c => fractionsEqual(c, cand))) choices.push(cand);
  }

  const fallback = [{ num: 3, den: 2 }, { num: 5, den: 3 }, { num: 7, den: 4 }, { num: 9, den: 5 }];
  for (const f of fallback) {
    if (choices.length >= choiceCount) break;
    if (!choices.some(c => fractionsEqual(c, f))) choices.push(f);
  }
  const finalChoices = shuffleArr(choices).slice(0, choiceCount).map((c) => simplify(c.num, c.den)).filter(Boolean);
  ensureCorrectIncluded(finalChoices, simplifiedResult);
  const common = lcm(A.den, B.den);
  const hint = `Hint: Make denominator ${common}, then ${op === "+" ? "add" : "subtract"} top numbers and simplify.`;
  return { type: "medium25", op, display, correct: simplifiedResult, hint, choices: finalChoices };
}

function buildEasy25Pool() {
  const cfg = LEVEL_RANGES.easy25;
  const pool = [];
  const seen = new Set();
  for (let den = cfg.minDen; den <= cfg.maxDen; den++) {
    for (let num = den + 1; num <= cfg.maxNum; num++) {
      const normalized = simplify(num, den);
      if (!normalized || normalized.num <= normalized.den) continue;
      if (normalized.num > cfg.maxNum || normalized.den > cfg.maxDen) continue;
      // Keep "basic" by preferring already-simplified improper fractions (like 7/4).
      if (gcd(normalized.num, normalized.den) !== 1) continue;
      const key = `${normalized.num}/${normalized.den}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ num: normalized.num, den: normalized.den });
    }
  }
  return pool;
}

function isAllowedEasy25Fraction(fr) {
  const cfg = LEVEL_RANGES.easy25;
  if (!fr) return false;
  return fr.num > fr.den && fr.num <= cfg.maxNum && fr.den <= cfg.maxDen;
}

function nextEasy25Target() {
  if (easy25Deck.length === 0 || easy25DeckIndex >= easy25Deck.length) {
    easy25Deck = shuffleArr(buildEasy25Pool());
    easy25DeckIndex = 0;
  }
  const target = easy25Deck[easy25DeckIndex];
  easy25DeckIndex += 1;
  return target;
}

function generateEasy25Problem(choiceCount = 3) {
  const target = nextEasy25Target() || { num: 7, den: 4 };
  const correct = simplify(target.num, target.den);
  if (!correct || !isAllowedEasy25Fraction(correct)) return generateEasy25Problem(choiceCount);

  const choices = [correct];
  let requiredLookalike = null;
  const whole = Math.trunc(correct.num / correct.den);
  const rem = Math.abs(correct.num % correct.den);
  if (rem > 0) {
    const lookalikeSpecs = [
      { whole, rem: rem + 1 <= correct.den - 1 ? rem + 1 : rem - 1 },
      { whole: whole + 1, rem },
      { whole: Math.max(1, whole - 1), rem }
    ];
    for (const spec of lookalikeSpecs) {
      if (!spec || spec.rem <= 0 || spec.rem >= correct.den) continue;
      const improper = spec.whole * correct.den + spec.rem;
      const cand = simplify(improper, correct.den);
      if (!cand || !isAllowedEasy25Fraction(cand)) continue;
      if (!choices.some(c => fractionsEqual(c, cand))) {
        choices.push(cand);
        requiredLookalike = cand;
        break;
      }
    }
  }

  let attempts = 0;
  while (choices.length < choiceCount && attempts++ < 600) {
    const t = Math.random();
    let cand = null;
    if (t < 0.34) {
      const n = Math.max(target.den + 1, Math.min(LEVEL_RANGES.easy25.maxNum, target.num + randInt(-2, 2) || target.num + 1));
      cand = simplify(n, target.den);
    } else if (t < 0.67) {
      const whole = Math.max(1, Math.trunc(correct.num / correct.den) + randInt(-1, 1));
      const rem = Math.abs(correct.num % correct.den) || 1;
      const badRem = ((rem + randInt(1, correct.den - 1)) % correct.den) || 1;
      cand = simplify(whole * correct.den + badRem, correct.den);
    } else {
      let badDen = Math.max(2, Math.min(LEVEL_RANGES.easy25.maxDen, correct.den + randInt(-2, 2)));
      if (badDen === correct.den) badDen = badDen > 2 ? badDen - 1 : badDen + 1;
      const whole = Math.max(1, Math.trunc(correct.num / correct.den));
      const rem = Math.min(badDen - 1, Math.max(1, Math.abs(correct.num % correct.den)));
      cand = simplify(whole * badDen + rem, badDen);
    }
    if (!cand || !isAllowedEasy25Fraction(cand)) continue;
    if (!choices.some(c => fractionsEqual(c, cand))) choices.push(cand);
  }

  const fallback = [
    simplify(Math.min(LEVEL_RANGES.easy25.maxNum, target.num + 1), target.den),
    simplify(Math.min(LEVEL_RANGES.easy25.maxNum, target.num + 2), target.den),
    simplify(Math.min(LEVEL_RANGES.easy25.maxNum, target.num + target.den), target.den)
  ].filter(Boolean).filter((cand) => isAllowedEasy25Fraction(cand));

  for (const f of fallback) {
    if (choices.length >= choiceCount) break;
    if (!choices.some(c => fractionsEqual(c, f))) choices.push(f);
  }

  // Build final choices deterministically so required lookalike (if any) is preserved.
  const finalChoices = [correct];
  if (requiredLookalike && !finalChoices.some(c => fractionsEqual(c, requiredLookalike))) {
    finalChoices.push(requiredLookalike);
  }
  const extras = shuffleArr(choices).filter((cand) => !finalChoices.some(c => fractionsEqual(c, cand)));
  for (const cand of extras) {
    if (finalChoices.length >= choiceCount) break;
    finalChoices.push(cand);
  }
  while (finalChoices.length < choiceCount) {
    const f = simplify(Math.min(LEVEL_RANGES.easy25.maxNum, target.num + randInt(1, 3)), target.den);
    if (f && isAllowedEasy25Fraction(f) && !finalChoices.some(c => fractionsEqual(c, f))) {
      finalChoices.push(f);
    } else {
      break;
    }
  }
  const slicedChoices = shuffleArr(finalChoices).slice(0, choiceCount);
  ensureCorrectIncluded(slicedChoices, correct);
  const hint = 'Hint: Divide numerator by denominator. Whole number is the quotient; remainder stays over denominator.';
  return {
    type: "easy25",
    display: `${target.num}/${target.den}`,
    correct,
    hint,
    choices: slicedChoices.map((c) => simplify(c.num, c.den)).filter(Boolean)
  };
}

function generateProblemForLevel(level, choiceCount) {
  if (level === "easy") return generateEasyProblem(choiceCount);
  if (level === "easy25") return generateEasy25Problem(choiceCount);
  if (level === "medium25") return generateMedium25Problem(choiceCount);
  if (level === "medium") return generateMediumProblem(choiceCount);
  return generateMathanomicalProblem(choiceCount);
}

function buildFallbackDistractors(correct, desiredCount) {
  const out = [];
  if (!correct || !Number.isFinite(correct.num) || !Number.isFinite(correct.den)) return out;
  const used = new Set();
  let attempts = 0;
  while (out.length < desiredCount && attempts++ < 200) {
    const mode = attempts % 4;
    let cand = null;
    if (mode === 0) {
      cand = simplify(correct.num + randInt(1, 3), correct.den);
    } else if (mode === 1) {
      cand = simplify(Math.max(1, correct.num - randInt(1, 3)), correct.den);
    } else if (mode === 2) {
      cand = simplify(correct.num, Math.max(2, correct.den + randInt(1, 3)));
    } else {
      cand = simplify(Math.max(1, correct.num + randInt(-2, 2)), Math.max(2, correct.den + randInt(-2, 2)));
    }
    if (!cand) continue;
    if (fractionsEqual(cand, correct)) continue;
    const key = `${cand.num}/${cand.den}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push(cand);
  }
  return out;
}

function normalizeProblemChoices(problem, choiceCount) {
  const normalizedCorrect = simplify(problem?.correct?.num, problem?.correct?.den);
  if (!normalizedCorrect) return null;

  const cleanDistractors = [];
  const seen = new Set();
  const raw = Array.isArray(problem?.choices) ? problem.choices : [];
  for (const item of raw) {
    const s = simplify(item?.num, item?.den);
    if (!s) continue;
    if (fractionsEqual(s, normalizedCorrect)) continue;
    const key = `${s.num}/${s.den}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cleanDistractors.push(s);
    if (cleanDistractors.length >= Math.max(0, choiceCount - 1)) break;
  }

  if (cleanDistractors.length < Math.max(0, choiceCount - 1)) {
    const extras = buildFallbackDistractors(normalizedCorrect, (choiceCount - 1) - cleanDistractors.length);
    for (const d of extras) {
      const key = `${d.num}/${d.den}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cleanDistractors.push(d);
      if (cleanDistractors.length >= Math.max(0, choiceCount - 1)) break;
    }
  }

  const finalChoices = shuffleArr([normalizedCorrect, ...cleanDistractors]).slice(0, Math.max(1, choiceCount));
  // Safety: enforce exactly one correct option.
  let correctSeen = 0;
  const enforced = [];
  for (const c of finalChoices) {
    if (fractionsEqual(c, normalizedCorrect)) {
      correctSeen += 1;
      if (correctSeen > 1) continue;
    }
    enforced.push(c);
  }
  if (!enforced.some((c) => fractionsEqual(c, normalizedCorrect))) {
    if (enforced.length > 0) enforced[0] = normalizedCorrect;
    else enforced.push(normalizedCorrect);
  }

  return {
    ...problem,
    correct: normalizedCorrect,
    choices: enforced
  };
}

function generateValidatedProblem(level, choiceCount, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const generated = generateProblemForLevel(level, choiceCount);
    const normalized = normalizeProblemChoices(generated, choiceCount);
    if (!normalized) continue;
    const correctCount = normalized.choices.filter((c) => fractionsEqual(c, normalized.correct)).length;
    if (correctCount !== 1) continue;
    if (normalized.choices.length < Math.max(1, choiceCount)) continue;
    return normalized;
  }
  const emergency = {
    type: level,
    display: '1/2',
    correct: { num: 1, den: 2 },
    hint: 'Pick the fraction equal to one half.',
    choices: [{ num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }].slice(0, Math.max(1, choiceCount))
  };
  return emergency;
}

// ---------- Game flow & timer logic ----------
function updateHud() {
  if (scoreEl) scoreEl.textContent = `Score: ${score}`;
  if (streakEl) streakEl.textContent = `Streak: x${streak}`;
}
function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }
function setHint(msg) { if (hintEl) hintEl.textContent = msg; }
function renderTargetFraction(displayText) {
  if (!targetEl) return;
  const raw = String(displayText || "—");
  const withOps = raw.replace(/\s*([+-])\s*/g, '&nbsp;<span class="capture-op-token">$1</span>&nbsp;');
  const marked = withOps.replace(/(-?\d+)\s*\/\s*(\d+)/g, (_m, num, den) => (
    `<span class="capture-frac-token">${num}/<button type="button" class="capture-denominator-btn" data-denominator="${den}" aria-label="Denominator ${den}. Tap for meaning">${den}</button></span>`
  ));
  targetEl.innerHTML = `Find: <span class="capture-target-expression">${marked}</span>`;
}
function showDenominatorHelp(denominator) {
  if (!denominatorHelpPopup || !denominatorHelpText) return;
  denominatorHelpText.textContent = `Denominator ${denominator}: the bottom number. It tells how many equal parts make one whole.`;
  denominatorHelpPopup.classList.add('show');
  denominatorHelpPopup.setAttribute('aria-hidden', 'false');
}
function hideDenominatorHelp() {
  if (!denominatorHelpPopup) return;
  denominatorHelpPopup.classList.remove('show');
  denominatorHelpPopup.setAttribute('aria-hidden', 'true');
}
function extractFractionsFromPrompt(promptDisplay) {
  const text = String(promptDisplay || "");
  const matches = Array.from(text.matchAll(/(-?\d+)\s*\/\s*(\d+)/g));
  return matches.map((m) => ({
    num: parseInt(m[1], 10),
    den: parseInt(m[2], 10)
  })).filter((f) => Number.isFinite(f.num) && Number.isFinite(f.den) && f.den !== 0);
}
function detectPromptOperation(promptDisplay) {
  const text = String(promptDisplay || "");
  const spaced = text.match(/\s([+-])\s/);
  if (spaced) return spaced[1];
  return null;
}
function buildCorrectiveHint(problem) {
  const text = String(problem?.display || "this fraction");
  const parts = extractFractionsFromPrompt(text);
  const op = problem?.op || detectPromptOperation(text);
  const hasOp = op === "+" || op === "-";
  const opWord = op === "-" ? "subtract" : "add";

  if (hasOp && parts.length >= 2) {
    const a = parts[0];
    const b = parts[1];
    const lcd = lcm(a.den, b.den);
    return `Try this on ${text}: 1) if there is a whole number, change it to an improper fraction first. 2) Find one shared denominator for ${a.den} and ${b.den}: ${lcd}. 3) Rewrite both fractions with denominator ${lcd}. 4) ${opWord} only the top numbers. 5) Keep the same denominator. 6) Simplify at the end.`;
  }

  if (parts.length >= 1) {
    const f = parts[0];
    if (f.num >= f.den) {
      return `Try this on ${text}: 1) divide ${f.num} by ${f.den}. 2) The big number is the whole part. 3) The leftover is the new top number. 4) Keep ${f.den} as the denominator.`;
    }
    return `Try this on ${text}: 1) find a number that divides both ${f.num} and ${f.den}. 2) divide top and bottom by that same number. 3) stop when no bigger shared divisor is left.`;
  }

  return `Try this on ${text}: 1) make denominators match, 2) solve the top numbers, 3) simplify at the end.`;
}
function getActiveBennyTier() {
  const stats = loadProfileStats();
  return Number(stats.activeTier) || 1;
}
function awardPoints(points) {
  score += points;
  const stats = loadProfileStats();
  const gameStats = ensureGameStats(stats, 'capture');
  stats.totalPoints += points;
  gameStats.points += points;
  gameStats.bestScore = Math.max(gameStats.bestScore, score);
  saveProfileStats(stats);
  updateHud();
}

function startGame() {
  if (!canvas || !ctx) return;
  syncCanvasSize();
  clearReviewPauseTimer();
  retryUsedThisRound = false;
  reviewPauseToken += 1;
  score = 0;
  streak = 0;
  miniGameActive = false;
  miniGameDone = false;
  gameStarted = true;
  gamePaused = false;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pause";
  updateHud();
  updateDailyChallengeHint();
  startRound();
  if (!animationId) {
    lastTimestamp = null;
    animationId = requestAnimationFrame(loop);
  }
  const stats = loadProfileStats();
  const gameStats = ensureGameStats(stats, 'capture');
  gameStats.gamesPlayed += 1;
  saveProfileStats(stats);
}

function clearRoundTimeout() {
  if (roundTimer) {
    clearTimeout(roundTimer);
    roundTimer = null;
  }
  roundStartTimestamp = 0;
}

function clearReviewPauseTimer() {
  if (reviewPauseTimer) {
    clearTimeout(reviewPauseTimer);
    reviewPauseTimer = null;
  }
}

function handleRoundTimeout() {
  if (!roundActive) return;
  roundActive = false;
  streak = 0;
  updateHud();
  setStatus("Time's up!");
  clearRoundTimeout();
  setTimeout(startRound, 900);
}

function startRound() {
  if (miniGameActive) return;
  clearReviewPauseTimer();
  retryUsedThisRound = false;
  if (gamePaused) gamePaused = false;
  if (inputEl) inputEl.disabled = false;
  if (pauseBtn) {
    pauseBtn.disabled = false;
    pauseBtn.textContent = "Pause";
  }
  clearRoundTimeout();
  roundActive = true;

  const level = currentLevel();
  updateDailyChallengeHint();
  const choiceCount = getLevelConfig(level).choiceCount || 3;

  currentProblem = generateValidatedProblem(level, choiceCount);

  setStatus("Syntax Bugs incoming. Solve to survive.");
  renderTargetFraction(currentProblem.display);
  if (hintEl) setHint(currentProblem.hint || "");

  // build validated choices
  const rawChoices = currentProblem.choices.slice(0, choiceCount).filter(c => c && Number.isFinite(c.num) && Number.isFinite(c.den) && c.den !== 0);

  syncCanvasSize();
  const xPositions = layOutBubbleX(rawChoices.length);

  // create bubbles immediately when round starts
  bubbles = rawChoices.map((f, idx) => {
    const b = new Bubble(f, xPositions[idx]);
    b.speed = computePxPerSec(level);
    return b;
  });

  // initialize timer values and start the round timeout
  roundRemainingMs = getLevelConfig(level).roundTimeMs || 10000;
  roundStartTimestamp = performance.now();
  roundTimer = setTimeout(handleRoundTimeout, roundRemainingMs);
}

function handleBubbleHitBottom() {
  if (miniGameActive) return;
  if (!roundActive) return;
  roundActive = false;
  streak = 0;
  updateHud();
  setStatus("Missed — new target coming up.");
  clearRoundTimeout();
  setTimeout(startRound, 700);
}

function handleSelection(fraction) {
  if (miniGameActive) return;
  if (!roundActive || !gameStarted) return;
  clearRoundTimeout();
  const correctFraction = simplify(currentProblem?.correct?.num, currentProblem?.correct?.den) || currentProblem?.correct;
  const wasCorrect = fractionsEqual(fraction, correctFraction);
  const stats = loadProfileStats();
  const gameStats = ensureGameStats(stats, 'capture');
  stats.totalAttempted += 1;
  gameStats.attempted += 1;
  if (wasCorrect) {
    score += 100;
    streak += 1;
    setStatus("Nice! New round starting.");
    stats.totalCorrect += 1;
    gameStats.correct += 1;
    stats.totalPoints += 100;
    gameStats.points += 100;
  } else {
    score = Math.max(0, score - 5);
    streak = 0;
    if (!retryUsedThisRound) {
      retryUsedThisRound = true;
      roundActive = false;
      gamePaused = true;
      if (inputEl) inputEl.disabled = true;
      if (pauseBtn) pauseBtn.disabled = true;
      setStatus("Nice try. Read this, then you get one more chance in 20 seconds.");
      setHint(buildCorrectiveHint(currentProblem));
      const token = ++reviewPauseToken;
      clearReviewPauseTimer();
      reviewPauseTimer = setTimeout(() => {
        reviewPauseTimer = null;
        if (!gameStarted || miniGameActive || token !== reviewPauseToken) return;
        gamePaused = false;
        roundActive = true;
        if (inputEl) inputEl.disabled = false;
        if (pauseBtn) {
          pauseBtn.disabled = false;
          pauseBtn.textContent = "Pause";
        }
        roundRemainingMs = getLevelConfig(currentLevel()).roundTimeMs || 10000;
        roundStartTimestamp = performance.now();
        roundTimer = setTimeout(handleRoundTimeout, roundRemainingMs);
        setStatus("Second chance: answer the same question.");
        if (!animationId) {
          lastTimestamp = null;
          animationId = requestAnimationFrame(loop);
        }
      }, 20000);
    } else {
      setStatus("Dont worry about it keep trying, eventually things click");
      setHint(`Use the same steps on the next one. Focus on the denominator first.`);
      roundActive = false;
    }
  }
  const dailyResult = applyDailyChallengeProgress(stats, gameStats, currentLevel(), wasCorrect);
  updateHud();
  if (wasCorrect) maybeTriggerMiniGame();
  gameStats.streakRecord = Math.max(gameStats.streakRecord, streak);
  gameStats.bestScore = Math.max(gameStats.bestScore, score);
  saveProfileStats(stats);
  if (dailyResult.awarded) {
    setStatus(`Daily challenge complete! +${dailyChallenge.points} points.`);
  }
  if (wasCorrect) {
    roundActive = false;
    setTimeout(startRound, 700);
  } else if (retryUsedThisRound && !gamePaused) {
    setTimeout(startRound, 1700);
  }
}

// ---------- Pause/resume preserving remaining time ----------
function togglePause() {
  if (!gameStarted) return;
  if (miniGameActive) return;

  if (!gamePaused) {
    // Pausing
    gamePaused = true;
    pauseBtn.textContent = "Resume";
    setStatus("Paused.");

    if (roundTimer && roundStartTimestamp) {
      const elapsed = performance.now() - roundStartTimestamp;
      roundRemainingMs = Math.max(0, roundRemainingMs - elapsed);
      clearTimeout(roundTimer);
      roundTimer = null;
      roundStartTimestamp = 0;
    }
    return;
  }

  // Resuming
  gamePaused = false;
  pauseBtn.textContent = "Pause";
  setStatus("Resumed — keep going.");

  if (!animationId) {
    lastTimestamp = null;
    animationId = requestAnimationFrame(loop);
  }

  if (roundActive && (!roundTimer) && roundRemainingMs > 0) {
    roundStartTimestamp = performance.now();
    roundTimer = setTimeout(handleRoundTimeout, roundRemainingMs);
  }
}

function getMiniCircleCount(level) {
  return getLevelConfig(level).miniTargetCount || 6;
}

function getMiniCircleSpeed(level) {
  return getLevelConfig(level).miniSpeed || 170;
}

function maybeTriggerMiniGame() {
  if (miniGameActive || miniGameDone || gamePaused) return;
  const requiredScore = getLevelConfig(currentLevel()).miniTriggerScore || 120;
  if (score < requiredScore) return;
  startMiniGame();
}

function startMiniGame() {
  clearRoundTimeout();
  roundActive = false;
  miniGameActive = true;
  miniGameDone = false;
  setStatus("Mini game! Help Benny squash Syntax Bugs for 25 seconds.");
  if (inputEl) inputEl.disabled = true;
  syncCanvasSize();
  document.body.classList.add('capture-mini-active');

  const level = currentLevel();
  const count = getMiniCircleCount(level);
  const speed = getMiniCircleSpeed(level);
  miniCircles = Array.from({ length: count }, () => spawnMiniCircle(speed));
  miniShots = [];
  ensureMiniBenny();
  ensureMiniControls();
  bennyState = {
    x: Math.max(60, (canvas ? canvas.width : 800) / 2),
    y: Math.max(60, (canvas ? canvas.height : 600) - 120),
    speed: 270,
    wag: 0
  };
  miniEndAt = performance.now() + MINI_DURATION_MS;
  miniLastSpawnAt = performance.now();
}

function finishMiniGame() {
  miniGameActive = false;
  miniGameDone = true;
  setStatus("Mini game complete! Back to fractions.");
  if (inputEl) inputEl.disabled = false;
  miniCircles = [];
  miniShots = [];
  bennyState = null;
  if (miniBennyEl) miniBennyEl.style.display = "none";
  if (miniJoystick) miniJoystick.style.display = "none";
  if (miniShootBtn) miniShootBtn.style.display = "none";
  document.body.classList.remove('capture-mini-active');
  setTimeout(startRound, 800);
}

function spawnMiniCircle(speed) {
  const w = randInt(74, 102);
  const h = randInt(88, 124);
  return {
    x: randInt(80, (canvas ? canvas.width : 800) - 80),
    y: randInt(80, (canvas ? canvas.height : 600) - 80),
    r: Math.max(20, Math.round(Math.min(w, h) * 0.32)),
    w,
    h,
    vx: (Math.random() < 0.5 ? -1 : 1) * (speed + randInt(0, 70)),
    vy: (Math.random() < 0.5 ? -1 : 1) * (speed + randInt(0, 70)),
    color: `hsl(${randInt(160, 320)}, 70%, 60%)`,
    sprite: createSyntaxBugSprite(),
    syntaxLabel: pick(BROKEN_PHRASES),
    wobble: Math.random() * Math.PI * 2
  };
}

function miniTimeLeftMs() {
  return Math.max(0, miniEndAt - performance.now());
}

function updateMiniGame(deltaSec) {
  if (!ctx || !canvas || !bennyState) return;
  if (miniTimeLeftMs() <= 0) {
    finishMiniGame();
    return;
  }

  let dx = 0;
  let dy = 0;
  if (keysDown.has('ArrowLeft')) dx -= 1;
  if (keysDown.has('ArrowRight')) dx += 1;
  if (keysDown.has('ArrowUp')) dy -= 1;
  if (keysDown.has('ArrowDown')) dy += 1;
  if (keysDown.has('a') || keysDown.has('A')) dx -= 1;
  if (keysDown.has('d') || keysDown.has('D')) dx += 1;
  if (keysDown.has('w') || keysDown.has('W')) dy -= 1;
  if (keysDown.has('s') || keysDown.has('S')) dy += 1;
  if (miniJoystickActive) {
    dx = miniJoystickVector.x;
    dy = miniJoystickVector.y;
  }
  const mag = Math.hypot(dx, dy) || 1;
  bennyState.x += (dx / mag) * bennyState.speed * deltaSec;
  bennyState.y += (dy / mag) * bennyState.speed * deltaSec;
  bennyState.x = Math.max(30, Math.min((canvas.width || 800) - 30, bennyState.x));
  bennyState.y = Math.max(30, Math.min((canvas.height || 600) - 30, bennyState.y));
  bennyState.wag += deltaSec * 8;
  positionMiniBenny();

  miniShots = miniShots.filter((shot) => {
    shot.x += shot.vx * deltaSec;
    shot.y += shot.vy * deltaSec;
    return shot.x > -40 && shot.x < canvas.width + 40 && shot.y > -40 && shot.y < canvas.height + 40;
  });

  const level = currentLevel();
  const targetCount = getLevelConfig(level).miniTargetCount || 6;
  const maxCount = getLevelConfig(level).miniMaxCount || 9;
  if (miniCircles.length < targetCount && performance.now() - miniLastSpawnAt > MINI_SPAWN_INTERVAL_MS) {
    miniCircles.push(spawnMiniCircle(getMiniCircleSpeed(level)));
    miniLastSpawnAt = performance.now();
  }
  if (miniCircles.length > maxCount) {
    miniCircles = miniCircles.slice(0, maxCount);
  }

  miniCircles.forEach((circle) => {
    circle.x += circle.vx * deltaSec;
    circle.y += circle.vy * deltaSec;
    circle.wobble += deltaSec * (2.8 + Math.random() * 0.3);
    if (circle.x - circle.r < 0 || circle.x + circle.r > canvas.width) circle.vx *= -1;
    if (circle.y - circle.r < 0 || circle.y + circle.r > canvas.height) circle.vy *= -1;
  });

  // collisions: potty bonus
  miniCircles = miniCircles.filter((circle) => {
    const dxC = circle.x - bennyState.x;
    const dyC = circle.y - bennyState.y;
    if (Math.hypot(dxC, dyC) < circle.r + 18) {
      awardPoints(MINI_POINTS_PER_CIRCLE + MINI_POTTY_BONUS);
      setStatus(`Benny potty bonus! +${MINI_POINTS_PER_CIRCLE + MINI_POTTY_BONUS}`);
      return false;
    }
    return true;
  });

  // collisions: shots
  const remainingShots = [];
  miniShots.forEach((shot) => {
    let hit = false;
    miniCircles = miniCircles.filter((circle) => {
      const dxC = circle.x - shot.x;
      const dyC = circle.y - shot.y;
      if (Math.hypot(dxC, dyC) < circle.r + 8) {
        hit = true;
        awardPoints(MINI_POINTS_PER_CIRCLE);
        setStatus(`Syntax Bug zapped! +${MINI_POINTS_PER_CIRCLE}`);
        return false;
      }
      return true;
    });
    if (!hit) remainingShots.push(shot);
  });
  miniShots = remainingShots;

  if (miniCircles.length === 0) {
    const now = performance.now();
    if (now >= miniClearBonusCooldownUntil) {
      awardPoints(1000);
      setStatus("Syntax swarm clear bonus! +1000");
      miniClearBonusCooldownUntil = now + 500;
      const level = currentLevel();
      const count = getMiniCircleCount(level);
      const speed = getMiniCircleSpeed(level);
      miniCircles = Array.from({ length: count }, () => spawnMiniCircle(speed));
      miniLastSpawnAt = now;
    }
  }
}

function drawMiniGame() {
  if (!ctx || !canvas) return;
  const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#0b2342");
  grd.addColorStop(1, "#0e3b5e");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  miniCircles.forEach((circle) => {
    const wobbleX = Math.sin(circle.wobble) * 6;
    const wobbleY = Math.cos(circle.wobble * 1.2) * 4;
    drawSyntaxBug(
      ctx,
      circle.x + wobbleX,
      circle.y + wobbleY,
      circle.w,
      circle.h,
      circle.sprite,
      circle.syntaxLabel
    );
  });

  miniShots.forEach((shot) => {
    ctx.strokeStyle = "#ffef7a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(shot.x - 6, shot.y);
    ctx.lineTo(shot.x + 6, shot.y);
    ctx.stroke();
  });

  drawMiniHud();
}

function drawMiniHud() {
  const timeLeft = miniTimeLeftMs();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(12, 12, 200, 56);
  ctx.fillStyle = "#eaf6ff";
  ctx.font = "600 14px Arial";
  ctx.fillText("Syntax Bug Hunt", 22, 32);
  ctx.font = "12px Arial";
  ctx.fillText(`Time: ${(timeLeft / 1000).toFixed(1)}s`, 22, 50);
  ctx.fillText("Move: Arrow keys / WASD", 22, 66);
}

function ensureMiniBenny() {
  if (miniBennyEl) {
    miniBennyEl.style.display = "block";
    applyMiniBennyColor();
    return;
  }
  if (!canvas) return;
  const anchor = canvas.parentElement;
  if (!anchor) return;
  miniBennyEl = document.createElement('div');
  miniBennyEl.className = 'benny capture-benny';
  miniBennyEl.innerHTML = '<div class="benny-base"><div class="benny-shape"><div class="back"></div><div class="leg-left"></div><div class="leg-right"></div><div class="head"></div></div></div>';
  anchor.appendChild(miniBennyEl);
  applyMiniBennyColor();
}

function positionMiniBenny() {
  if (!miniBennyEl || !bennyState) return;
  const size = 64;
  miniBennyEl.style.left = `${bennyState.x - size / 2}px`;
  miniBennyEl.style.top = `${bennyState.y - size / 2}px`;
}

function getBennyColorKey() {
  return `mathpup_benny_color_${currentUser()}`;
}

function applyMiniBennyColor() {
  if (!miniBennyEl) return;
  const saved = localStorage.getItem(getBennyColorKey());
  const color = BENNY_COLORS.find(c => c.id === saved) || BENNY_COLORS[0];
  const back = miniBennyEl.querySelector('.back');
  const head = miniBennyEl.querySelector('.head');
  if (!back || !head) return;
  if (color.type === 'tone' && color.secondary) {
    back.style.background = color.primary;
    head.style.background = color.secondary;
  } else {
    back.style.background = color.primary;
    head.style.background = color.primary;
  }
}

function ensureMiniControls() {
  if (!canvas) return;
  const anchor = canvas.parentElement;
  if (!anchor) return;
  if (!miniJoystick) {
    miniJoystick = document.createElement('div');
    miniJoystick.className = 'capture-mini-joystick';
    miniJoystick.innerHTML = '<div class="capture-mini-stick"></div>';
    anchor.appendChild(miniJoystick);
    miniStick = miniJoystick.querySelector('.capture-mini-stick');
  }
  if (!miniShootBtn) {
    miniShootBtn = document.createElement('button');
    miniShootBtn.type = 'button';
    miniShootBtn.className = 'capture-mini-shoot';
    miniShootBtn.textContent = 'Shoot';
    anchor.appendChild(miniShootBtn);
    miniShootBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      fireMiniShots();
    }, { passive: false });
    miniShootBtn.addEventListener('click', () => fireMiniShots());
  }
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  miniJoystick.style.display = isMobile && miniGameActive ? 'flex' : 'none';
  miniShootBtn.style.display = isMobile && miniGameActive ? 'block' : 'none';

  const resetMiniJoystick = () => {
    miniJoystickActive = false;
    miniJoystickVector = { x: 0, y: 0 };
    if (miniStick) miniStick.style.transform = 'translate(-50%, -50%)';
  };
  const handleMiniJoystickMove = (clientX, clientY) => {
    const dx = clientX - miniJoystickCenter.x;
    const dy = clientY - miniJoystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const ratio = dist > 0 ? Math.min(1, miniJoystickRadius / dist) : 0;
    const clampedX = dx * ratio;
    const clampedY = dy * ratio;
    miniJoystickVector = {
      x: clampedX / miniJoystickRadius,
      y: clampedY / miniJoystickRadius
    };
    if (miniStick) {
      miniStick.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
    }
  };
  if (miniJoystick) {
    miniJoystick.ontouchstart = (e) => {
      const touch = e.touches[0];
      const rect = miniJoystick.getBoundingClientRect();
      miniJoystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      miniJoystickActive = true;
      handleMiniJoystickMove(touch.clientX, touch.clientY);
      e.preventDefault();
    };
    miniJoystick.ontouchmove = (e) => {
      if (!miniJoystickActive) return;
      const touch = e.touches[0];
      handleMiniJoystickMove(touch.clientX, touch.clientY);
      e.preventDefault();
    };
    miniJoystick.ontouchend = resetMiniJoystick;
    miniJoystick.ontouchcancel = resetMiniJoystick;
  }
}

// ---------- Loop ----------
function loop(timestamp) {
  if (!gameStarted || gamePaused) {
    animationId = null;
    lastTimestamp = null;
    return;
  }
  if (!ctx) return;
  maybeTriggerMiniGame();
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaMs = timestamp - lastTimestamp;
  const deltaSec = deltaMs / 1000;
  lastTimestamp = timestamp;

  if (miniGameActive) {
    updateMiniGame(deltaSec);
    drawMiniGame();
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of bubbles) {
      b.update(deltaSec);
      b.draw();
    }
  }

  animationId = requestAnimationFrame(loop);
}

// ---------- Events ----------
if (startBtn) startBtn.addEventListener("click", () => {
  startGame();
  setStatus("Syntax Bugs incoming. Solve to survive.");
});
if (pauseBtn) pauseBtn.addEventListener("click", togglePause);

if (canvas) {
  canvas.addEventListener("click", (e) => {
    if (!gameStarted || gamePaused) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const hit = bubbles.find((b) => b.isClicked(mouseX, mouseY));
    if (hit) handleSelection(hit.fraction);
  });
}

if (inputEl) {
  inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const parsed = parseFractionInput(inputEl.value.trim());
    inputEl.value = "";
    if (!parsed) {
      setStatus("Enter a fraction like 3/6 or mixed like 1 1/3.");
      return;
    }
    handleSelection(parsed);
  });
}

function fireMiniShots() {
  if (!miniGameActive || !bennyState) return;
  const now = performance.now();
  if (now - lastShotAt < MINI_SHOT_COOLDOWN) return;
  lastShotAt = now;
  const tier = getActiveBennyTier();
  const shotCount = tier >= 3 ? 3 : 2;
  const spread = shotCount === 3 ? [-0.2, 0, 0.2] : [-0.15, 0.15];
  spread.forEach((offset) => {
    miniShots.push({
      x: bennyState.x,
      y: bennyState.y - 16,
      vx: Math.cos(offset) * 420,
      vy: Math.sin(offset) * 420 - 220
    });
  });
}

const keydownHandler = (e) => {
  if (!gameStarted) return;
  keysDown.add(e.key);
  if (e.key === ' ') {
    e.preventDefault();
    fireMiniShots();
  }
};
const keyupHandler = (e) => keysDown.delete(e.key);
window.addEventListener('keydown', keydownHandler);
window.addEventListener('keyup', keyupHandler);

updateHud();
setStatus("Press Start to begin. Syntax Bug alert.");
updateDailyChallengeHint();

if (targetEl) {
  targetFractionClickHandler = (e) => {
    const btn = e.target.closest('.capture-denominator-btn');
    if (!btn) return;
    const den = btn.getAttribute('data-denominator') || '';
    showDenominatorHelp(den);
  };
  targetEl.addEventListener('click', targetFractionClickHandler);
}
if (denominatorHelpClose) {
  denominatorCloseHandler = () => hideDenominatorHelp();
  denominatorHelpClose.addEventListener('click', denominatorCloseHandler);
}
if (denominatorHelpPopup) {
  denominatorBackdropHandler = (e) => {
    if (e.target === denominatorHelpPopup) hideDenominatorHelp();
  };
  denominatorHelpPopup.addEventListener('click', denominatorBackdropHandler);
}
denominatorEscHandler = (e) => {
  if (e.key === 'Escape') hideDenominatorHelp();
};
window.addEventListener('keydown', denominatorEscHandler);

// ---------- helpers ----------
function layOutBubbleX(count) {
  syncCanvasSize();
  const gap = canvas.width / (count + 1);
  return Array.from({ length: count }, (_, i) => gap * (i + 1));
}

window.__CaptureTestHooks = {
  getLevelConfig,
  generateProblemForLevel,
  simplify,
  fractionsEqual
};

window.__CaptureCleanup = () => {
  window.removeEventListener("resize", resizeHandler);
  window.removeEventListener('keydown', keydownHandler);
  window.removeEventListener('keydown', denominatorEscHandler);
  window.removeEventListener('keyup', keyupHandler);
  if (targetEl && targetFractionClickHandler) {
    targetEl.removeEventListener('click', targetFractionClickHandler);
  }
  if (denominatorHelpClose && denominatorCloseHandler) {
    denominatorHelpClose.removeEventListener('click', denominatorCloseHandler);
  }
  if (denominatorHelpPopup && denominatorBackdropHandler) {
    denominatorHelpPopup.removeEventListener('click', denominatorBackdropHandler);
  }
  clearReviewPauseTimer();
  if (roundTimer) {
    clearTimeout(roundTimer);
    roundTimer = null;
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (miniBennyEl) {
    miniBennyEl.remove();
    miniBennyEl = null;
  }
  gamePaused = false;
  gameStarted = false;
  roundActive = false;
};
