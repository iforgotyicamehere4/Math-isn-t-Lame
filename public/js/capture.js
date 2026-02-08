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

// Round timer state for pause/resume
let roundTimer = null;
let roundStartTimestamp = 0;    // performance.now() when the current round timer started
let roundRemainingMs = 0;       // ms remaining for the current round

const recentTargets = [];
const RECENT_LIMIT = 8;
const MINI_TRIGGER_SCORE = 300;
const MINI_POINTS_PER_CIRCLE = 900;
const MINI_POTTY_BONUS = 200;
const MINI_SHOT_COOLDOWN = 240;
const MINI_DURATION_MS = 25000;
const MINI_SPAWN_INTERVAL_MS = 900;
const MINI_TARGET_COUNT = { easy: 6, medium: 8, mathanomical: 10 };
const MINI_MAX_COUNT = { easy: 8, medium: 11, mathanomical: 14 };

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
    return simplify(whole * d + n, d);
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
// mathanomical mixed numbers config - user requested 1 1/8 up to 10 9/10
const LEVEL_RANGES = {
  easy: { min: 1, max: 25 },
  medium: { min: 2, max: 20 }, // denominators for medium
  mathanomical: { minWhole: 1, maxWhole: 10, minDen: 8, maxDen: 10 },
};
// Round timers (ms) - mathanomical = 2 minutes now
const ROUND_TIMES = { easy: 10000, medium: 45000, mathanomical: 120000 };
// Visual fall durations (seconds) - slow down mathanomical (increase seconds) to slow pace
// Previously 92s; we'll set to 180s here to slow it noticeably (you can adjust)
const FALL_DURATION_SECONDS = { easy: 14, medium: 46, mathanomical: 180 };

// ---------- Bubble ----------
class Bubble {
  constructor(labelFrac, x) {
    this.fraction = labelFrac; // {num,den} or mixed-like display object accepted by formatDisplay
    this.x = x;
    this.y = -40;
    this.radius = 38;
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
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#78d3f7";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const txt = formatDisplay(this.fraction) || "";
    ctx.fillText(txt, this.x, this.y);
  }

  isClicked(mouseX, mouseY) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}
function computePxPerSec(level) {
  syncCanvasSize();
  const distance = (canvas ? canvas.height : 600) + 80;
  const secs = FALL_DURATION_SECONDS[level] || 14;
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

  if (rawRes.num < 0) {
    // try swap
    [a, b] = [b, a];
    A = a.toImproper(); B = b.toImproper();
    rawRes = op === "+" ? addFractions(A, B) : subFractions(A, B);
    if (!rawRes) return generateMathanomicalProblem(choiceCount);
    if (rawRes.num < 0) rawRes.num = Math.abs(rawRes.num);
  }

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
  if (rawRes.num < 0) {
    // swap to try to make positive
    rawRes = op === "+" ? addFractions(B, A) : subFractions(B, A);
    if (!rawRes) return generateMediumProblem(choiceCount);
    if (rawRes.num < 0) rawRes.num = Math.abs(rawRes.num);
  }
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
  return { type: "medium", display, correct: simplifiedResult, hint, choices: shuffleArr(choices).map(simplify) };
}

function generateProblemForLevel(level, choiceCount) {
  if (level === "easy") return generateEasyProblem(choiceCount);
  if (level === "medium") return generateMediumProblem(choiceCount);
  return generateMathanomicalProblem(choiceCount);
}

// ---------- Game flow & timer logic ----------
function updateHud() {
  if (scoreEl) scoreEl.textContent = `Score: ${score}`;
  if (streakEl) streakEl.textContent = `Streak: x${streak}`;
}
function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }
function setHint(msg) { if (hintEl) hintEl.textContent = msg; }
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
  score = 0;
  streak = 0;
  miniGameActive = false;
  miniGameDone = false;
  gameStarted = true;
  gamePaused = false;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pause";
  updateHud();
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

function startRound() {
  if (miniGameActive) return;
  clearRoundTimeout();
  roundActive = true;

  const level = currentLevel();
  const choiceCount = level === "easy" ? 3 : level === "medium" ? 4 : 5;

  currentProblem = generateProblemForLevel(level, choiceCount);

  setStatus("Get 'em tiger");
  if (targetEl) targetEl.textContent = `Find: ${currentProblem.display}`;
  if (hintEl) setHint(currentProblem.hint || "");

  // build validated choices
  const rawChoices = currentProblem.choices.slice(0, choiceCount).filter(c => c && Number.isFinite(c.num) && Number.isFinite(c.den) && c.den !== 0);
  const fallback = [{ num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }, { num: 4, den: 5 }, { num: 5, den: 6 }];
  let fi = 0;
  while (rawChoices.length < choiceCount && fi < fallback.length) {
    if (!rawChoices.some(c => fractionsEqual(c, fallback[fi]))) rawChoices.push(fallback[fi]);
    fi++;
  }

  ensureCorrectIncluded(rawChoices, currentProblem.correct);

  syncCanvasSize();
  const xPositions = layOutBubbleX(rawChoices.length);

  // create bubbles immediately when round starts
  bubbles = rawChoices.map((f, idx) => {
    const b = new Bubble(f, xPositions[idx]);
    b.speed = computePxPerSec(level);
    return b;
  });

  // initialize timer values and start the round timeout
  roundRemainingMs = ROUND_TIMES[level] || 10000;
  roundStartTimestamp = performance.now();
  roundTimer = setTimeout(() => {
    if (!roundActive) return;
    roundActive = false;
    streak = 0;
    updateHud();
    setStatus("Time's up!");
    clearRoundTimeout();
    setTimeout(startRound, 900);
  }, roundRemainingMs);
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
  const stats = loadProfileStats();
  const gameStats = ensureGameStats(stats, 'capture');
  stats.totalAttempted += 1;
  gameStats.attempted += 1;
  if (fractionsEqual(fraction, currentProblem.correct)) {
    score += 10;
    streak += 1;
    setStatus("Nice! New round starting.");
    stats.totalCorrect += 1;
    gameStats.correct += 1;
    stats.totalPoints += 10;
    gameStats.points += 10;
  } else {
    score = Math.max(0, score - 5);
    streak = 0;
    setStatus("Not quite — try the next set.");
  }
  updateHud();
  maybeTriggerMiniGame();
  gameStats.streakRecord = Math.max(gameStats.streakRecord, streak);
  gameStats.bestScore = Math.max(gameStats.bestScore, score);
  saveProfileStats(stats);
  roundActive = false;
  setTimeout(startRound, 700);
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
    roundTimer = setTimeout(() => {
      if (!roundActive) return;
      roundActive = false;
      streak = 0;
      updateHud();
      setStatus("Time's up!");
      clearRoundTimeout();
      setTimeout(startRound, 900);
    }, roundRemainingMs);
  }
}

function getMiniCircleCount(level) {
  if (level === 'easy') return 6;
  if (level === 'medium') return 8;
  return 10;
}

function getMiniCircleSpeed(level) {
  if (level === 'easy') return 170;
  if (level === 'medium') return 225;
  return 280;
}

function maybeTriggerMiniGame() {
  if (miniGameActive || miniGameDone || gamePaused) return;
  if (score < MINI_TRIGGER_SCORE) return;
  startMiniGame();
}

function startMiniGame() {
  clearRoundTimeout();
  roundActive = false;
  miniGameActive = true;
  miniGameDone = false;
  setStatus("Mini game! Help Benny tag the circles for 25 seconds.");
  if (inputEl) inputEl.disabled = true;
  syncCanvasSize();

  const level = currentLevel();
  const count = getMiniCircleCount(level);
  const speed = getMiniCircleSpeed(level);
  miniCircles = Array.from({ length: count }, () => spawnMiniCircle(speed));
  miniShots = [];
  ensureMiniBenny();
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
  setTimeout(startRound, 800);
}

function spawnMiniCircle(speed) {
  return {
    x: randInt(80, (canvas ? canvas.width : 800) - 80),
    y: randInt(80, (canvas ? canvas.height : 600) - 80),
    r: randInt(22, 34),
    vx: (Math.random() < 0.5 ? -1 : 1) * (speed + randInt(0, 70)),
    vy: (Math.random() < 0.5 ? -1 : 1) * (speed + randInt(0, 70)),
    color: `hsl(${randInt(160, 320)}, 70%, 60%)`
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
  const targetCount = MINI_TARGET_COUNT[level] || 6;
  const maxCount = MINI_MAX_COUNT[level] || 9;
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
        setStatus(`Nice hit! +${MINI_POINTS_PER_CIRCLE}`);
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
      setStatus("Circle clear bonus! +1000");
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
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
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
  ctx.fillText("Mini Game", 22, 32);
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
  setStatus("Get 'em tiger");
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
setStatus("Press Start to begin.");

// ---------- helpers ----------
function layOutBubbleX(count) {
  syncCanvasSize();
  const gap = canvas.width / (count + 1);
  return Array.from({ length: count }, (_, i) => gap * (i + 1));
}

window.__CaptureCleanup = () => {
  window.removeEventListener("resize", resizeHandler);
  window.removeEventListener('keydown', keydownHandler);
  window.removeEventListener('keyup', keyupHandler);
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
