// decimal.js - Tetris-style Decimal game
// - All levels use a 1250-second timer.
// - Easy rows are spelled decimals; medium/math rows are expressions requiring order of operations.
// - Pause hides the answer input bar so players cannot submit while paused. On resume the input reappears.
// - Palette, adjustable grid, gravity, pause/resume, and solver UI included.
// @ts-nocheck
import {
  buildEasySpelledPhrase,
  buildEasyMixedPhrase,
  buildMixedWholePart,
  buildHundredthsPhrase,
  buildThousandthsPhrase,
  parseEasyRowPhrase
} from './decimal.logic.js';

export default function initDecimal() {
  if (window.__DecimalCleanup) window.__DecimalCleanup();
  window.__DecimalCleanup = null;
  // ---- DOM references ----
  const levelEl = document.getElementById('level');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const backBtn = document.getElementById('backBtn');
  const promptEl = document.getElementById('prompt');
  const hintEl = document.getElementById('hint');
  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const streakEl = document.getElementById('streak');
  const inputEl = document.getElementById('answerInput');
  const feedbackEl = document.getElementById('feedback');

  const colsInput = document.getElementById('colsInput');
  const rowsInput = document.getElementById('rowsInput');
  const cellSizeInput = document.getElementById('cellSizeInput');
  const applyGridBtn = document.getElementById('applyGridBtn');
  const gridPreview = document.getElementById('gridPreview');

  const paletteContainer = document.getElementById('palette');
  const selectedColorPreview = document.getElementById('selectedColorPreview');

  // ---- Config / defaults ----
  let COLS = Number(colsInput?.value) || 15;
  let ROWS = Number(rowsInput?.value) || 15;
  let CELL_SIZE = Number(cellSizeInput?.value) || 28;
  const BASE_COLS = 20;
  const BASE_ROWS = 15;
  let baseCellSize = Number(cellSizeInput?.value) || 28;
  let gridOffsetX = 0;
  let gridOffsetY = 0;
  let BLOCK_COLOR = { primary: '#1f77b4', secondary: '#0b2740' };

  // ---- State ----
  let canvas, ctx;
  let grid = [];
  let running = false;
  let paused = false;
  let score = 0;
  let streak = 0;
  let currentPiece = null; // { blocks:[{r,c,ch}], row, col, width, height }
  let gravityTimer = null;
  let dropRowsRemaining = 10;
  let answerRevealRemaining = 3;

  // All levels 1,250 seconds = 1,250,000 ms
  const ROUND_TIMES = {
    easy: 1250000,
    medium: 1250000,
    medium5: 1250000,
    mathamatical: 1250000
  };

  let roundTimeout = null;
  let roundStartTime = 0;
  let roundRemainingMs = 0;
  let tickInterval = null;
  let selectedRow = null;
  let selectedCol = null;
  let selectedRowExpr = null;
  let selectedColExpr = null;
  const EPS = 0.001;
  let miniGameActive = false;
  let miniOverlay = null;
  let miniArena = null;
  let miniBenny = null;
  let miniCollectibles = [];
  let miniHazards = [];
  let miniDeskText = null;
  let miniTimerText = null;
  let miniAnimId = null;
  let miniKeys = { left: false, right: false, up: false, down: false };
  let miniRoundEndsAt = 0;
  let miniCollected = 0;
  let miniSpawnAt = 0;
  const miniRoundMs = 18000;
  let miniJoystick = null;
  let miniStick = null;
  let miniJoystickActive = false;
  let miniJoystickVector = { x: 0, y: 0 };
  let miniJoystickCenter = { x: 0, y: 0 };
  const miniJoystickRadius = 28;
  let inputKeydownHandler = null;
  let applyGridHandler = null;
  let levelChangeHandler = null;
  let startHandler = null;
  let updatePreviewHandler = null;
  let pauseHandler = null;
  let nextLevelAfterWin = null;
  let correctiveLockUntil = 0;
  let correctiveLockAxis = null;
  let correctiveLockIndex = null;
  let correctiveCountdownTimer = null;

  function currentUser() {
    return localStorage.getItem('mathpop_current_user') || 'guest';
  }

  function profileStatsKey() {
    return `mathpop_profile_stats_${currentUser()}`;
  }

  function deskFuelKey() {
    return `mathpop_benny_desk_fuel_${currentUser()}`;
  }

  function deskChargeKey() {
    return `mathpop_benny_desk_charge_${currentUser()}`;
  }

  function loadDeskFuel() {
    return Math.max(0, parseInt(localStorage.getItem(deskFuelKey()) || '0', 10) || 0);
  }

  function loadDeskCharge() {
    return Math.max(0, parseInt(localStorage.getItem(deskChargeKey()) || '0', 10) || 0);
  }

  function addDeskFuelFromDesks(amount) {
    const desksAdded = Math.max(0, Math.floor(amount));
    const currentFuel = loadDeskFuel();
    const currentCharge = loadDeskCharge();
    if (!desksAdded) {
      return { tanksEarned: 0, fuelBank: currentFuel, chargeRemainder: currentCharge };
    }
    const totalCharge = currentCharge + desksAdded;
    const tanksEarned = Math.floor(totalCharge / 6);
    const chargeRemainder = totalCharge % 6;
    const fuelBank = currentFuel + tanksEarned;
    localStorage.setItem(deskChargeKey(), String(chargeRemainder));
    localStorage.setItem(deskFuelKey(), String(fuelBank));
    return { tanksEarned, fuelBank, chargeRemainder };
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

  function recordAttempt(isCorrect, pointsEarned) {
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'decimal');
    stats.totalAttempted += 1;
    gameStats.attempted += 1;
    if (isCorrect) {
      stats.totalCorrect += 1;
      gameStats.correct += 1;
      stats.totalPoints += pointsEarned;
      gameStats.points += pointsEarned;
    }
    gameStats.streakRecord = Math.max(gameStats.streakRecord, streak);
    gameStats.bestScore = Math.max(gameStats.bestScore, score);
    saveProfileStats(stats);
  }

  function getLevelConfig() {
    const raw = getRawLevelValue();
    if (raw.startsWith('easy')) {
      const cols = parseInt(raw.replace('easy', ''), 10) || 20;
      return { level: 'easy', cols };
    }
    if (raw === 'medium') return { level: 'medium', cols: Number(colsInput?.value) || 25 };
    return { level: 'mathamatical', cols: Number(colsInput?.value) || 25 };
  }

  function normalizeLevelValue() {
    const raw = getRawLevelValue();
    if (raw.startsWith('easy')) return 'easy';
    if (raw === 'medium') return 'medium';
    return 'mathamatical';
  }

  function applyLevelConfig() {
    const cfg = getLevelConfig();
    COLS = cfg.cols;
    ROWS = 15;
    if (rowsInput) {
      rowsInput.value = String(ROWS);
      rowsInput.disabled = true;
    }
    if (colsInput) {
      colsInput.value = String(COLS);
      colsInput.disabled = cfg.level === 'easy';
    }
    if (applyGridBtn) applyGridBtn.disabled = cfg.level === 'easy';
  }

  // Palette (50 acrylic-like colors)
  const ACRYLICS = [
    { id: 'dp-01', primary: '#0c0b18', secondary: '#3b0f58' },
    { id: 'dp-02', primary: '#0b1026', secondary: '#0f6b6d' },
    { id: 'dp-03', primary: '#160a2a', secondary: '#5b1e57' },
    { id: 'dp-04', primary: '#071a24', secondary: '#164c70' },
    { id: 'dp-05', primary: '#140b1f', secondary: '#6b2a3f' },
    { id: 'dp-06', primary: '#09131c', secondary: '#246b4f' },
    { id: 'dp-07', primary: '#0e0f1e', secondary: '#4a2f8a' },
    { id: 'dp-08', primary: '#0a1a1f', secondary: '#1e5a7a' },
    { id: 'dp-09', primary: '#131126', secondary: '#3f2d78' },
    { id: 'dp-10', primary: '#0d1a2d', secondary: '#1b5ea5' },
    { id: 'dp-11', primary: '#150b24', secondary: '#6d1f5f' },
    { id: 'dp-12', primary: '#111629', secondary: '#3c5bdc' },
    { id: 'dp-13', primary: '#0f0e1d', secondary: '#7a2bff' },
    { id: 'dp-14', primary: '#0b1426', secondary: '#2f8bff' },
    { id: 'dp-15', primary: '#120d1a', secondary: '#ff2f92' },
    { id: 'dp-16', primary: '#0f1216', secondary: '#27f2ff' },
    { id: 'dp-17', primary: '#170f25', secondary: '#8a4bff' },
    { id: 'dp-18', primary: '#0f1a24', secondary: '#22d3ee' },
    { id: 'dp-19', primary: '#120a1c', secondary: '#ff5e5e' },
    { id: 'dp-20', primary: '#10121d', secondary: '#c97bff' },
    { id: 'dp-21', primary: '#0b0f18', secondary: '#19b5a5' },
    { id: 'dp-22', primary: '#0f1422', secondary: '#ff8a3d' },
    { id: 'dp-23', primary: '#0c1520', secondary: '#3dd6ff' },
    { id: 'dp-24', primary: '#140c1c', secondary: '#ff42c7' },
    { id: 'dp-25', primary: '#0d1420', secondary: '#40ff8a' },
    { id: 'dp-26', primary: '#0b1222', secondary: '#7c7cff' },
    { id: 'dp-27', primary: '#0f0b18', secondary: '#ff6a00' },
    { id: 'dp-28', primary: '#0d1a2b', secondary: '#00d1ff' },
    { id: 'dp-29', primary: '#0f0f1b', secondary: '#ff4f7b' },
    { id: 'dp-30', primary: '#101821', secondary: '#23c3ff' },
    { id: 'dp-31', primary: '#120b1e', secondary: '#a855f7' },
    { id: 'dp-32', primary: '#0a1622', secondary: '#00f5a0' },
    { id: 'dp-33', primary: '#0c101f', secondary: '#4ade80' },
    { id: 'dp-34', primary: '#0f1428', secondary: '#60a5fa' },
    { id: 'dp-35', primary: '#150c20', secondary: '#f472b6' },
    { id: 'dp-36', primary: '#0d1821', secondary: '#14b8a6' },
    { id: 'dp-37', primary: '#140c24', secondary: '#e879f9' },
    { id: 'dp-38', primary: '#0b151f', secondary: '#22d3ee' },
    { id: 'dp-39', primary: '#0f0c1f', secondary: '#a3e635' },
    { id: 'dp-40', primary: '#0e1420', secondary: '#38bdf8' },
    { id: 'dp-41', primary: '#130d22', secondary: '#f97316' },
    { id: 'dp-42', primary: '#0c1723', secondary: '#06b6d4' },
    { id: 'dp-43', primary: '#120c1a', secondary: '#fb7185' },
    { id: 'dp-44', primary: '#0d1524', secondary: '#3b82f6' },
    { id: 'dp-45', primary: '#130c1f', secondary: '#d946ef' },
    { id: 'dp-46', primary: '#0b1620', secondary: '#10b981' },
    { id: 'dp-47', primary: '#0f0d18', secondary: '#facc15' },
    { id: 'dp-48', primary: '#0c1326', secondary: '#6366f1' },
    { id: 'dp-49', primary: '#100b1d', secondary: '#f43f5e' },
    { id: 'dp-50', primary: '#0c1726', secondary: '#0ea5e9' }
  ];

  // For guaranteed rows we maintain a queue of targetRows (strings of length COLS)
  let targetRows = []; // array of { str: string, level: 'easy'|'medium'|'mathamatical', filled: Array<boolean> }

  // ---- Utilities ----
  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function shuffle(arr){ return arr.slice().sort(()=>Math.random()-0.5); }
  function displayNumber(n){ return Number(n).toFixed(3).replace(/\.?0+$/,''); }

  function getRawLevelValue() {
    return (levelEl && levelEl.value) || 'easy20';
  }

  const BACKGROUND_PATTERNS = {
    easy20: [
      { name: 'euler-vortex', map: [
        '...#####.....',
        '..#...#..###.',
        '.#....#.#...#',
        '#.....###...#',
        '#....##.....#',
        '.#..###..#...',
        '..#...#..#...',
        '...###..#....',
        '....#..###...'
      ]},
      { name: 'quadratic-wave', map: [
        '.....#.......',
        '....#.#......',
        '...#...#.....',
        '..#.....#....',
        '.#.......#...',
        '#.........#..',
        '.#.......#...',
        '..#.....#....',
        '...#...#.....'
      ]},
      { name: 'sine-cosine', map: [
        '..#.....#....',
        '.#.#...#.#...',
        '#...#.#...#..',
        '.#...#...#...',
        '..#...#...#..',
        '.#...#...#...',
        '#..#...#..#..',
        '.#.#...#.#...',
        '..#.....#....'
      ]},
      { name: 'log-tunnel', map: [
        '#############',
        '##.........##',
        '#..#######..#',
        '#..#.....#..#',
        '#..#..#..#..#',
        '#..#.....#..#',
        '#..#######..#',
        '##.........##',
        '#############'
      ]},
      { name: 'exponential-bloom', map: [
        '.....#.......',
        '...#.#.#.....',
        '..#..#..#....',
        '..#..#..#....',
        '.##.###.##...',
        '..#..#..#....',
        '..#..#..#....',
        '...#.#.#.....',
        '.....#.......'
      ]}
    ],
    easy25: [
      { name: 'mandelbrot', map: [
        '....#####....',
        '..#########..',
        '.###########.',
        '.###########.',
        '.###########.',
        '..#########..',
        '...#######...',
        '....#####....',
        '.....###.....'
      ]},
      { name: 'julia-dream', map: [
        '....###..###.',
        '...####..####',
        '..#####..####',
        '..####....###',
        '..####....###',
        '..#####..####',
        '...####..####',
        '....###..###.',
        '.....#....#..'
      ]},
      { name: 'chaos-glitch', map: [
        '#..#...#..#..',
        '.#....##.....',
        '...##...#.#..',
        '#...#..#....#',
        '..#..#...##..',
        '.##....#..#..',
        '..#.#...##...',
        '#..##.....#..',
        '.#..#..#..#..'
      ]},
      { name: 'spiral-stair', map: [
        '#............',
        '##...........',
        '.##..........',
        '..##.........',
        '...##........',
        '....##.......',
        '.....##......',
        '......##.....',
        '.......##....'
      ]},
      { name: 'butterfly', map: [
        '..##.....##..',
        '.###.....###.',
        '#####...#####',
        '.###..#..###.',
        '..##.###.##..',
        '.###..#..###.',
        '#####...#####',
        '.###.....###.',
        '..##.....##..'
      ]}
    ],
    easy30: [
      { name: 'fourier-spectrum', map: [
        '....#...#....',
        '...##..###...',
        '..###.####...',
        '.####.#####..',
        '#####.#####..',
        '#####.######.',
        '######.######',
        '######.######',
        '#############'
      ]},
      { name: 'wave-interference', map: [
        '#.#.#.#.#.#.#',
        '.#.#.#.#.#.#.',
        '#.#.#.#.#.#.#',
        '.#.#.#.#.#.#.',
        '#.#.#.#.#.#.#',
        '.#.#.#.#.#.#.',
        '#.#.#.#.#.#.#',
        '.#.#.#.#.#.#.',
        '#.#.#.#.#.#.#'
      ]},
      { name: 'beat-grid', map: [
        '##..##..##..#',
        '..##..##..##.',
        '##..##..##..#',
        '..##..##..##.',
        '##..##..##..#',
        '..##..##..##.',
        '##..##..##..#',
        '..##..##..##.',
        '##..##..##..#'
      ]},
      { name: 'harmonic-rings', map: [
        '...#####.....',
        '..#.....#....',
        '.#..###..#...',
        '.#..#.#..#...',
        '.#..###..#...',
        '..#.....#....',
        '...#####.....',
        '.............',
        '.............'
      ]},
      { name: 'rhythm-matrix', map: [
        '###...###...#',
        '#..#..#..#..#',
        '###...###...#',
        '..#.....#....',
        '###...###...#',
        '#..#..#..#..#',
        '###...###...#',
        '....#....#...',
        '###...###...#'
      ]}
    ],
    medium: [
      { name: 'impossible-triangle', map: [
        '......#......',
        '.....#.#.....',
        '....#...#....',
        '...#.....#...',
        '..#.......#..',
        '.#.........#.',
        '#############',
        '............#',
        '###########..'
      ]},
      { name: 'tessellation', map: [
        '..#...#...#..',
        '.#.#.#.#.#.#.',
        '#...#...#...#',
        '.#.#.#.#.#.#.',
        '..#...#...#..',
        '.#.#.#.#.#.#.',
        '#...#...#...#',
        '.#.#.#.#.#.#.',
        '..#...#...#..'
      ]},
      { name: 'mobius-loop', map: [
        '..####...####',
        '.#....#.#....',
        '#......#.....',
        '#.....#......',
        '.#....#.#....',
        '..####...####',
        '....#.#....#.',
        '.....#......#',
        '....#........'
      ]},
      { name: 'golden-garden', map: [
        '....#####....',
        '...#.....#...',
        '..#..###..#..',
        '.#..#...#..#.',
        '.#..#...#..#.',
        '..#..###..#..',
        '...#.....#...',
        '....#####....',
        '......#......'
      ]},
      { name: 'polyhedron', map: [
        '....#####....',
        '...#.....#...',
        '..#.......#..',
        '.#.........#.',
        '.#.........#.',
        '..#.......#..',
        '...#.....#...',
        '....#####....',
        '.............'
      ]}
    ],
    mathamatical: [
      { name: 'number-soup', map: [
        '#.#.##..#.#.#',
        '##..#.#..##..',
        '.#.#..##.#.#.',
        '##..##..#..##',
        '#..#.#.##..#.',
        '.##..#..##..#',
        '#.#..##.#..##',
        '##..#..##.#..',
        '.#.#.##..#.#.'
      ]},
      { name: 'graffiti-wall', map: [
        '########.....',
        '#######....#.',
        '######...##..',
        '#####...###..',
        '####...####..',
        '###...#####..',
        '##...######..',
        '#...#######..',
        '...########..'
      ]},
      { name: 'infinity-raceway', map: [
        '...####.####.',
        '..#....#....#',
        '.#.....#.....',
        '.#....#.#....',
        '.#.....#.....',
        '..#....#....#',
        '...####.####.',
        '.............',
        '.............'
      ]},
      { name: 'probability-cloud', map: [
        '.....###.....',
        '....#####....',
        '...#######...',
        '..#########..',
        '.###########.',
        '..#########..',
        '...#######...',
        '....#####....',
        '.....###.....'
      ]},
      { name: 'mathanomical-void', map: [
        '#....#....#..',
        '...#.....#...',
        '.....#.......',
        '..#.......#..',
        '....#..#.....',
        '#.......#....',
        '....#........',
        '..#....#.....',
        '.....#....#..'
      ]}
    ]
  };

  let backgroundMask = null;
  let backgroundPatternName = '';

  function buildMaskFromPattern(pattern) {
    if (!pattern || !pattern.length) return null;
    const patH = pattern.length;
    const patW = pattern[0].length;
    const scale = Math.max(1, Math.floor(Math.min((COLS - 2) / patW, (ROWS - 2) / patH)));
    const offX = Math.max(0, Math.floor((COLS - patW * scale) / 2));
    const offY = Math.max(0, Math.floor((ROWS - patH * scale) / 2));
    const mask = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    for (let r = 0; r < patH; r++) {
      for (let c = 0; c < patW; c++) {
        if (pattern[r][c] !== '#') continue;
        for (let sr = 0; sr < scale; sr++) {
          for (let sc = 0; sc < scale; sc++) {
            const rr = offY + r * scale + sr;
            const cc = offX + c * scale + sc;
            if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) mask[rr][cc] = true;
          }
        }
      }
    }
    return mask;
  }

  function setBackgroundPattern() {
    const raw = getRawLevelValue();
    const patterns = BACKGROUND_PATTERNS[raw] || BACKGROUND_PATTERNS.easy20;
    const pick = patterns[randInt(0, patterns.length - 1)];
    backgroundPatternName = pick.name;
    backgroundMask = buildMaskFromPattern(pick.map);
  }

  // ---- Word helpers (easy level) ----
  function buildEasy25MixedPhrase() {
    const whole = randInt(20, 99);
    const frac = randInt(0, 99);
    const style = randInt(0, 2);
    if (style === 0) {
      return buildEasyMixedPhrase(whole, frac);
    }
    const wholeStyle = style === 1 ? 'word-digit' : 'digit-word';
    const fracStyle = style === 1 ? 'word-and-digit' : 'word-digit';
    const mixedWhole = buildMixedWholePart(whole, wholeStyle);
    const mixedFrac = buildHundredthsPhrase(frac, fracStyle);
    return `${mixedWhole}&${mixedFrac}`;
  }

  function buildEasy30MixedPhrase() {
    const whole = randInt(20, 99);
    const frac = randInt(0, 999);
    const style = randInt(0, 2);
    if (style === 0) {
      const wholeWord = buildEasySpelledPhrase(whole);
      const fracStr = String(frac).padStart(3, '0');
      return `${wholeWord}.${fracStr}`;
    }
    const wholeStyle = style === 1 ? 'word-digit' : 'digit-word';
    const fracStyle = style === 1 ? 'word-and-digit' : 'word-digit-word';
    const mixedWhole = buildMixedWholePart(whole, wholeStyle);
    const mixedFrac = buildThousandthsPhrase(frac, fracStyle);
    return `${mixedWhole}&${mixedFrac}`;
  }
  

  // ---- Expression target row generators (guarantee length COLS) ----
  function buildTermWithMulDiv() {
    let value = randInt(2, 30);
    const dec = (value / 10).toFixed(1);
    let expr = `${dec}*10`;
    const steps = randInt(0, 2);
    for (let i = 0; i < steps; i++) {
      if (Math.random() < 0.6) {
        const mul = randInt(2, 5);
        value *= mul;
        expr += `*${mul}`;
      } else {
        const divisors = [];
        for (let d = 2; d <= 9; d++) if (value % d === 0) divisors.push(d);
        if (divisors.length === 0) {
          const mul = randInt(2, 5);
          value *= mul;
          expr += `*${mul}`;
        } else {
          const div = divisors[randInt(0, divisors.length - 1)];
          value = value / div;
          expr += `/${div}`;
        }
      }
    }
    return { expr, value };
  }

  function buildIntExpression(operatorsAllowed) {
    const allowAdd = operatorsAllowed.includes('+') || operatorsAllowed.includes('-');
    const allowMulDiv = operatorsAllowed.includes('*') || operatorsAllowed.includes('/');

    if (!allowAdd && allowMulDiv) {
      return buildTermWithMulDiv().expr;
    }
    if (allowAdd && !allowMulDiv) {
      const terms = randInt(2, 4);
      let expr = `${randInt(1, 9)}.${randInt(0, 9)}`;
      if (Math.random() < 0.35) expr = `0-${expr}`;
      for (let i = 1; i < terms; i++) {
        const op = Math.random() < 0.5 ? '+' : '-';
        const n = `${randInt(1, 9)}.${randInt(0, 9)}`;
        expr += `${op}${n}`;
      }
      return expr;
    }

    const terms = randInt(2, 4);
    let expr = buildTermWithMulDiv().expr;
    if (Math.random() < 0.35) expr = `0-${expr}`;
    for (let i = 1; i < terms; i++) {
      const op = Math.random() < 0.5 ? '+' : '-';
      const term = buildTermWithMulDiv().expr;
      expr += `${op}${term}`;
    }
    return expr;
  }

  function padExpression(expr, operatorsAllowed, targetLen) {
    if (expr.length >= targetLen) return expr.slice(0, targetLen);
    let padded = expr;
    const canAdd = operatorsAllowed.includes('+') || operatorsAllowed.includes('-');
    const canMul = operatorsAllowed.includes('*') || operatorsAllowed.includes('/');
    while (padded.length < targetLen) {
      const remaining = targetLen - padded.length;
      if (canAdd && remaining >= 2) {
        const op = Math.random() < 0.5 ? '+' : '-';
        const digit = String(randInt(1, 9));
        padded += op + digit;
        continue;
      }
      if (canMul && remaining >= 2) {
        const op = Math.random() < 0.5 ? '*' : '/';
        padded += op + '1';
        continue;
      }
      padded += String(randInt(1, 9));
    }
    return padded.slice(0, targetLen);
  }

  function generateExpressionTargetRow(operatorsAllowed, targetLen = COLS) {
    const maxAttempts = 400;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let expr = buildIntExpression(operatorsAllowed);
      if (expr.length > targetLen) expr = trimExpressionToLength(expr, targetLen);
      expr = padExpression(expr, operatorsAllowed, targetLen);
      if (expr.length !== targetLen) continue;
      const val = evaluateExpression(expr, operatorsAllowed);
      if (val === null) continue;
      if (Math.abs(val - Math.round(val)) > EPS) continue;
      return expr;
    }
    return '0'.repeat(targetLen);
  }

  function genDecimalNumberString() {
    const whole = randInt(0, 50);
    const decLen = Math.random() < 0.6 ? randInt(0, 3) : 0;
    if (decLen === 0) return String(whole);
    const frac = String(randInt(0, Math.pow(10, decLen) - 1)).padStart(decLen, '0');
    return `${whole}.${frac}`;
  }
  function trimExpressionToLength(expr, targetLen) {
    const parts = expr.match(/(\d+\.\d+|\d+|[+\-*/])/g) || [];
    let rebuilt = '';
    for (let i = 0; i < parts.length; i++) {
      let p = parts[i];
      if (/\d+\.\d+/.test(p) && rebuilt.length + p.length > targetLen) {
        const [w,f] = p.split('.');
        let newFrac = f;
        while (newFrac.length > 0 && rebuilt.length + (w + '.' + newFrac).length > targetLen) newFrac = newFrac.slice(0, -1);
        if (newFrac.length === 0) p = w; else p = w + '.' + newFrac;
      }
      if (rebuilt.length + p.length > targetLen) break;
      rebuilt += p;
    }
    return rebuilt;
  }
  function padNumericTokens(expr, targetLen) {
    const tokens = expr.match(/(\d+\.\d+|\d+|[+\-*/])/g) || [];
    if (tokens.length === 0) return expr;
    let idx = tokens.length - 1;
    while (idx >= 0 && /[+\-*/]/.test(tokens[idx])) idx--;
    if (idx < 0) return expr;
    let rebuilt = '';
    for (let i = 0; i < tokens.length; i++) {
      if (i === idx) {
        let candidate = tokens[i];
        while (rebuilt + candidate + tokens.slice(i+1).join('').length < targetLen) {
          if (candidate.includes('.')) candidate = candidate + '0';
          else candidate = candidate + '0';
          if (candidate.length > targetLen) break;
        }
        rebuilt += candidate;
      } else rebuilt += tokens[i];
    }
    while (rebuilt.length < targetLen) rebuilt += '0';
    return rebuilt.slice(0, targetLen);
  }

  function generateEasyTargetRow(targetLen = COLS) {
    const maxAttempts = 200;
    const raw = (levelEl && levelEl.value) || 'easy20';
    const useEasy25 = raw === 'easy25';
    const useEasy30 = raw === 'easy30';
    for (let a = 0; a < maxAttempts; a++) {
      const phrase = useEasy30
        ? buildEasy30MixedPhrase()
        : (useEasy25 ? buildEasy25MixedPhrase() : buildEasyMixedPhrase());
      let base = phrase.replace(/[^a-z0-9\-\.&]/g, '').toLowerCase();
      if (base.length > targetLen) {
        base = base.replace(/-+/g, '-');
        if (base.length > targetLen) continue;
      }
      const totalPad = targetLen - base.length;
      const leftPad = Math.floor(totalPad / 2);
      const rightPad = totalPad - leftPad;
      const rowStr = '-'.repeat(leftPad) + base + '-'.repeat(rightPad);
      const cleaned = rowStr.replace(/^-+|-+$/g, '');
      const parsed = parseEasyRowPhrase(cleaned);
      if (parsed === null) continue;
      return rowStr;
    }
    return 'one'.repeat(Math.ceil(targetLen / 3)).slice(0, targetLen);
  }

  // ---- Expression evaluator (shunting-yard) ----
  function evaluateExpression(exprStr, allowedOps) {
    if (!/^[0-9\.\+\-\*\/\s]+$/.test(exprStr)) return null;
    for (const ch of exprStr) {
      if ((ch === '+' || ch === '-' || ch === '*' || ch === '/') && !allowedOps.includes(ch)) return null;
    }
    const tokens = [];
    let i = 0;
    while (i < exprStr.length) {
      const c = exprStr[i];
      if (c === ' ') { i++; continue; }
      if ((c >= '0' && c <= '9') || c === '.') {
        let j = i;
        while (j < exprStr.length && ((exprStr[j] >= '0' && exprStr[j] <= '9') || exprStr[j] === '.')) j++;
        const numStr = exprStr.slice(i, j);
        const num = Number(numStr);
        if (!isFinite(num)) return null;
        tokens.push({ type: 'num', value: num });
        i = j;
        continue;
      }
      if ('+-*/'.includes(c)) {
        tokens.push({ type: 'op', value: c });
        i++;
        continue;
      }
      return null;
    }
    function prec(op) { if (op === '+' || op === '-') return 1; if (op === '*' || op === '/') return 2; return 0; }
    const output = [];
    const ops = [];
    for (const t of tokens) {
      if (t.type === 'num') output.push(t);
      else {
        while (ops.length && prec(ops[ops.length-1].value) >= prec(t.value)) output.push(ops.pop());
        ops.push(t);
      }
    }
    while (ops.length) output.push(ops.pop());
    const st = [];
    for (const t of output) {
      if (t.type === 'num') st.push(t.value);
      else {
        if (st.length < 2) return null;
        const b = st.pop(), a = st.pop();
        let r;
        switch (t.value) {
          case '+': r = a + b; break;
          case '-': r = a - b; break;
          case '*': r = a * b; break;
          case '/': if (b === 0) return null; r = a / b; break;
          default: return null;
        }
        st.push(r);
      }
    }
    if (st.length !== 1) return null;
    return st[0];
  }

  // ---- Target row queue helpers ----
  function ensureTargetRowsForLevel(level, minRows = 3) {
    while (targetRows.length < minRows) {
      const str = generateTargetRowForLevel(level);
      let s = String(str);
      if (s.length < COLS) s = s + '-'.repeat(COLS - s.length);
      else if (s.length > COLS) s = s.slice(0, COLS);
      targetRows.push({ str: s, level, filled: Array(COLS).fill(false) });
    }
  }

  function nextSegmentFromTopTarget(maxLen) {
    if (targetRows.length === 0) return null;
    const top = targetRows[0];
    let start = 0;
    while (start < COLS && top.filled[start]) start++;
    if (start >= COLS) { targetRows.shift(); return nextSegmentFromTopTarget(maxLen); }
    let end = start;
    while (end < COLS && !top.filled[end] && (end - start) < maxLen) end++;
    const segment = top.str.slice(start, end);
    for (let k = start; k < end; k++) top.filled[k] = true;
    return { symbols: segment.split(''), startCol: start, targetIndex: 0 };
  }

  // ---- Grid & canvas ----
  function createGrid(cols = COLS, rows = ROWS) {
    COLS = cols; ROWS = rows;
    grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) row.push(null);
      grid.push(row);
    }
  }

  function fillRowFromString(rowIndex, line) {
    for (let c = 0; c < COLS; c++) {
      grid[rowIndex][c] = { ch: line[c] || '0' };
    }
  }

  function rowHasCells(rowIndex) {
    return grid[rowIndex].some(cell => cell !== null);
  }

  function gridHasCells() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) return true;
      }
    }
    return false;
  }

  function advanceLines() {
    // No auto-gravity in the bubble-pop mode.
  }

  function ensureCanvas() {
    let can = document.getElementById('decimalGameCanvas');
    if (!can) {
      can = document.createElement('canvas');
      can.id = 'decimalGameCanvas';
      can.style.display = 'block';
      can.style.marginTop = '8px';
      const anchor = document.getElementById('canvasAnchor');
      if (anchor) anchor.appendChild(can);
      else promptEl.insertAdjacentElement('afterend', can);
    }
    canvas = can;
    ctx = canvas.getContext('2d');
    applyCanvasSize();
    canvas.removeEventListener('click', canvasClickHandler);
    canvas.addEventListener('click', canvasClickHandler);
  }

  function applyCanvasSize() {
    if (!canvas) return;
    const baseWidth = BASE_COLS * baseCellSize;
    const baseHeight = BASE_ROWS * baseCellSize;
    const sizeFromBase = Math.min(baseWidth / COLS, baseHeight / ROWS);
    CELL_SIZE = sizeFromBase;
    const gridW = COLS * CELL_SIZE;
    const gridH = ROWS * CELL_SIZE;
    gridOffsetX = Math.floor((baseWidth - gridW) / 2);
    gridOffsetY = Math.floor((baseHeight - gridH) / 2);
    canvas.width = Math.round(baseWidth);
    canvas.height = Math.round(baseHeight);
  }

  function getBlockGradient(x, y) {
    const primary = BLOCK_COLOR?.primary || '#1f77b4';
    const secondary = BLOCK_COLOR?.secondary || primary;
    const grad = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, secondary);
    return grad;
  }

  function drawGrid() {
    if (!ctx) return;
    applyCanvasSize();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = gridOffsetX + c * CELL_SIZE;
        const y = gridOffsetY + r * CELL_SIZE;
        const isPattern = backgroundMask && backgroundMask[r] && backgroundMask[r][c];
        ctx.fillStyle = isPattern ? '#0b3a4a' : '#041218';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = isPattern ? '#1b5566' : '#07202a';
        ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
        const cell = grid[r][c];
        if (cell) {
          ctx.fillStyle = getBlockGradient(x, y);
          roundRect(ctx, x+2, y+2, CELL_SIZE-4, CELL_SIZE-4, 4, true, false);
          if (isPattern) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            roundRect(ctx, x+2, y+2, CELL_SIZE-4, CELL_SIZE-4, 4, true, false);
          }
          ctx.fillStyle = '#fff';
          ctx.font = `700 ${Math.max(14, Math.floor(CELL_SIZE * 0.7))}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.ch, x + CELL_SIZE/2, y + CELL_SIZE/2 + 1);
        } else if (isPattern) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, Math.max(1, CELL_SIZE * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (currentPiece) {
      const { blocks, row, col } = currentPiece;
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const ch = block.ch;
        const x = gridOffsetX + (col + block.c) * CELL_SIZE;
        const y = gridOffsetY + (row + block.r) * CELL_SIZE;
        ctx.fillStyle = getBlockGradient(x, y);
        roundRect(ctx, x+2, y+2, CELL_SIZE-4, CELL_SIZE-4, 4, true, false);
        ctx.strokeStyle = '#0ea5a4';
        ctx.strokeRect(x+2, y+2, CELL_SIZE-4, CELL_SIZE-4);
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${Math.max(14, Math.floor(CELL_SIZE * 0.7))}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch, x + CELL_SIZE/2, y + CELL_SIZE/2 + 1);
      }
    }
    if (selectedRow !== null) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(gridOffsetX, gridOffsetY + selectedRow * CELL_SIZE, COLS * CELL_SIZE, CELL_SIZE);
    }
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 4;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function pieceCanPlaceAt(piece, targetRow, targetCol) {
    const blocks = piece.blocks;
    for (let i = 0; i < blocks.length; i++) {
      const r = targetRow + blocks[i].r;
      const c = targetCol + blocks[i].c;
      if (c < 0 || c >= COLS || r >= ROWS) return false;
      if (r >= 0 && grid[r][c]) return false;
    }
    return true;
  }

  function lockPiece() {
    if (!currentPiece) return;
    const { blocks, row, col } = currentPiece;
    for (let i = 0; i < blocks.length; i++) {
      const r = row + blocks[i].r;
      const c = col + blocks[i].c;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        grid[r][c] = { ch: blocks[i].ch };
      } else {
        gameOver();
        return;
      }
    }
    currentPiece = null;
    const fullRows = [];
    for (let r = 0; r < ROWS; r++) if (grid[r].every(cell => cell !== null)) fullRows.push(r);
    if (fullRows.length > 0) {
      showRowEquation(fullRows[0]);
      feedbackEl.textContent = 'Row filled — solve when ready.';
    } else {
      const fullCols = [];
      for (let c = 0; c < COLS; c++) {
        if (grid.every(r => r[c] !== null)) fullCols.push(c);
      }
      if (fullCols.length > 0) {
        showColEquation(fullCols[0]);
        feedbackEl.textContent = 'Column filled — solve when ready.';
      } else {
        selectedRow = null;
        selectedCol = null;
      }
    }
    drawGrid();
  }

  const SHAPES = [
    { name: 'I', blocks: [[0,0],[1,0],[2,0],[3,0]] },
    { name: 'L', blocks: [[0,0],[1,0],[2,0],[2,1]] },
    { name: 'T', blocks: [[0,0],[0,1],[0,2],[1,1]] },
    { name: 'O', blocks: [[0,0],[0,1],[1,0],[1,1]] },
    { name: 'I3', blocks: [[0,0],[1,0],[2,0]] },
    { name: 'L3', blocks: [[0,0],[1,0],[1,1]] }
  ];

  function pickShape() {
    return SHAPES[randInt(0, SHAPES.length - 1)];
  }

  function buildWordTokens(count) {
    const whole = randInt(1, 25);
    const decLen = randInt(1, 2);
    const frac = randInt(0, Math.pow(10, decLen) - 1);
    const value = Number(`${whole}.${String(frac).padStart(decLen, '0')}`);
    let phrase = buildEasySpelledPhrase(value).replace(/[^a-z\-]/g, '').toLowerCase();
    if (phrase.length < count) phrase = phrase.padEnd(count, '-');
    if (phrase.length > count) {
      const start = randInt(0, Math.max(0, phrase.length - count));
      phrase = phrase.slice(start, start + count);
    }
    return phrase.split('');
  }

  function buildExpressionTokens(count, ops) {
    let expr = count >= 3 ? `${randInt(1, 9)}.${randInt(0, 9)}` : `${randInt(0, 9)}`;
    while (expr.length < count) {
      const last = expr[expr.length - 1];
      const canOp = ops.length && !'+-*/'.includes(last) && expr.length < count - 1;
      if (canOp && Math.random() < 0.45) expr += ops[randInt(0, ops.length - 1)];
      else expr += String(randInt(0, 9));
    }
    return expr.slice(0, count).split('');
  }

  function buildTokensForLevel(count, level, ops) {
    if (level === 'easy') return buildWordTokens(count);
    return buildExpressionTokens(count, ops);
  }

  function spawnPiece() {
    if (currentPiece) return false;
    const lvl = normalizeLevelValue();
    const ops = lvl === 'easy' ? ['+','-'] : (lvl === 'medium' ? ['*','/'] : ['+','-','*','/']);

    const shape = pickShape();
    const blocks = shape.blocks.map(([r, c]) => ({ r, c, ch: '' }));
    const tokens = buildTokensForLevel(blocks.length, lvl, ops);
    for (let i = 0; i < blocks.length; i++) blocks[i].ch = tokens[i];

    const width = Math.max(...blocks.map(b => b.c)) + 1;
    const startCol = randInt(0, Math.max(0, COLS - width));
    currentPiece = { blocks, row: 0, col: startCol };
    drawGrid();
    return true;
  }

  function movePieceDown() { if (!currentPiece) return; const targetRow = currentPiece.row + 1; if (pieceCanPlaceAt(currentPiece, targetRow, currentPiece.col)) { currentPiece.row = targetRow; drawGrid(); } else { lockPiece(); spawnPiece(); } }
  function movePieceLeft() { if (!currentPiece) return; const nc = currentPiece.col - 1; if (pieceCanPlaceAt(currentPiece, currentPiece.row, nc)) { currentPiece.col = nc; drawGrid(); } }
  function movePieceRight(){ if (!currentPiece) return; const nc = currentPiece.col + 1; if (pieceCanPlaceAt(currentPiece, currentPiece.row, nc)) { currentPiece.col = nc; drawGrid(); } }
  function rotatePiece() {
    if (!currentPiece) return;
    const blocks = currentPiece.blocks.map(b => ({ r: b.r, c: b.c, ch: b.ch }));
    const maxR = Math.max(...blocks.map(b => b.r));
    const maxC = Math.max(...blocks.map(b => b.c));
    const rotated = blocks.map(b => ({ r: b.c, c: maxR - b.r, ch: b.ch }));
    const width = Math.max(...rotated.map(b => b.c)) + 1;
    let newCol = currentPiece.col;
    if (newCol + width > COLS) newCol = Math.max(0, COLS - width);
    const candidate = { blocks: rotated, row: currentPiece.row, col: newCol };
    if (pieceCanPlaceAt(candidate, candidate.row, candidate.col)) {
      currentPiece.blocks = rotated;
      currentPiece.col = newCol;
      drawGrid();
    }
  }

  function startGravity() { stopGravity(); }
  function stopGravity(){ if (gravityTimer) { clearInterval(gravityTimer); gravityTimer = null; } }
  function gravityMsByLevel(){ return 14000; }

  function startRoundTimer() {
    clearRoundTimer();
    const lvl = normalizeLevelValue();
    roundRemainingMs = ROUND_TIMES[lvl] || 1250000;
    roundStartTime = performance.now();
    roundTimeout = setTimeout(()=> {
      running = false;
      stopGravity();
      feedbackEl.textContent = 'Round time expired';
      clearRoundTimer();
      // hide input when timer expires
      if (inputEl) inputEl.style.display = 'none';
    }, roundRemainingMs);
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(()=> {
      if (!roundTimeout) return;
      const elapsed = performance.now() - roundStartTime;
      const rem = Math.max(0, roundRemainingMs - elapsed);
      timerEl.textContent = (rem/1000).toFixed(1);
    }, 100);
  }
  function clearRoundTimer(){ if (roundTimeout) { clearTimeout(roundTimeout); roundTimeout = null; } if (tickInterval) { clearInterval(tickInterval); tickInterval = null; } }

  // ---- Row solving ----
  function showRowEquation(row) {
    selectedRow = row;
    selectedCol = null;
    const expr = grid[row].map(cell => cell ? cell.ch : '').join('').trim();
    selectedRowExpr = expr;
    selectedColExpr = null;
    promptEl.textContent = `Solve row ${row+1}: ${expr}`;
    const lvl = normalizeLevelValue();
    const hintText = buildHintForExpression(expr, lvl);
    if (hintEl) hintEl.textContent = hintText;
    drawGrid();
  }

  function showColEquation(col) {
    selectedCol = col;
    selectedRow = null;
    const expr = grid.map(r => r[col] ? r[col].ch : '').join('').trim();
    selectedColExpr = expr;
    selectedRowExpr = null;
    promptEl.textContent = `Solve column ${col+1}: ${expr}`;
    const lvl = normalizeLevelValue();
    const hintText = buildHintForExpression(expr, lvl);
    if (hintEl) hintEl.textContent = hintText;
    drawGrid();
  }

  function getPromptExpression() {
    if (!promptEl) return null;
    const text = promptEl.textContent || '';
    const idx = text.indexOf(':');
    if (idx === -1) return null;
    const expr = text.slice(idx + 1).trim();
    return expr || null;
  }

  function trySolveSelectedRow(inputStr) {
    if (selectedRow === null) return;
    if (isCorrectiveLocked()) return false;
    let rowExpr = getPromptExpression() || selectedRowExpr || grid[selectedRow].map(cell => cell ? cell.ch : '').join('');
    rowExpr = rowExpr.replace(/^[+\-*/]+/, '').replace(/[+\-*/]+$/, '');
    const lvl = normalizeLevelValue();
    if (lvl === 'easy') {
      const cleaned = rowExpr.replace(/^-+|-+$/g, '');
      const parsed = parseEasyRowPhrase(cleaned);
      if (parsed === null) { feedbackEl.textContent = 'Row word invalid'; return false; }
      const player = Number(inputStr);
      if (!isFinite(player)) { feedbackEl.textContent = 'Invalid number'; return false; }
      if (Math.abs(parsed - player) <= 0.001) {
        clearRow(selectedRow);
        score += 8;
        streak++;
        updateHud();
        feedbackEl.textContent = 'Correct — row cleared';
        selectedRow = null;
        selectedRowExpr = null;
        recordAttempt(true, 8);
        return true;
      }
      streak = 0;
      startCorrectiveLock(cleaned, lvl, 'row', selectedRow);
      recordAttempt(false, 0);
      return false;
    }
    const allowed = lvl === 'medium' ? ['+','-'] : ['+','-','*','/'];
    const value = evaluateExpression(rowExpr, allowed);
    if (value === null) { feedbackEl.textContent = 'Row expression invalid'; return false; }
    const player = Number(inputStr);
    if (!isFinite(player)) { feedbackEl.textContent = 'Invalid number'; return false; }
    if (Math.abs(player - value) <= 0.001) {
      clearRow(selectedRow);
      score += 10;
      streak++;
      updateHud();
      feedbackEl.textContent = 'Correct — row cleared';
      selectedRow = null;
      selectedRowExpr = null;
      recordAttempt(true, 10);
      return true;
    }
    streak = 0;
    startCorrectiveLock(rowExpr, lvl, 'row', selectedRow);
    recordAttempt(false, 0);
    return false;
  }

  function trySolveSelectedCol(inputStr) {
    if (selectedCol === null) return;
    if (isCorrectiveLocked()) return false;
    let colExpr = getPromptExpression() || selectedColExpr || grid.map(r => r[selectedCol] ? r[selectedCol].ch : '').join('');
    colExpr = colExpr.replace(/^[+\-*/]+/, '').replace(/[+\-*/]+$/, '');
    const lvl = normalizeLevelValue();
    if (lvl === 'easy') {
      const cleaned = colExpr.replace(/^-+|-+$/g, '');
      const parsed = parseEasyRowPhrase(cleaned);
      if (parsed === null) { feedbackEl.textContent = 'Column word invalid'; return false; }
      const player = Number(inputStr);
      if (!isFinite(player)) { feedbackEl.textContent = 'Invalid number'; return false; }
      if (Math.abs(parsed - player) <= 0.001) {
        clearCol(selectedCol);
        score += 8;
        streak++;
        updateHud();
        feedbackEl.textContent = 'Correct — column cleared';
        selectedCol = null;
        selectedColExpr = null;
        recordAttempt(true, 8);
        return true;
      }
      streak = 0;
      startCorrectiveLock(cleaned, lvl, 'col', selectedCol);
      recordAttempt(false, 0);
      return false;
    }
    const allowed = lvl === 'medium' ? ['+','-'] : ['+','-','*','/'];
    const value = evaluateExpression(colExpr, allowed);
    if (value === null) { feedbackEl.textContent = 'Column expression invalid'; return false; }
    const player = Number(inputStr);
    if (!isFinite(player)) { feedbackEl.textContent = 'Invalid number'; return false; }
    if (Math.abs(player - value) <= 0.001) {
      clearCol(selectedCol);
      score += 10;
      streak++;
      updateHud();
      feedbackEl.textContent = 'Correct — column cleared';
      selectedCol = null;
      selectedColExpr = null;
      recordAttempt(true, 10);
      return true;
    }
    streak = 0;
    startCorrectiveLock(colExpr, lvl, 'col', selectedCol);
    recordAttempt(false, 0);
    return false;
  }

  function clearRow(rowIndex) {
    for (let c = 0; c < COLS; c++) {
      grid[rowIndex][c] = null;
    }
    if (dropRowsRemaining > 0) {
      dropRowsRemaining--;
      if (dropRowsRemaining === 0) {
        feedbackEl.textContent = 'No more drops — clear the remaining rows to win!';
      }
    }
    if (dropRowsRemaining === 0 && !gridHasCells()) {
      winGame();
      return;
    }
    drawGrid();
  }

  function clearCol(colIndex) {
    for (let r = ROWS - 1; r >= 0; r--) {
      grid[r][colIndex] = null;
    }
    drawGrid();
  }

  function fillRowWithLine(rowIndex, line) {
    for (let c = 0; c < COLS; c++) {
      grid[rowIndex][c] = { ch: line[c] || '0' };
    }
  }

  function fillColWithLine(colIndex, line) {
    for (let r = 0; r < ROWS; r++) {
      grid[r][colIndex] = { ch: line[r] || '0' };
    }
  }

  function normalizeExpression(expr, level) {
    let cleaned = expr.trim();
    if (level === 'easy') {
      cleaned = cleaned.replace(/^-+|-+$/g, '');
    } else {
      cleaned = cleaned.replace(/^[+\-*/]+/, '').replace(/[+\-*/]+$/, '');
    }
    return cleaned;
  }

  function isCorrectiveLocked() {
    return correctiveLockUntil > Date.now();
  }

  function clearCorrectiveLock() {
    correctiveLockUntil = 0;
    correctiveLockAxis = null;
    correctiveLockIndex = null;
    if (correctiveCountdownTimer) {
      clearInterval(correctiveCountdownTimer);
      correctiveCountdownTimer = null;
    }
    if (inputEl) inputEl.disabled = false;
  }

  function buildCorrectiveHelpForExpression(expr, level) {
    const cleaned = normalizeExpression(expr || '', level);
    if (!cleaned) return 'Look at the numbers, do one small step, then type your answer.';
    if (level === 'easy') {
      if (cleaned.includes('&')) {
        const [wholePart = '', decimalPart = ''] = cleaned.split('&');
        return `Say "${wholePart}" first. Then say "${decimalPart}". Put them together as one decimal number.`;
      }
      if (cleaned.includes('.')) {
        const [wholePart = '', decimalPart = ''] = cleaned.split('.');
        return `Read "${wholePart}" as the whole number. The digits "${decimalPart}" stay after the dot.`;
      }
      return 'Read the word number slowly, then write that same number with digits.';
    }
    const tokens = cleaned.match(/(\d+\.\d+|\d+|[+\-*/])/g) || [];
    const operator = tokens.find((t) => '+-*/'.includes(t));
    if (operator === '+') {
      return 'Adding means count up. Start at the first number and move forward in tiny steps.';
    }
    if (operator === '-') {
      return 'Subtracting means count back. Start at the first number and take away in tiny steps.';
    }
    if (operator === '*') {
      return 'Multiply means equal groups. Add the same number again and again.';
    }
    if (operator === '/') {
      return 'Divide means share equally. Split the first number into same-size groups.';
    }
    return 'Do one operation at a time, then use that result for the next step.';
  }

  function startCorrectiveLock(expr, level, axis, index) {
    clearCorrectiveLock();
    correctiveLockUntil = Date.now() + 30000;
    correctiveLockAxis = axis;
    correctiveLockIndex = index;
    if (inputEl) {
      inputEl.value = '';
      inputEl.disabled = true;
    }
    const helpText = buildCorrectiveHelpForExpression(expr, level);
    const unit = axis === 'col' ? 'column' : 'row';
    const unitNum = Number.isInteger(index) ? index + 1 : '?';
    if (promptEl) {
      promptEl.textContent = `Try ${unit} ${unitNum} again after help: ${expr}`;
    }
    const render = () => {
      const left = Math.max(0, Math.ceil((correctiveLockUntil - Date.now()) / 1000));
      if (left <= 0) {
        clearCorrectiveLock();
        if (feedbackEl) feedbackEl.textContent = `Try ${unit} ${unitNum} again now.`;
        if (hintEl) hintEl.textContent = `Tip: ${buildHintForExpression(expr, level)}`;
        if (inputEl) inputEl.disabled = false;
        return;
      }
      if (feedbackEl) feedbackEl.textContent = `Read this help for ${left}s, then try the same problem again.`;
      if (hintEl) hintEl.textContent = `Help: ${helpText}`;
    };
    render();
    correctiveCountdownTimer = setInterval(render, 250);
  }

  function maybeRevealAnswer(expr, level) {
    return false;
  }

  function buildHintForExpression(expr, level) {
    const cleaned = normalizeExpression(expr, level);
    if (!cleaned) return 'Hint: click a full row to solve it.';
    if (level === 'easy') {
      if (cleaned.includes('&')) {
        const [whole, frac] = cleaned.split('&');
        const unit = /thousandth/.test(frac) ? 'thousandths' : 'hundredths';
        return `Hint: "${whole}" is the whole number and "${frac}" are ${unit}.`;
      }
      const parts = cleaned.split('.');
      const wordPart = parts[0] ? parts[0].replace(/-/g, ' ') : '';
      const fracPart = parts[1] || '';
      if (wordPart && fracPart) {
        const unit = fracPart.length === 3 ? 'thousandths' : 'hundredths';
        return `Hint: word part "${wordPart}" and decimal digits ".${fracPart}" (${unit}).`;
      }
      return 'Hint: convert the word to a number, then append the decimal digits shown.';
    }
    if (level === 'medium') {
      const tokens = cleaned.match(/(\d+\.\d+|\d+|[+\-])/g) || [];
      if (tokens.length >= 3) {
        const a = Number(tokens[0]);
        const op = tokens[1];
        const b = Number(tokens[2]);
        if (isFinite(a) && isFinite(b)) {
          const result = op === '+' ? a + b : a - b;
          return `Hint: first do ${tokens[0]}${op}${tokens[2]} = ${displayNumber(result)}, then continue left to right.`;
        }
      }
      return 'Hint: add and subtract left to right, keep one decimal place.';
    }
    const tokens = cleaned.match(/(\d+\.\d+|\d+|[+\-*/])/g) || [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        const a = Number(tokens[i - 1]);
        const b = Number(tokens[i + 1]);
        if (isFinite(a) && isFinite(b) && (tokens[i] !== '/' || b !== 0)) {
          const result = tokens[i] === '*' ? a * b : a / b;
          return `Hint: resolve ${tokens[i - 1]}${tokens[i]}${tokens[i + 1]} = ${displayNumber(result)} first.`;
        }
      }
    }
    if (tokens.length >= 3) {
      const a = Number(tokens[0]);
      const op = tokens[1];
      const b = Number(tokens[2]);
      if (isFinite(a) && isFinite(b)) {
        const result = op === '+' ? a + b : a - b;
        return `Hint: start with ${tokens[0]}${op}${tokens[2]} = ${displayNumber(result)}.`;
      }
    }
    return 'Hint: do multiplication/division before addition/subtraction.';
  }

  // ---- Input handlers & events ----
    if (inputEl) {
      inputEl.style.display = '';
      if (!inputKeydownHandler) {
        inputKeydownHandler = (e) => {
          if (e.key === 'Enter') {
            if (isCorrectiveLocked()) {
              const left = Math.max(0, Math.ceil((correctiveLockUntil - Date.now()) / 1000));
              const unit = correctiveLockAxis === 'col' ? 'column' : 'row';
              const unitNum = Number.isInteger(correctiveLockIndex) ? correctiveLockIndex + 1 : '?';
              feedbackEl.textContent = `Keep reading help for ${unit} ${unitNum}. You can answer in ${left}s.`;
              return;
            }
            const txt = inputEl.value.trim();
            inputEl.value = '';
            if (!txt) return;
            if (selectedRow === null && selectedCol === null) {
              feedbackEl.textContent = 'Click a full row to select it then answer.';
              return;
            }
            if (selectedRow !== null) trySolveSelectedRow(txt);
            else trySolveSelectedCol(txt);
          }
        };
      }
      inputEl.removeEventListener('keydown', inputKeydownHandler);
      inputEl.addEventListener('keydown', inputKeydownHandler);
    }

  function canvasClickHandler(e) {
    if (!canvas) return;
    if (isCorrectiveLocked()) {
      const unit = correctiveLockAxis === 'col' ? 'column' : 'row';
      const unitNum = Number.isInteger(correctiveLockIndex) ? correctiveLockIndex + 1 : '?';
      feedbackEl.textContent = `Finish the 30-second help, then retry ${unit} ${unitNum}.`;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX - gridOffsetX;
    const y = (e.clientY - rect.top) * scaleY - gridOffsetY;
    const row = Math.floor(y / CELL_SIZE);
    const col = Math.floor(x / CELL_SIZE);

    if (row >= 0 && row < ROWS && grid[row].every(cell => cell !== null)) {
      showRowEquation(row);
      feedbackEl.textContent = 'Row selected — solve when ready.';
      return;
    }

    selectedRow = null;
    selectedCol = null;
    if (!paused) promptEl.textContent = 'Select a full row to solve';
    drawGrid();
  }

  const windowKeydownHandler = (e) => {
    if (miniGameActive) {
      if (e.key === 'ArrowLeft') { miniKeys.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { miniKeys.right = true; e.preventDefault(); }
      if (e.key === 'ArrowUp') { miniKeys.up = true; e.preventDefault(); }
      if (e.key === 'ArrowDown') { miniKeys.down = true; e.preventDefault(); }
      return;
    }
    if (!running || paused) return;
    if (e.key === 'ArrowLeft') { movePieceLeft(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { movePieceRight(); e.preventDefault(); }
    if (e.key === 'ArrowDown') { movePieceDown(); e.preventDefault(); }
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'r' || e.key === ' ') { rotatePiece(); e.preventDefault(); }
  };
  const windowKeyupHandler = (e) => {
    if (!miniGameActive) return;
    if (e.key === 'ArrowLeft') miniKeys.left = false;
    if (e.key === 'ArrowRight') miniKeys.right = false;
    if (e.key === 'ArrowUp') miniKeys.up = false;
    if (e.key === 'ArrowDown') miniKeys.down = false;
  };
  window.addEventListener('keydown', windowKeydownHandler);
  window.addEventListener('keyup', windowKeyupHandler);

  // ---- HUD / UI / Palette / grid controls ----
  function updateHud() { scoreEl && (scoreEl.textContent = String(score)); streakEl && (streakEl.textContent = String(streak)); }

  function buildPalette() {
    if (!paletteContainer) return;
    paletteContainer.innerHTML = '';
    ACRYLICS.forEach((swatch) => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = `linear-gradient(135deg, ${swatch.primary} 0%, ${swatch.secondary} 100%)`;
      sw.dataset.color = swatch.primary;
      sw.addEventListener('click', () => {
        paletteContainer.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        BLOCK_COLOR = swatch;
        if (selectedColorPreview) {
          selectedColorPreview.style.background = `linear-gradient(135deg, ${swatch.primary} 0%, ${swatch.secondary} 100%)`;
        }
        drawGrid();
      });
      paletteContainer.appendChild(sw);
      if (swatch.primary === BLOCK_COLOR?.primary || (!BLOCK_COLOR && paletteContainer.children.length === 1)) {
        sw.classList.add('selected');
        BLOCK_COLOR = swatch;
        if (selectedColorPreview) {
          selectedColorPreview.style.background = `linear-gradient(135deg, ${swatch.primary} 0%, ${swatch.secondary} 100%)`;
        }
      }
    });
  }

  function updateGridPreview() {
    const c = Number(colsInput?.value) || COLS;
    const r = Number(rowsInput?.value) || ROWS;
    const s = Number(cellSizeInput?.value) || baseCellSize;
    if (gridPreview) gridPreview.textContent = `${c}×${r} @${s}px`;
  }

  function initUI() {
    applyLevelConfig();
    setBackgroundPattern();
    updateGridPreview();
    buildPalette();
    if (!applyGridHandler) {
      applyGridHandler = () => {
        const newCols = clamp(Number(colsInput.value) || COLS, 8, 30);
        const newRows = 15;
        const newSize = clamp(Number(cellSizeInput.value) || CELL_SIZE, 20, 48);
        const wasRunning = running;
        if (wasRunning) stopGame();
        COLS = newCols; ROWS = newRows; CELL_SIZE = newSize; baseCellSize = newSize;
        createGrid(COLS, ROWS);
        ensureCanvas();
        drawGrid();
        updateGridPreview();
        if (wasRunning) startGame();
      };
    }
    if (!updatePreviewHandler) {
      updatePreviewHandler = () => updateGridPreview();
    }
    if (!levelChangeHandler) {
      levelChangeHandler = () => {
        applyLevelConfig();
        setBackgroundPattern();
        updateGridPreview();
        createGrid(COLS, ROWS);
        ensureCanvas();
        drawGrid();
      };
    }
    if (!startHandler) {
      startHandler = () => {
        if (running) { feedbackEl.textContent = 'Game already running'; return; }
        startGame();
      };
    }
    if (!pauseHandler) {
      pauseHandler = () => togglePause();
    }

    applyGridBtn?.removeEventListener('click', applyGridHandler);
    applyGridBtn?.addEventListener('click', applyGridHandler);
    cellSizeInput?.removeEventListener('input', updatePreviewHandler);
    colsInput?.removeEventListener('input', updatePreviewHandler);
    rowsInput?.removeEventListener('input', updatePreviewHandler);
    cellSizeInput?.addEventListener('input', updatePreviewHandler);
    colsInput?.addEventListener('input', updatePreviewHandler);
    rowsInput?.addEventListener('input', updatePreviewHandler);

    levelEl?.removeEventListener('change', levelChangeHandler);
    levelEl?.addEventListener('change', levelChangeHandler);
    startBtn?.removeEventListener('click', startHandler);
    startBtn?.addEventListener('click', startHandler);
    pauseBtn?.removeEventListener('click', pauseHandler);
    pauseBtn?.addEventListener('click', pauseHandler);
  }

  // ---- Round target queue helpers ----
  function randomDecimalStr(min = 1, max = 100) {
    const value = randInt(min * 10, max * 10) / 10;
    return value.toFixed(1);
  }

  function makeMulTerm() {
    const decStr = randomDecimalStr(1, 100);
    const factor = randInt(1, 10) * 10;
    const factorStr = factor.toFixed(1);
    const value = Number(decStr) * factor;
    return { expr: `${decStr}*${factorStr}`, value };
  }

  function makeDivTerm() {
    const denomVal = randInt(10, 200) / 10;
    const maxResult = Math.floor(100 / denomVal);
    if (maxResult < 1) return null;
    const result = randInt(1, Math.min(12, maxResult));
    const numerVal = denomVal * result;
    if (numerVal > 100) return null;
    return {
      expr: `${numerVal.toFixed(1)}/${denomVal.toFixed(1)}`,
      value: result
    };
  }

  function makeComplexTerm() {
    const baseTenth = randInt(2, 200) * 5;
    const base = baseTenth / 10;
    const expr = `${base.toFixed(1)}*10.0/5.0`;
    const value = base * 2;
    return { expr, value };
  }

  function padExpressionForMath(expr, targetLen) {
    let padded = expr;
    while (padded.length < targetLen) {
      if (padded.length + 4 <= targetLen) {
        padded += '+0.0';
      } else {
        padded += '0';
      }
    }
    return padded.slice(0, targetLen);
  }

  function generateMathExpressionTargetRow(targetLen = COLS) {
    const builders = [makeMulTerm, makeDivTerm, makeComplexTerm];
    const maxAttempts = 400;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const termCount = randInt(3, 5);
      let expr = '';
      let total = 0;
      for (let i = 0; i < termCount; i++) {
        const builder = builders[randInt(0, builders.length - 1)];
        const term = builder();
        if (!term) { i--; continue; }
        if (i === 0) {
          if (Math.random() < 0.35) {
            expr = `0-${term.expr}`;
            total = -term.value;
          } else {
            expr = term.expr;
            total = term.value;
          }
        } else {
          const op = Math.random() < 0.5 ? '+' : '-';
          expr += op + term.expr;
          total = op === '+' ? total + term.value : total - term.value;
        }
      }
      if (!expr.includes('.')) continue;
      if (expr.length > targetLen) continue;
      const padded = padExpressionForMath(expr, targetLen);
      const val = evaluateExpression(padded, ['+','-','*','/']);
      if (val === null) continue;
      if (Math.abs(val - Math.round(val)) > EPS) continue;
      return padded;
    }
    return '0'.repeat(targetLen);
  }

  function generateTargetRowForLevel(level, targetLen = COLS) {
    if (level === 'easy') return generateEasyTargetRow(targetLen);
    if (level === 'medium') return generateExpressionTargetRow(['+','-'], targetLen);
    return generateMathExpressionTargetRow(targetLen);
  }

  function ensureTargetRowsForLevel(level, minRows = 3) {
    while (targetRows.length < minRows) {
      const str = generateTargetRowForLevel(level);
      let s = String(str);
      if (s.length < COLS) s = s + '-'.repeat(COLS - s.length);
      else if (s.length > COLS) s = s.slice(0, COLS);
      targetRows.push({ str: s, level, filled: Array(COLS).fill(false) });
    }
  }

  function nextSegmentFromTopTarget(maxLen) {
    if (targetRows.length === 0) return null;
    const top = targetRows[0];
    let start = 0;
    while (start < COLS && top.filled[start]) start++;
    if (start >= COLS) { targetRows.shift(); return nextSegmentFromTopTarget(maxLen); }
    let end = start;
    while (end < COLS && !top.filled[end] && (end - start) < maxLen) end++;
    const segment = top.str.slice(start, end);
    for (let k = start; k < end; k++) top.filled[k] = true;
    return { symbols: segment.split(''), startCol: start, targetIndex: 0 };
  }

  // ---- Start/stop/game loop ----
  function fillInitialGrid() {
    const lvl = normalizeLevelValue();
    for (let r = 0; r < ROWS; r++) {
      const line = generateTargetRowForLevel(lvl, COLS);
      fillRowFromString(r, line);
    }
  }

  function startGame() {
    clearCorrectiveLock();
    running = true; paused = false; score = 0; streak = 0; selectedRow = null; selectedCol = null;
    applyLevelConfig();
    setBackgroundPattern();
    createGrid(COLS, ROWS);
    dropRowsRemaining = 10;
    answerRevealRemaining = 3;
    fillInitialGrid();
    ensureCanvas();
    drawGrid();
    startGravity();
    startRoundTimer();
    updateHud();
    feedbackEl.textContent = 'Game started — clear rows before the timer ends';
    promptEl.textContent = 'Click a full row to solve it.';
    pauseBtn.disabled = false; pauseBtn.textContent = 'Pause';
    if (inputEl) inputEl.style.display = '';
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'decimal');
    gameStats.gamesPlayed += 1;
    saveProfileStats(stats);
  }

  function stopGame() {
    clearCorrectiveLock();
    running = false; paused = false;
    stopGravity(); clearRoundTimer();
    stopMiniRound();
    currentPiece = null; selectedRow = null; selectedCol = null;
    feedbackEl.textContent = 'Stopped'; pauseBtn.disabled = true;
    if (inputEl) inputEl.style.display = 'none';
  }

  function gameOver() {
    clearCorrectiveLock();
    running = false; stopGravity(); clearRoundTimer();
    stopMiniRound();
    promptEl.textContent = 'Game Over';
    feedbackEl.textContent = `Game over — score ${score}`;
    if (inputEl) inputEl.style.display = 'none';
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'decimal');
    gameStats.bestScore = Math.max(gameStats.bestScore, score);
    saveProfileStats(stats);
  }

  function winGame() {
    clearCorrectiveLock();
    running = false;
    stopGravity();
    clearRoundTimer();
    promptEl.textContent = 'You win!';
    feedbackEl.textContent = `All rows cleared — score ${score}`;
    if (inputEl) inputEl.style.display = 'none';
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'decimal');
    gameStats.bestScore = Math.max(gameStats.bestScore, score);
    saveProfileStats(stats);
    nextLevelAfterWin = getNextLevelValue(levelEl?.value || 'easy20');
    startShapeBattle();
  }

  function stopMiniRound() {
    miniGameActive = false;
    if (miniAnimId) cancelAnimationFrame(miniAnimId);
    miniAnimId = null;
    miniCollectibles.forEach((d) => d.el.remove());
    miniCollectibles = [];
    miniHazards.forEach((h) => h.el.remove());
    miniHazards = [];
    if (miniOverlay) miniOverlay.style.display = 'none';
  }

  function togglePause() {
    if (!running) return;
    clearCorrectiveLock();
    paused = !paused;
    if (paused) {
      pauseBtn.textContent = 'Resume';
      if (roundTimeout && roundStartTime) {
        const elapsed = performance.now() - roundStartTime;
        roundRemainingMs = Math.max(0, roundRemainingMs - elapsed);
        clearRoundTimer();
      }
      stopGravity();
      feedbackEl.textContent = 'Paused';
      if (inputEl) inputEl.style.display = '';
    } else {
      pauseBtn.textContent = 'Pause';
      roundStartTime = performance.now();
      roundTimeout = setTimeout(()=> {
        running = false; stopGravity(); feedbackEl.textContent = 'Round time expired'; clearRoundTimer();
        if (inputEl) inputEl.style.display = 'none';
      }, roundRemainingMs);
      startGravity();
      feedbackEl.textContent = 'Resumed';
      if (inputEl) inputEl.style.display = '';
    }
  }

  // ---- Initialize ----
  if (ACRYLICS.length) {
    BLOCK_COLOR = ACRYLICS[0];
    if (selectedColorPreview) {
      selectedColorPreview.style.background = `linear-gradient(135deg, ${ACRYLICS[0].primary} 0%, ${ACRYLICS[0].secondary} 100%)`;
    }
  }
  colsInput && (colsInput.value = COLS);
  rowsInput && (rowsInput.value = ROWS);
  cellSizeInput && (cellSizeInput.value = baseCellSize);
  updateGridPreview();
  createGrid(COLS, ROWS);
  ensureCanvas();
  drawGrid();
  buildPalette();
  initUI();

  // expose debug API
  window.DecimalTetris = {
    startGame: () => startGame(),
    stopGame: () => stopGame(),
    togglePause: () => togglePause(),
    getState: () => ({
      running,
      paused,
      score,
      streak,
      COLS,
      ROWS,
      CELL_SIZE,
      BLOCK_COLOR: BLOCK_COLOR?.primary || BLOCK_COLOR,
      targetRows
    })
  };

  // ---- Helper functions included earlier for completeness ----

  function genDecimalToken(minWhole=0, maxWhole=50) {
    const whole = randInt(Math.max(0,minWhole), Math.max(minWhole,maxWhole));
    const decLen = randInt(0,3);
    if (decLen === 0) return `${whole}`;
    const frac = randInt(0, Math.pow(10,decLen)-1);
    return `${whole}.${String(frac).padStart(decLen,'0')}`;
  }
  function genEasyPiece() {
    const whole = randInt(1,25);
    const decLen = randInt(0,3);
    const frac = decLen === 0 ? 0 : randInt(0, Math.pow(10,decLen)-1);
    const value = decLen === 0 ? whole : Number(`${whole}.${String(frac).padStart(decLen,'0')}`);
    const phrase = buildEasySpelledPhrase(value);
    let base = phrase.replace(/[^a-z\-\.]/g, '').toLowerCase();
    if (base.length > COLS) base = base.slice(0, COLS);
    // return array of single characters
    return base.split('');
  }
  function genMediumPiece() {
    const minLen = 8, maxLen = Math.min(15, COLS);
    const ops = ['+','-'];
    let expr = '';
    while (expr.length < minLen) {
      const num = genDecimalToken();
      if (expr === '') expr = num;
      else expr = expr + ops[randInt(0,1)] + num;
      if (expr.length > maxLen) {
        const idx = Math.max(expr.lastIndexOf('+'), expr.lastIndexOf('-'));
        if (idx > 0) expr = expr.slice(0, idx);
        break;
      }
    }
    while (expr.length < minLen) expr += '+' + genDecimalToken();
    if (expr.length > maxLen) expr = expr.slice(0, maxLen);
    return expr.split('');
  }
  function genMathPiece() {
    const minLen = 8, maxLen = Math.min(15, COLS);
    const ops = ['*','/'];
    let expr = '';
    while (expr.length < minLen) {
      const num = genDecimalToken(1,50);
      if (expr === '') expr = num;
      else expr = expr + ops[randInt(0,1)] + num;
      if (expr.length > maxLen) {
        const idx = Math.max(expr.lastIndexOf('*'), expr.lastIndexOf('/'));
        if (idx > 0) expr = expr.slice(0, idx);
        break;
      }
    }
    while (expr.length < minLen) expr += '*' + genDecimalToken(1,50);
    if (expr.length > maxLen) expr = expr.slice(0, maxLen);
    return expr.split('');
  }

  function ensureMiniGameElements() {
    if (miniOverlay) return;
    const root = document.querySelector('.decimal-page');
    if (!root) return;
    miniOverlay = document.createElement('div');
    miniOverlay.className = 'decimal-mini-game';
    miniOverlay.innerHTML = `
      <div class="decimal-mini-card">
        <div class="decimal-mini-header">
          <span>Desk Stampede Bonus</span>
          <span id="decimalMiniTimerText">18s</span>
        </div>
        <div class="decimal-mini-bar"><div class="decimal-mini-bar-fill" id="decimalMiniDeskFill"></div></div>
        <div class="decimal-mini-arena"></div>
        <div class="decimal-mini-controls" aria-hidden="true">
          <div class="decimal-mini-joystick" id="decimalMiniJoystick">
            <div class="decimal-mini-stick" id="decimalMiniStick"></div>
          </div>
          <div class="decimal-mini-help">Collect desks, avoid broken desks. 6 desks = 1 Benny Dash tank.</div>
        </div>
      </div>
    `;
    root.appendChild(miniOverlay);
    miniArena = miniOverlay.querySelector('.decimal-mini-arena');
    miniDeskText = miniOverlay.querySelector('#decimalMiniDeskFill');
    miniTimerText = miniOverlay.querySelector('#decimalMiniTimerText');
    miniBenny = document.createElement('div');
    miniBenny.className = 'decimal-mini-benny';
    miniBenny.innerHTML = `
      <div class="benny-body"></div>
      <div class="benny-head"></div>
      <div class="benny-leg left"></div>
      <div class="benny-leg right"></div>
    `;
    miniArena.appendChild(miniBenny);
    const controls = miniOverlay.querySelector('.decimal-mini-controls');
    miniJoystick = miniOverlay.querySelector('#decimalMiniJoystick');
    miniStick = miniOverlay.querySelector('#decimalMiniStick');

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
      miniJoystick.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = miniJoystick.getBoundingClientRect();
        miniJoystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        miniJoystickActive = true;
        handleMiniJoystickMove(touch.clientX, touch.clientY);
        e.preventDefault();
      }, { passive: false });
      miniJoystick.addEventListener('touchmove', (e) => {
        if (!miniJoystickActive) return;
        const touch = e.touches[0];
        handleMiniJoystickMove(touch.clientX, touch.clientY);
        e.preventDefault();
      }, { passive: false });
      miniJoystick.addEventListener('touchend', resetMiniJoystick);
      miniJoystick.addEventListener('touchcancel', resetMiniJoystick);
    }

    if (!('ontouchstart' in window) && controls) {
      controls.style.display = 'none';
    }
  }

  function startShapeBattle() {
    ensureMiniGameElements();
    if (!miniOverlay || !miniArena || !miniBenny) return;
    miniGameActive = true;
    miniOverlay.style.display = 'flex';
    miniCollectibles = [];
    miniHazards = [];
    miniKeys = { left: false, right: false, up: false, down: false };
    miniCollected = 0;
    miniRoundEndsAt = performance.now() + miniRoundMs;
    miniSpawnAt = performance.now() + 200;
    if (miniDeskText) miniDeskText.style.width = '0%';
    if (miniTimerText) miniTimerText.textContent = `${Math.ceil(miniRoundMs / 1000)}s`;
    const arenaRect = miniArena.getBoundingClientRect();
    miniBenny.dataset.x = String(arenaRect.width * 0.2);
    miniBenny.dataset.y = String(arenaRect.height * 0.6);
    miniBenny.style.transform = `translate(${miniBenny.dataset.x}px, ${miniBenny.dataset.y}px)`;

    if (miniAnimId) cancelAnimationFrame(miniAnimId);
    miniAnimId = requestAnimationFrame(miniLoop);
  }

  function endShapeBattle() {
    miniGameActive = false;
    if (miniAnimId) cancelAnimationFrame(miniAnimId);
    miniAnimId = null;
    miniCollectibles.forEach((d) => d.el.remove());
    miniCollectibles = [];
    miniHazards.forEach((h) => h.el.remove());
    miniHazards = [];
    if (miniOverlay) miniOverlay.style.display = 'none';
    const reward = addDeskFuelFromDesks(miniCollected);
    feedbackEl.textContent = `Bonus complete! ${miniCollected} desks collected. +${reward.tanksEarned} tank(s). Benny Dash fuel: ${reward.fuelBank}. Desk charge: ${reward.chargeRemainder}/6`;
    promptEl.textContent = 'Press Start to play again.';
    restartAfterMiniGame();
  }

  function failShapeBattle() {
    endShapeBattle();
  }

  function getNextLevelValue(current) {
    const order = ['easy20', 'easy25', 'easy30', 'medium', 'mathamatical'];
    const idx = order.indexOf(current);
    if (idx === -1 || idx === order.length - 1) return current;
    return order[idx + 1];
  }

  function restartAfterMiniGame() {
    if (!nextLevelAfterWin) return;
    if (levelEl) levelEl.value = nextLevelAfterWin;
    nextLevelAfterWin = null;
    startGame();
  }

  function updateMiniDeskProgress() {
    if (!miniDeskText) return;
    const progress = miniCollected % 6;
    const pct = progress === 0 && miniCollected > 0 ? 100 : (progress / 6) * 100;
    miniDeskText.style.width = `${pct}%`;
  }

  function spawnMiniDesk(arenaRect) {
    if (!miniArena) return;
    const desk = document.createElement('div');
    desk.className = 'decimal-mini-desk';
    desk.innerHTML = '<span class="back"></span><span class="seat"></span><span class="leg-left"></span><span class="leg-right"></span><span class="desk"></span><span class="smoke smoke-1"></span><span class="smoke smoke-2"></span>';
    const x = randInt(20, Math.max(22, Math.floor(arenaRect.width - 38)));
    const y = randInt(20, Math.max(22, Math.floor(arenaRect.height - 34)));
    const vx = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 1.2);
    const vy = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 1.1);
    desk.dataset.x = String(x);
    desk.dataset.y = String(y);
    desk.dataset.vx = String(vx);
    desk.dataset.vy = String(vy);
    desk.style.transform = `translate(${x}px, ${y}px)`;
    miniArena.appendChild(desk);
    miniCollectibles.push({ el: desk, x, y, vx, vy, w: 32, h: 28 });
  }

  function spawnMiniHazard(arenaRect) {
    if (!miniArena) return;
    const hazard = document.createElement('div');
    hazard.className = 'decimal-mini-broken-desk';
    const x = randInt(20, Math.max(22, Math.floor(arenaRect.width - 32)));
    const y = randInt(20, Math.max(22, Math.floor(arenaRect.height - 32)));
    const vx = (Math.random() < 0.5 ? -1 : 1) * (1.8 + Math.random() * 1.4);
    const vy = (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 1.3);
    hazard.dataset.x = String(x);
    hazard.dataset.y = String(y);
    hazard.dataset.vx = String(vx);
    hazard.dataset.vy = String(vy);
    hazard.style.transform = `translate(${x}px, ${y}px)`;
    miniArena.appendChild(hazard);
    miniHazards.push({ el: hazard, x, y, vx, vy, w: 24, h: 24 });
  }

  function miniLoop() {
    if (!miniGameActive || !miniArena || !miniBenny) return;
    const arenaRect = miniArena.getBoundingClientRect();
    const now = performance.now();
    const timeLeftMs = Math.max(0, miniRoundEndsAt - now);
    if (miniTimerText) miniTimerText.textContent = `${Math.ceil(timeLeftMs / 1000)}s`;
    if (timeLeftMs <= 0) {
      endShapeBattle();
      return;
    }

    if (now >= miniSpawnAt) {
      miniSpawnAt = now + 900;
      if (miniCollectibles.length < 10) spawnMiniDesk(arenaRect);
      if (miniHazards.length < 4) spawnMiniHazard(arenaRect);
    }

    const bennySize = 40;
    const itemPad = 2;
    let bx = parseFloat(miniBenny.dataset.x || '0');
    let by = parseFloat(miniBenny.dataset.y || '0');
    const moveX = miniJoystickActive ? miniJoystickVector.x : (miniKeys.right ? 1 : 0) - (miniKeys.left ? 1 : 0);
    const moveY = miniJoystickActive ? miniJoystickVector.y : (miniKeys.down ? 1 : 0) - (miniKeys.up ? 1 : 0);

    const speed = 3.2;
    bx = clamp(bx + moveX * speed, 0, Math.max(0, arenaRect.width - bennySize));
    by = clamp(by + moveY * speed, 0, Math.max(0, arenaRect.height - bennySize));
    miniBenny.dataset.x = String(bx);
    miniBenny.dataset.y = String(by);
    miniBenny.style.transform = `translate(${bx}px, ${by}px)`;

    miniCollectibles.forEach((desk) => {
      desk.x += desk.vx;
      desk.y += desk.vy;
      if (desk.x <= 2 || desk.x >= arenaRect.width - desk.w - 2) desk.vx *= -1;
      if (desk.y <= 2 || desk.y >= arenaRect.height - desk.h - 2) desk.vy *= -1;
      desk.x = clamp(desk.x, 2, Math.max(2, arenaRect.width - desk.w - 2));
      desk.y = clamp(desk.y, 2, Math.max(2, arenaRect.height - desk.h - 2));
      desk.el.style.transform = `translate(${desk.x}px, ${desk.y}px)`;
    });

    miniHazards.forEach((hazard) => {
      hazard.x += hazard.vx;
      hazard.y += hazard.vy;
      if (hazard.x <= 2 || hazard.x >= arenaRect.width - hazard.w - 2) hazard.vx *= -1;
      if (hazard.y <= 2 || hazard.y >= arenaRect.height - hazard.h - 2) hazard.vy *= -1;
      hazard.x = clamp(hazard.x, 2, Math.max(2, arenaRect.width - hazard.w - 2));
      hazard.y = clamp(hazard.y, 2, Math.max(2, arenaRect.height - hazard.h - 2));
      hazard.el.style.transform = `translate(${hazard.x}px, ${hazard.y}px)`;
    });

    miniCollectibles = miniCollectibles.filter((desk) => {
      const hit = bx + bennySize - itemPad > desk.x
        && bx + itemPad < desk.x + desk.w
        && by + bennySize - itemPad > desk.y
        && by + itemPad < desk.y + desk.h;
      if (hit) {
        desk.el.remove();
        miniCollected += 1;
        updateMiniDeskProgress();
        return false;
      }
      return true;
    });

    miniHazards = miniHazards.filter((hazard) => {
      const hit = bx + bennySize - itemPad > hazard.x
        && bx + itemPad < hazard.x + hazard.w
        && by + bennySize - itemPad > hazard.y
        && by + itemPad < hazard.y + hazard.h;
      if (hit) {
        hazard.el.remove();
        miniCollected = Math.max(0, miniCollected - 2);
        updateMiniDeskProgress();
        miniBenny.classList.add('hit');
        setTimeout(() => miniBenny.classList.remove('hit'), 160);
        return false;
      }
      return true;
    });

    miniAnimId = requestAnimationFrame(miniLoop);
  }

  window.__DecimalCleanup = () => {
    window.removeEventListener('keydown', windowKeydownHandler);
    window.removeEventListener('keyup', windowKeyupHandler);
    stopMiniRound();
    if (canvas) canvas.removeEventListener('click', canvasClickHandler);
    if (inputEl && inputKeydownHandler) inputEl.removeEventListener('keydown', inputKeydownHandler);
    applyGridBtn?.removeEventListener('click', applyGridHandler);
    levelEl?.removeEventListener('change', levelChangeHandler);
    startBtn?.removeEventListener('click', startHandler);
    pauseBtn?.removeEventListener('click', pauseHandler);
    cellSizeInput?.removeEventListener('input', updatePreviewHandler);
    colsInput?.removeEventListener('input', updatePreviewHandler);
    rowsInput?.removeEventListener('input', updatePreviewHandler);
    try { stopGame(); } catch (e) { /* ignore */ }
  };
}
