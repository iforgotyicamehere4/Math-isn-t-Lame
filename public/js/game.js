/* math-pup.js
colors cost 2500 points each; unlocks persist for Math Pup only.
   Integrates math problem generator + game loop + UI.
   - Level structure: Easy, Easy25, Easy50, Easy75, Medium, Medium26, Medium60, Medium100, Mathanomical
   Easy Level is basic addition/subtraction 1-20 in A+B or A-B format generate up to 100 random problems
   Easy25 Level is basic addition/subtraction 25-50 in Ab+B, AA+B or AA-B or AB-B format generate up to 100 random problems
   easy50 Level is basic addition/subtraction 75-100 in AA+BB, AB+BA or AB-BB AA-BB format generate up to 100 random problems
   Easy75 Level is basic addition/subtraction 100-200 in ABC+BB, ABC+BA or ABC-BB AAC-BB format generate up to 100 random problems
   Easy Mathanomical level is addition/subtraction/multiplication/division 1-99 in 3 different ways first way A+B(C)-D/E. 
   second way  C-B/A*A+D. the third way is  D/B+A-B*C format generate up to 200 random problems.
   - Level completion: 3000 points each; Mathanomical unlocked after other 8 are complete
   -use points to buy colors and upgrade bennys magic powers. Benny initial super power is shooting subtraction symbols from his eyes
   to destroy zombies every time the user correctly answers 3 problems in a row Benny Powers up. After user hits 3000 points
   the user gets to use bennies arrow keys using the arrow keys and space bar or just the space bar. 
   first bar user uses arrow keys and space bar to shoot subtraction symbols from bennys eyes to destroy zombies.
    the second tier Benny shoots greater than signs at the zombies and it eliminates all zombies. 
    The screen has a message that then says "Mathtality. Player One wins".
    there are 10 tiers of benny upgrades. 
   the second tier is unlocked after complleting all easy levels. the third tier is unlocked after completing all medium levels.  
   the fourth to tenth tiers are unlocked by earning more points and maintaining longer pup streaks. User profile must have 12k points to unlock all benny tiers.
   to unlock the 4th tier. 
   4 tier benny has a plasma rod in his mouth and cuts zombies in half. arrow pad and space bar
   5th tier is a viral video of a dog driving with a person in the passenger seat.  24k points to unlock
   6th tier is  benny wears a hard hat and uses a nuclear guage that shoots gamma rays and fast neutrons in the form of a wifi signal
   to make the zombies fall asleep. arrow pad and space bar requires 36k points to unlock.
   7th tier benny becomes a dr and uses disenfectant spray to eliminate zombies. arrow pad and space bar requires 48k points to unlock.
   benny can now rko dogko  the zombies. arrow pad and space bar requires 60k points to unlock.
   users have their own profile page and can see their total points earned, total levels completed, total correct answers, 
   total problems attempted, pup streak record, and their collection of benny colors unlocked. Percentage of correct answers.
   benny has his own card on the profile page that shows his current color scheme, current tier, 
   and unlockable tiers with their point and pup streak requirements. Its set up to whare the unlockable tiers are scrollable
   from left to right. the powers that are locked have a ticket price on them showing how many points are needed to unlock them. 
   user uses points aquired to unlock benny tiers and colors. colors are 2500 points each.


   - Booster: 5 consecutive correct -> next 2 problems multiplied by 30 if answered correctly
   - No repetition of identical problems within a level session
   - Division only when integer result
*/

// Timer functions are loaded from mathpup-timer.js via window.mathPupTimer
// Make sure the script is loaded before this code runs

if (window.__MathPupCleanup) window.__MathPupCleanup();
window.__MathPupCleanup = null;

// Reset all game state to ensure clean re-initialization
window.__MathPupStateReset = true;

(() => {
  const { evaluate } = window.math || {};
  
  // -----------------------
  // State Reset Function
  // -----------------------
  function fullGameReset() {
    // Remove Benny element if it exists
    const existingBenny = document.querySelector('#game-area .benny');
    if (existingBenny) {
      existingBenny.remove();
    }
    
    // Remove any zombie or shot elements
    document.querySelectorAll('#game-area .zombie, #game-area .benny-shot').forEach(el => el.remove());
    
    // Reset typed answer container if it exists
    const typedContainer = document.getElementById('typedAnswer');
    if (typedContainer) {
      typedContainer.textContent = '';
    }
    
    // Reset UI elements
    const scoreEl = document.getElementById('score');
    const mathProblemEl = document.getElementById('math-problem');
    const statusEl = document.getElementById('status');
    const timerEl = document.getElementById('timer');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (scoreEl) scoreEl.textContent = 'Score: 0';
    if (mathProblemEl) mathProblemEl.textContent = 'Problem: --';
    if (statusEl) statusEl.textContent = 'Press Start to begin.';
    if (timerEl) timerEl.textContent = 'Time: —';
    if (pauseBtn) pauseBtn.disabled = true;
  }
  
  // Execute full reset on script load
  fullGameReset();
  // -----------------------
  // Utilities
  // -----------------------
  const qs = sel => document.querySelector(sel);
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // simple helper to evaluate an expression string with math.js (fallback to eval-lite)
  function computeAnswer(expr) {
    if (evaluate) {
      try { return Number(evaluate(expr)); } catch { /* fall through */ }
    }
    try { return Number(Function(`"use strict";return (${expr})`)()); } catch { return NaN; }
  }

  function formatAnswer(value) {
    if (!Number.isFinite(value)) return '—';
    return Number.isInteger(value) ? String(value) : String(value);
  }

  function formatExpression(expr) {
    if (!expr) return '';
    return String(expr).replace(/([+\-*/])/g, ' $1 ').replace(/\s+/g, ' ').trim();
  }

  function buildHint(problem) {
    if (!problem) return '';
    const a = problem.a;
    const b = problem.b;
    const op = problem.op;
    if (op === '+') return `Hint: start at ${a} and count ${b} more.`;
    if (op === '-') return `Hint: think "${b} + ? = ${a}".`;
    if (op === '*') return `Hint: ${a} groups of ${b} (add ${b} ${a} times).`;
    if (op === '/') return `Hint: think "${b} x ? = ${a}".`;
    const expr = formatExpression(problem.expr);
    if (expr) {
      if (/[*/]/.test(problem.expr)) {
        return `Hint: solve ${expr} using order of operations.`;
      }
      return `Hint: solve ${expr} left to right.`;
    }
    return 'Hint: use order of operations (x and / before + and -).';
  }
  function getPlayBounds() {
    const nav = document.querySelector('.app-nav');
    const navHeight = nav ? nav.getBoundingClientRect().height : 60;
    const width = Math.max(320, window.innerWidth || 0);
    const height = Math.max(320, window.innerHeight || 0);
    return {
      minX: 8,
      minY: Math.max(70, navHeight + 12),
      maxX: width - 72,
      maxY: height - 88
    };
  }

  // -----------------------
  // MathPupGame core
  // -----------------------
  class MathPupGame {
    constructor(opts = {}) {
      this.config = Object.assign(this.defaultConfig(), opts.config || {});
      this.problemQueues = {};
      this.resetSession();
    }

    defaultConfig() {
      return {
        levels: {
          Easy:         { min: 1,  max: 10,  allowDivision: false, compositeOnly: false, evenOnly: false, requireTwoDigit: false },
          Easy25:       { min: 1,  max: 25,  allowDivision: false, compositeOnly: false, evenOnly: false, requireTwoDigit: false },
          Easy50:       { min: 1,  max: 50,  allowDivision: false, compositeOnly: false, evenOnly: false, requireTwoDigit: true  },
          Easy75:       { min: 1,  max: 75,  allowDivision: false, compositeOnly: false, evenOnly: false, requireTwoDigit: true  },
          Medium:       { min: 1,  max: 10,  allowDivision: true,  compositeOnly: false, evenOnly: false, requireTwoDigit: false },
          Medium26:     { min: 2,  max: 26,  allowDivision: true,  compositeOnly: false, evenOnly: false, requireTwoDigit: false },
          Medium60:     { min: 2,  max: 60,  allowDivision: true,  compositeOnly: false, evenOnly: false, requireTwoDigit: false },
          Medium100:    { min: 1,  max: 100, allowDivision: true,  compositeOnly: false, evenOnly: false, requireTwoDigit: false },
          Mathanomical: { min: 2,  max: 44,  allowDivision: true,  compositeOnly: false, evenOnly: false, requireTwoDigit: false }
        },
        levelDifficultyMultiplier: {
          Easy: 1, Easy25: 1, Easy50: 1, Easy75: 1,
          Medium: 1, Medium26: 1, Medium60: 1, Medium100: 1,
          Mathanomical: 1
        },
        basePoints: 100,
        levelCompletionCorrect: 12,
        maxUniqueHistoryPerLevel: 100000,
        operators: ['+','-','*','/']
      };
    }

    resetSession() {
      this.levelScores = {};
      Object.keys(this.config.levels).forEach(l => this.levelScores[l] = 0);
      this.levelCorrect = {};
      Object.keys(this.config.levels).forEach(l => this.levelCorrect[l] = 0);
      this.levelPenalty = {};
      Object.keys(this.config.levels).forEach(l => this.levelPenalty[l] = 0);
      this.completedLevels = new Set();
      this.history = {};
      Object.keys(this.config.levels).forEach(l => this.history[l] = new Set());
      this.totalCorrect = 0;
      this.totalAttempted = 0;
      this.currentProblem = null;
    }

    isComposite(n) {
      if (n <= 3) return false;
      if (n % 2 === 0 || n % 3 === 0) return true;
      for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return true;
      }
      return false;
    }

    buildOperands(cfg) {
      const arr = [];
      for (let v = cfg.min; v <= cfg.max; v++) {
        if (cfg.compositeOnly && !this.isComposite(v)) continue;
        if (cfg.evenOnly && (v % 2 !== 0)) continue;
        arr.push(v);
      }
      if (arr.length === 0) {
        for (let v = cfg.min; v <= cfg.max; v++) arr.push(v);
      }
      return arr;
    }

    buildProblemQueue(levelName) {
      const problems = [];
      const seen = new Set();
      const pushProblem = (expr, a, b, op) => {
        const ans = computeAnswer(expr);
        if (!Number.isFinite(ans)) return false;
        if (seen.has(expr)) return false;
        seen.add(expr);
        problems.push({
          id: expr,
          level: levelName,
          expr,
          a,
          b,
          op,
          answer: ans,
          basePoints: Math.round(this.config.basePoints * (this.config.levelDifficultyMultiplier[levelName] || 1))
        });
        return true;
      };

      if (levelName === 'Easy') {
        while (problems.length < 100) {
          const a = randInt(1, 20);
          const b = randInt(1, 20);
          const op = Math.random() < 0.5 ? '+' : '-';
          const aa = op === '-' && a < b ? b : a;
          const bb = op === '-' && a < b ? a : b;
          const expr = `${aa}${op}${bb}`;
          pushProblem(expr, aa, bb, op);
        }
        return shuffle(problems);
      }

      if (levelName === 'Easy25') {
        while (problems.length < 100) {
          const a = randInt(25, 50);
          const b = randInt(1, 25);
          const op = Math.random() < 0.5 ? '+' : '-';
          const aa = op === '-' && a < b ? b : a;
          const bb = op === '-' && a < b ? a : b;
          const expr = `${aa}${op}${bb}`;
          pushProblem(expr, aa, bb, op);
        }
        return shuffle(problems);
      }

      if (levelName === 'Easy50') {
        while (problems.length < 100) {
          const a = randInt(75, 100);
          let b = randInt(10, 99);
          if (Math.random() < 0.5) {
            const tens = Math.floor(b / 10);
            const ones = b % 10;
            b = ones * 10 + tens;
          }
          const op = Math.random() < 0.5 ? '+' : '-';
          const aa = op === '-' && a < b ? b : a;
          const bb = op === '-' && a < b ? a : b;
          const expr = `${aa}${op}${bb}`;
          pushProblem(expr, aa, bb, op);
        }
        return shuffle(problems);
      }

      if (levelName === 'Easy75') {
        while (problems.length < 100) {
          const a = randInt(100, 200);
          const b = randInt(10, 99);
          const c = randInt(10, 99);
          const op1 = Math.random() < 0.5 ? '+' : '-';
          const op2 = Math.random() < 0.5 ? '+' : '-';
          const expr = `${a}${op1}${b}${op2}${c}`;
          if (!Number.isFinite(computeAnswer(expr))) continue;
          pushProblem(expr, a, b, 'mix');
        }
        return shuffle(problems);
      }

      if (levelName === 'Mathanomical') {
        const target = 200;
        const tryPush = (expr) => {
          const ans = computeAnswer(expr);
          if (!Number.isFinite(ans) || !Number.isInteger(ans)) return false;
          if (seen.has(expr)) return false;
          seen.add(expr);
          problems.push({
            id: expr,
            level: levelName,
            expr,
            a: null,
            b: null,
            op: 'mix',
            answer: ans,
            basePoints: Math.round(this.config.basePoints * (this.config.levelDifficultyMultiplier[levelName] || 1))
          });
          return true;
        };
        while (problems.length < target) {
          const A = randInt(1, 99);
          const B = randInt(1, 99);
          const C = randInt(1, 99);
          const D = randInt(1, 99);
          const E = randInt(1, 9);
          if (D % E !== 0) continue;
          const expr1 = `${A}+${B}*${C}-${D}/${E}`;
          tryPush(expr1);
        }
        while (problems.length < target) {
          const A = randInt(1, 99);
          const B = randInt(1, 99);
          const C = randInt(1, 99);
          const D = randInt(1, 99);
          if (B % A !== 0) continue;
          const expr2 = `${C}-${B}/${A}*${A}+${D}`;
          tryPush(expr2);
        }
        while (problems.length < target) {
          const A = randInt(1, 99);
          const B = randInt(1, 99);
          const C = randInt(1, 99);
          const D = randInt(1, 99);
          if (D % B !== 0) continue;
          const expr3 = `${D}/${B}+${A}-${B}*${C}`;
          tryPush(expr3);
        }
        return shuffle(problems);
      }

      return null;
    }

    generate(levelName) {
      if (['Easy', 'Easy25', 'Easy50', 'Easy75', 'Mathanomical'].includes(levelName)) {
        if (!this.problemQueues[levelName] || this.problemQueues[levelName].length === 0) {
          this.problemQueues[levelName] = this.buildProblemQueue(levelName) || [];
        }
        const next = this.problemQueues[levelName].shift();
        if (next) {
          this.currentProblem = { ...next };
          return this.currentProblem;
        }
      }
      const cfg = this.config.levels[levelName];
      if (!cfg) throw new Error('Unknown level ' + levelName);
      const operands = this.buildOperands(cfg);
      const ops = this.config.operators.slice();

      const MAX_TRIES = 4000;
      let tries = 0;
      while (tries++ < MAX_TRIES) {
        const op = ops[randInt(0, ops.length - 1)];
        if (op === '/' && !cfg.allowDivision) continue;

        let a, b, ans;
        if (op === '/') {
          b = operands[randInt(0, operands.length - 1)];
          if (b === 0) continue;
          const maxQ = Math.max(1, Math.floor(cfg.max / Math.max(1, b)));
          const q = randInt(1, Math.max(1, maxQ));
          a = q * b;
          if (a < cfg.min || a > cfg.max) {
            const divisibles = operands.filter(x => x % b === 0);
            if (divisibles.length === 0) continue;
            a = divisibles[randInt(0, divisibles.length - 1)];
            ans = a / b;
          } else ans = q;
        } else {
          a = operands[randInt(0, operands.length - 1)];
          b = operands[randInt(0, operands.length - 1)];
          if (op === '-' && a < b) [a, b] = [b, a];
          const expr = `${a}${op}${b}`;
          ans = computeAnswer(expr);
        }

        if (cfg.requireTwoDigit && !(a >= 10 || b >= 10)) {
          const twoDigits = operands.filter(x => x >= 10);
          if (twoDigits.length === 0) continue;
          if (Math.random() < 0.5) a = twoDigits[randInt(0, twoDigits.length - 1)];
          else b = twoDigits[randInt(0, twoDigits.length - 1)];
          if (op === '+') ans = a + b;
          if (op === '-') { if (a < b) [a,b] = [b,a]; ans = a - b; }
          if (op === '*') ans = a * b;
          if (op === '/') {
            const divisors = operands.filter(x => x !== 0 && a % x === 0);
            if (divisors.length === 0) continue;
            b = divisors[randInt(0, divisors.length - 1)];
            ans = a / b;
          }
        }

        let key;
        if (op === '+' || op === '*') {
          const pair = a <= b ? [a, b] : [b, a];
          key = `${pair[0]}${op}${pair[1]}`;
        } else key = `${a}${op}${b}`;

        if (this.history[levelName].has(key)) continue;
        this.history[levelName].add(key);
        if (this.history[levelName].size > this.config.maxUniqueHistoryPerLevel) {
          this.history[levelName] = new Set();
        }

        const points = Math.round(this.config.basePoints * (this.config.levelDifficultyMultiplier[levelName] || 1));
        const expr = `${a}${op}${b}`;
        const problem = { id: key, level: levelName, expr, a, b, op, answer: ans, basePoints: points };
        this.currentProblem = problem;
        return problem;
      }
      throw new Error('Could not generate unique problem for ' + levelName);
    }

    answer(userAnswer) {
      if (!this.currentProblem) throw new Error('No current problem');
      const p = this.currentProblem;
      const expected = computeAnswer(p.expr || `${p.a}${p.op}${p.b}`);
      const correct = Number(userAnswer) === Number(expected);
      this.totalAttempted++;
      let pointsEarned = 0;
      if (correct) {
        this.totalCorrect++;
        pointsEarned = 100;
        this.levelScores[p.level] = (this.levelScores[p.level] || 0) + pointsEarned;
        this.levelCorrect[p.level] = (this.levelCorrect[p.level] || 0) + 1;
      } else {
        this.levelPenalty[p.level] = (this.levelPenalty[p.level] || 0) + 1;
      }

      let levelJustCompleted = false;
      const requiredCorrect = this.config.levelCompletionCorrect + (this.levelPenalty[p.level] || 0);
      if (this.levelCorrect[p.level] >= requiredCorrect && !this.completedLevels.has(p.level)) {
        this.completedLevels.add(p.level);
        levelJustCompleted = true;
      }

      this.currentProblem = null;
      return {
        correct,
        pointsEarned,
        levelJustCompleted,
        completedLevels: Array.from(this.completedLevels)
      };
    }

    isMathanomicalUnlocked() {
      const required = Object.keys(this.config.levels).filter(l => l !== 'Mathanomical');
      return required.every(l => this.completedLevels.has(l));
    }
  }

  // -----------------------
  // UI/Game glue
  // -----------------------
  const canvas = qs('#gameCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const gameArea = qs('#game-area');
  const mathProblemEl = qs('#math-problem');
  const scoreEl = qs('#score');
  const highscoreEl = qs('#highscore');
  const levelSelect = qs('#levelSelect');
  const startBtn = qs('#startBtn');
  const pauseBtn = qs('#pauseBtn');
  const musicToggle = qs('#musicToggle');
  const musicNowPlayingEl = qs('#musicNowPlaying');
  const statusEl = qs('#status');
  const timerEl = qs('#timer');
  const bennyPaletteEl = qs('#bennyPalette');
  const bennyUnlockInfoEl = qs('#bennyUnlockInfo');
  const mathHintEl = qs('#mathHint');
  let bennyDock = null;
  const mobileControls = qs('#mobileControls');
  const mobileJoystick = qs('#mobileJoystick');
  const mobileStick = qs('#mobileStick');
  const mobileShoot = qs('#mobileShoot');
  const mobileAnswer = qs('#mobileAnswer');
  const mobileAnswerBtn = qs('#mobileAnswerBtn');

  const typedContainer = document.createElement('div');
  typedContainer.id = 'typedAnswer';
  typedContainer.style.marginTop = '8px';
  typedContainer.style.fontWeight = '700';
  typedContainer.style.color = '#ffd';
  typedContainer.textContent = '';
  const gameInfo = qs('.game-info');

  function setHint(message) {
    if (!mathHintEl) return;
    mathHintEl.textContent = message || '';
  }
  if (gameInfo) gameInfo.appendChild(typedContainer);

  if (!gameArea || !mathProblemEl || !scoreEl || !levelSelect || !startBtn) {
    console.error('Game UI missing required elements.');
    return;
  }

  const engine = new MathPupGame();
  const levelOperatorMap = {
    Easy: ['-','+'],
    Easy25: ['+','-'],
    Easy50: ['+','-'],
    Easy75: ['+','-'],
    Medium: ['*','/'],
    Medium26: ['*','/'],
    Medium60: ['*','/'],
    Medium100: ['*','/'],
    Mathanomical: ['+','-','*','/']
  };
  const levelOrder = Object.keys(engine.config.levels);

  function populateLevels() {
    const existing = new Set(Array.from(levelSelect.options).map(o => o.value));
    Object.keys(engine.config.levels).forEach(levelName => {
      if (!existing.has(levelName)) {
        const opt = document.createElement('option');
        opt.value = levelName;
        opt.textContent = levelName;
        levelSelect.appendChild(opt);
      }
    });
  }
  populateLevels();

  let currentLevel = levelSelect.value || Object.keys(engine.config.levels)[0];
  let score = 0;
  let running = false;
  let roundActive = false;
  let typedBuffer = '';
  let roundToken = 0;
  let nextRoundTimeout = null;
  let timerLevelName = null;
  let miniGameActive = false;
  let miniGameFrame = null;
  let lastMiniTick = 0;
  let miniGameTimeout = null;
  let miniGameCountdown = null;
  let levelTimerInterval = null;
  let levelTimeRemaining = 0;
  let levelExpired = false;
  let problemTimeRemaining = 0;
  let problemSecondsLeft = 0;
  let problemStartAt = null;
  let miniZombies = [];
  let miniShots = [];
  let zombieIdCounter = 0;
  const pressedKeys = new Set();
  let lastAim = { x: 0, y: -1 };
  let keydownHandler = null;
  let keyupHandler = null;
  let pupStreak = 0;

  let benny = null;
  const bennyState = { x: 0, y: 0, vx: 0, vy: 0 };
  let activeBennyColor = null;
  let joystickActive = false;
  let joystickVector = { x: 0, y: 0 };
  let joystickCenter = { x: 0, y: 0 };
  const joystickRadius = 28;
  const rawBaseUrl = String(window.__MathPopBaseUrl || '/');
  const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
  const DEFAULT_SONGS = [{ id: 'song-01', label: 'Math isn\u2019t lame', filename: '01-math-isnt-lame.mp3' }];
  let musicEnabled = false;
  let bgMusic = null;
  let musicToggleHandler = null;
  let musicToggleClickHandler = null;
  let musicPopupTimer = null;
  let enabledSongs = [];
  let songQueue = [];
  let currentSong = null;
  let triedFallbackForSong = false;
  let previousSongs = [];
  let musicTapCount = 0;
  let musicLastTapAt = 0;
  let musicTapResetTimer = null;
  const MUSIC_TAP_WINDOW_MS = 5000;
  const MUSIC_TAP_DECISION_MS = 320;

  function shuffleSongs(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function loadEnabledSongsFromProfile() {
    const allSongs = Array.isArray(window.__MathPopJukeboxSongs) && window.__MathPopJukeboxSongs.length
      ? window.__MathPopJukeboxSongs
      : DEFAULT_SONGS;
    const user = localStorage.getItem('mathpop_current_user');
    if (!user) return [];
    const raw = localStorage.getItem(`mathpop_jukebox_${user}`);
    if (!raw) return [];
    try {
      const state = JSON.parse(raw);
      return allSongs
        .filter((song) => Boolean(state?.[song.id]))
        .map((song) => ({ title: song.label, filename: song.filename }));
    } catch {
      return [];
    }
  }

  function syncSongsFromProfile() {
    enabledSongs = loadEnabledSongsFromProfile();
    songQueue = [];
    currentSong = null;
    triedFallbackForSong = false;
    previousSongs = [];
    if (!enabledSongs.length && statusEl) {
      statusEl.textContent = 'No songs enabled. Turn songs On in Profile > Benny Jukebox.';
    }
  }

  function showNowPlaying(title) {
    if (!musicNowPlayingEl) return;
    musicNowPlayingEl.textContent = `Now Playing: ${title}`;
    musicNowPlayingEl.classList.add('show');
    if (musicPopupTimer) clearTimeout(musicPopupTimer);
    musicPopupTimer = setTimeout(() => {
      musicNowPlayingEl.classList.remove('show');
    }, 2200);
  }

  function ensureBackgroundMusic() {
    if (bgMusic) return bgMusic;
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    bgMusic.volume = 0.85;
    bgMusic.addEventListener('error', () => {
      if (!currentSong) return;
      if (!triedFallbackForSong) {
        setSongSource(currentSong, true);
        return;
      }
      skipToNextSong();
    });
    bgMusic.addEventListener('ended', () => {
      skipToNextSong();
    });
    bgMusic.loop = false;
    return bgMusic;
  }

  function pullNextSong() {
    if (!enabledSongs.length) return null;
    if (!songQueue.length) songQueue = shuffleSongs(enabledSongs);
    return songQueue.shift() || null;
  }

  function setSongSource(song, useFallback = false) {
    if (!song) return false;
    const audio = ensureBackgroundMusic();
    const filename = String(song.filename || '').replace(/^\//, '');
    if (!filename) return false;
    currentSong = song;
    triedFallbackForSong = useFallback;
    audio.src = useFallback
      ? `/audio/jukebox/${filename}`
      : `${normalizedBaseUrl}audio/jukebox/${filename}`;
    audio.load();
    return true;
  }

  function playBackgroundMusic() {
    if (!musicEnabled) return;
    if (!enabledSongs.length) {
      syncSongsFromProfile();
      if (!enabledSongs.length) return;
    }
    const audio = ensureBackgroundMusic();
    if (!currentSong) {
      const nextSong = pullNextSong();
      if (!nextSong || !setSongSource(nextSong, false)) return;
    }
    const wasPaused = audio.paused;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise
        .then(() => {
          if (wasPaused && currentSong) showNowPlaying(currentSong.title);
        })
        .catch(() => {
          if (statusEl) statusEl.textContent = 'Music blocked by browser. Tap Music once.';
        });
      return;
    }
    if (wasPaused && currentSong) showNowPlaying(currentSong.title);
  }

  function pauseBackgroundMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
  }

  function resetMusicTapSequence() {
    musicTapCount = 0;
    musicLastTapAt = 0;
    if (musicTapResetTimer) {
      clearTimeout(musicTapResetTimer);
      musicTapResetTimer = null;
    }
  }

  function scheduleMusicTapReset() {
    if (musicTapResetTimer) clearTimeout(musicTapResetTimer);
    musicTapResetTimer = setTimeout(() => {
      const count = musicTapCount;
      resetMusicTapSequence();
      if (count >= 3) {
        goToPreviousSong();
        return;
      }
      if (count === 2) {
        skipToNextSong();
        return;
      }
      if (count === 1) {
        if (bgMusic && !bgMusic.paused) {
          pauseBackgroundMusic();
        } else {
          playBackgroundMusic();
        }
      }
    }, MUSIC_TAP_DECISION_MS);
  }

  function skipToNextSong() {
    if (!enabledSongs.length) {
      syncSongsFromProfile();
      if (!enabledSongs.length) return;
    }
    if (currentSong) previousSongs.push(currentSong);
    const nextSong = pullNextSong();
    if (!nextSong || !setSongSource(nextSong, false)) return;
    playBackgroundMusic();
  }

  function goToPreviousSong() {
    if (!previousSongs.length) return;
    const previousSong = previousSongs.pop();
    if (currentSong) songQueue.unshift(currentSong);
    if (!setSongSource(previousSong, false)) return;
    playBackgroundMusic();
  }

  function handleMusicTap() {
    const now = Date.now();
    if (now - musicLastTapAt > MUSIC_TAP_WINDOW_MS) musicTapCount = 0;
    musicTapCount += 1;
    musicLastTapAt = now;
    scheduleMusicTapReset();
  }

  function applyMusicEnabled(nextValue) {
    musicEnabled = Boolean(nextValue);
    if (musicToggle) musicToggle.checked = musicEnabled;
    if (!musicEnabled) {
      pauseBackgroundMusic();
      resetMusicTapSequence();
      return;
    }
    syncSongsFromProfile();
    if (running) playBackgroundMusic();
  }

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

  const PROBLEM_TIME_MS = 30000;
  const LEVEL_TIME_MS = {
    easy: 900000,
    medium: 1200000,
    mathanomical: 1500000
  };
  problemTimeRemaining = PROBLEM_TIME_MS;
  // Safely configure timer - may not be available if scripts load out of order
  if (window.mathPupTimer && typeof window.mathPupTimer.configureTimer === 'function') {
    window.mathPupTimer.configureTimer({
      durationMs: PROBLEM_TIME_MS,
      onTick: onQuestionTick,
      onTimeout: onQuestionTimeout
    });
  }

  function currentUser() {
    const user = localStorage.getItem('mathpop_current_user') || 'guest';
    const profile = JSON.parse(localStorage.getItem('mathpop_profile_' + user) || '{}');
    return (profile && profile.username) || user || 'guest';
  }
  function highScoreKey(user, level) {
    return `mathpop_highscore_${user}_${level}`;
  }
  function loadHighScore(level) {
    const u = currentUser();
    const val = parseInt(localStorage.getItem(highScoreKey(u, level)) || '0', 10);
    if (highscoreEl) highscoreEl.textContent = `High Score: ${val}`;
    return val;
  }
  function updateHighScoreIfNeeded(level) {
    const u = currentUser();
    const key = highScoreKey(u, level);
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    if (score > prev) localStorage.setItem(key, String(score));
    loadHighScore(level);
  }

  function profileStatsKey() {
    return `mathpop_profile_stats_${currentUser()}`;
  }

  function loadProfileStats() {
    const raw = localStorage.getItem(profileStatsKey());
    if (!raw) {
      return {
        totalPoints: 0,
        totalCorrect: 0,
        totalAttempted: 0,
        pupStreakRecord: 0,
        levelsCompleted: [],
        spentPoints: 0,
        tierUnlocks: [],
        activeTier: 1,
        games: {}
      };
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        totalPoints: Number(parsed.totalPoints) || 0,
        totalCorrect: Number(parsed.totalCorrect) || 0,
        totalAttempted: Number(parsed.totalAttempted) || 0,
        pupStreakRecord: Number(parsed.pupStreakRecord) || 0,
        levelsCompleted: Array.isArray(parsed.levelsCompleted) ? parsed.levelsCompleted : [],
        spentPoints: Number(parsed.spentPoints) || 0,
        tierUnlocks: Array.isArray(parsed.tierUnlocks) ? parsed.tierUnlocks : [],
        activeTier: Number(parsed.activeTier) || 1,
        games: parsed.games && typeof parsed.games === 'object' ? parsed.games : {}
      };
    } catch (e) {
      return {
        totalPoints: 0,
        totalCorrect: 0,
        totalAttempted: 0,
        pupStreakRecord: 0,
        levelsCompleted: [],
        spentPoints: 0,
        tierUnlocks: [],
        activeTier: 1,
        games: {}
      };
    }
  }

  function ensureGameStats(stats, gameId) {
    if (!stats.games[gameId]) {
      stats.games[gameId] = {
        points: 0,
        correct: 0,
        attempted: 0,
        bestScore: 0,
        streakRecord: 0,
        gamesPlayed: 0,
        levelsCompleted: []
      };
    }
    return stats.games[gameId];
  }

  function saveProfileStats(stats) {
    localStorage.setItem(profileStatsKey(), JSON.stringify(stats));
  }

  function recordProblemTiming(levelName, problem, elapsedMs, result) {
    if (!problem) return;
    const stats = loadProfileStats();
    if (!stats.problemTiming || typeof stats.problemTiming !== 'object') {
      stats.problemTiming = {};
    }
    const key = `${levelName}:${problem.op || 'expr'}`;
    if (!stats.problemTiming[key]) {
      stats.problemTiming[key] = {
        count: 0,
        totalMs: 0,
        correct: 0,
        incorrect: 0,
        timeout: 0
      };
    }
    const entry = stats.problemTiming[key];
    entry.count += 1;
    entry.totalMs += Math.max(0, Math.floor(elapsedMs || 0));
    if (result === 'correct') entry.correct += 1;
    if (result === 'incorrect') entry.incorrect += 1;
    if (result === 'timeout') entry.timeout += 1;
    saveProfileStats(stats);
  }

  function isTierUnlocked(tierId) {
    const stats = loadProfileStats();
    const unlocks = new Set(stats.tierUnlocks || []);
    unlocks.add(1);
    return unlocks.has(tierId);
  }

  function getActiveTier() {
    const stats = loadProfileStats();
    return Number(stats.activeTier) || 1;
  }

  function getBennyUnlocks() {
    const u = currentUser();
    const raw = localStorage.getItem(`mathpup_benny_unlocks_${u}`);
    if (!raw) return { easy: 1, medium: 1, math: 0 };
    try {
      const parsed = JSON.parse(raw);
      return {
        easy: Number(parsed.easy) || 1,
        medium: Number(parsed.medium) || 1,
        math: Number(parsed.math) || 0
      };
    } catch (e) {
      return { easy: 1, medium: 1, math: 0 };
    }
  }

  function setBennyUnlocks(next) {
    const u = currentUser();
    localStorage.setItem(`mathpup_benny_unlocks_${u}`, JSON.stringify(next));
  }

  function getBennyColorKey() {
    return `mathpup_benny_color_${currentUser()}`;
  }

  function applyBennyColor(color) {
    if (!benny) return;
    const body = benny.querySelector('.back');
    const head = benny.querySelector('.head');
    if (!body || !head) return;
    if (color.type === 'tone') {
      const fill = `linear-gradient(135deg, ${color.primary} 0%, ${color.primary} 50%, ${color.secondary} 50%, ${color.secondary} 100%)`;
      body.style.background = fill;
      head.style.background = fill;
    } else {
      body.style.background = color.primary;
      head.style.background = color.primary;
    }
    activeBennyColor = color;
    localStorage.setItem(getBennyColorKey(), color.id);
  }

  function getLevelGroup(levelName) {
    if (levelName.startsWith('Easy')) return 'easy';
    if (levelName.startsWith('Medium')) return 'medium';
    return 'math';
  }

  function getTierBonus(levelName) {
    const easyTiers = ['Easy','Easy25','Easy50','Easy75'];
    const mediumTiers = ['Medium','Medium26','Medium60','Medium100'];
    if (easyTiers.includes(levelName)) return (easyTiers.indexOf(levelName) + 1) * 5;
    if (mediumTiers.includes(levelName)) return (mediumTiers.indexOf(levelName) + 1) * 5;
    return 0;
  }

  function updateBennyUnlocks(levelName) {
    renderBennyPalette(levelName);
  }

  function isColorUnlocked(idx, levelName, unlocks) {
    if (idx < 20) return unlocks.easy >= (idx + 1);
    if (idx < 40) return unlocks.medium >= (idx - 19);
    return unlocks.math >= (idx - 39);
  }

  function renderBennyPalette(levelName) {
    if (!bennyPaletteEl) return;
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathpup');
    const unlockedCount = Math.min(Math.floor((gameStats.points || 0) / 2500), BENNY_COLORS.length);
    bennyPaletteEl.innerHTML = '';
    BENNY_COLORS.forEach((color, idx) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'benny-swatch';
      swatch.title = color.name;
      if (color.type === 'tone') {
        swatch.style.background = `linear-gradient(135deg, ${color.primary} 0%, ${color.primary} 50%, ${color.secondary} 50%, ${color.secondary} 100%)`;
      } else {
        swatch.style.background = color.primary;
      }
      const unlocked = idx < unlockedCount;
      if (!unlocked) swatch.classList.add('locked');
      if (activeBennyColor && activeBennyColor.id === color.id) swatch.classList.add('selected');
      swatch.addEventListener('click', () => {
        if (!unlocked) return;
        applyBennyColor(color);
        renderBennyPalette(levelName);
      });
      bennyPaletteEl.appendChild(swatch);
    });

    if (bennyUnlockInfoEl) {
      bennyUnlockInfoEl.textContent = `Benny colors unlocked: ${unlockedCount}/${BENNY_COLORS.length} (2500 pts each)`;
    }
  }

  function loadBennyColor(levelName) {
    const saved = localStorage.getItem(getBennyColorKey());
    const match = BENNY_COLORS.find(c => c.id === saved) || BENNY_COLORS[0];
    applyBennyColor(match);
    renderBennyPalette(levelName);
  }

  function ensureBenny() {
    if (!gameArea) return;
    if (!benny) {
      benny = document.createElement('div');
      benny.className = 'benny';
      benny.innerHTML = '<div class="benny-base"><div class="benny-shape"><div class="back"></div><div class="leg-left"></div><div class="leg-right"></div><div class="head"></div></div></div>';
      gameArea.appendChild(benny);
    }
    if (miniGameActive) {
      undockBenny();
    } else {
      dockBennyIfNeeded();
    }
    if (bennyState.x === 0 && bennyState.y === 0) {
      const bounds = getPlayBounds();
      bennyState.x = randInt(bounds.minX + 10, Math.max(bounds.minX + 10, bounds.maxX - 10));
      bennyState.y = randInt(bounds.minY + 10, Math.max(bounds.minY + 10, bounds.maxY - 10));
      bennyState.vx = 0;
      bennyState.vy = 0;
      benny.style.left = bennyState.x + 'px';
      benny.style.top = bennyState.y + 'px';
    }
    loadBennyColor(currentLevel);
  }

  function isMobileLayout() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(max-width: 880px)').matches;
  }

  function getBennyDock() {
    if (!bennyDock) bennyDock = qs('#bennyDock');
    return bennyDock;
  }

  function dockBennyIfNeeded() {
    const dock = getBennyDock();
    if (!benny || !dock) return;
    if (!isMobileLayout() || miniGameActive) return;
    if (benny.parentNode !== dock) {
      dock.appendChild(benny);
    }
    benny.classList.add('benny--docked');
    benny.style.left = '';
    benny.style.top = '';
  }

  function undockBenny() {
    if (!benny || !gameArea) return;
    if (benny.parentNode !== gameArea) {
      gameArea.appendChild(benny);
    }
    benny.classList.remove('benny--docked');
    const bounds = getPlayBounds();
    bennyState.x = clamp(bennyState.x || bounds.minX + 40, bounds.minX, bounds.maxX);
    bennyState.y = clamp(bennyState.y || bounds.minY + 40, bounds.minY, bounds.maxY);
    benny.style.left = `${bennyState.x}px`;
    benny.style.top = `${bennyState.y}px`;
  }

  function clearRoundTimers() {
    // Safely stop timer - may not be available if scripts load out of order
    if (window.mathPupTimer && typeof window.mathPupTimer.stopTimer === 'function') {
      window.mathPupTimer.stopTimer();
    }
    problemStartAt = null;
    problemTimeRemaining = 0;
    problemSecondsLeft = 0;
  }

  function clearNextRoundTimeout() {
    if (nextRoundTimeout) {
      clearTimeout(nextRoundTimeout);
      nextRoundTimeout = null;
    }
  }

  function clearMiniGame() {
    if (miniGameTimeout) {
      clearTimeout(miniGameTimeout);
      miniGameTimeout = null;
    }
    if (miniGameCountdown) {
      clearInterval(miniGameCountdown);
      miniGameCountdown = null;
    }
    pressedKeys.clear();
    miniZombies.forEach(z => z.el.remove());
    miniShots.forEach(s => s.el.remove());
    miniZombies = [];
    miniShots = [];
    if (miniGameFrame) {
      cancelAnimationFrame(miniGameFrame);
      miniGameFrame = null;
    }
    lastMiniTick = 0;
  }

  function clearLevelTimer() {
    if (levelTimerInterval) {
      clearInterval(levelTimerInterval);
      levelTimerInterval = null;
    }
  }

  function getLevelDuration(levelName) {
    if (levelName.startsWith('Easy')) return LEVEL_TIME_MS.easy;
    if (levelName.startsWith('Medium')) return LEVEL_TIME_MS.medium;
    return LEVEL_TIME_MS.mathanomical;
  }

  function getNextLevel(levelName) {
    const idx = levelOrder.indexOf(levelName);
    if (idx < 0 || idx === levelOrder.length - 1) return null;
    return levelOrder[idx + 1];
  }

  function updateTimerDisplay() {
    if (!timerEl || miniGameActive) return;
    const levelSec = Math.max(0, Math.ceil(levelTimeRemaining / 1000));
    const problemSec = Math.max(0, problemSecondsLeft || Math.ceil(problemTimeRemaining / 1000));
    timerEl.textContent = `Time: ${problemSec}s | Level: ${levelSec}s`;
    if (running && roundActive && problemSec <= 10 && problemSec > 0) {
      timerEl.classList.add('timer-urgent');
    } else {
      timerEl.classList.remove('timer-urgent');
    }
  }

  function onQuestionTick(remaining) {
    problemTimeRemaining = remaining;
    problemSecondsLeft = Math.ceil(remaining / 1000);
    updateTimerDisplay();
  }

  function onQuestionTimeout() {
    if (!running || !roundActive) return;
    roundActive = false;
    statusEl.textContent = 'Next problem...';
    const levelName = timerLevelName || currentLevel;
    updateHighScoreIfNeeded(levelName);
    recordProblemTiming(levelName, engine.currentProblem, PROBLEM_TIME_MS, 'timeout');
    engine.currentProblem = null;
    clearNextRoundTimeout();
    nextRoundTimeout = setTimeout(() => {
      if (!running) return;
      pupStreak = 0;
      clearRoundTimers();
      startRound(levelName);
    }, 4000);
  }

  function startLevelTimer(levelName) {
    clearLevelTimer();
    levelTimeRemaining = getLevelDuration(levelName);
    const levelEndAt = performance.now() + levelTimeRemaining;
    updateTimerDisplay();
    levelTimerInterval = setInterval(() => {
      if (!running) return;
      levelTimeRemaining = levelEndAt - performance.now();
      if (levelTimeRemaining <= 0) {
        levelTimeRemaining = 0;
        levelExpired = true;
        clearLevelTimer();
        clearRoundTimers();
        clearNextRoundTimeout();
        running = false;
        roundActive = false;
        problemSecondsLeft = 0;
        problemTimeRemaining = 0;
        if (timerEl) {
          timerEl.classList.remove('timer-urgent');
          timerEl.textContent = 'Level: 0s';
        }
        typedBuffer = '';
        typedContainer.textContent = '';
        mathProblemEl.textContent = 'Problem: --';
        pauseBtn.disabled = true;
        setTimeout(() => {
          statusEl.textContent = "Time's up! Press Start to try again.";
        }, 1000);
        return;
      }
      if (!roundActive) updateTimerDisplay();
    }, 1000);
  }

  function getMiniZombieCount(levelName) {
    const order = ['Easy', 'Easy25', 'Easy50', 'Easy75', 'Medium', 'Medium26', 'Medium60', 'Medium100', 'Mathanomical'];
    const idx = Math.max(0, order.indexOf(levelName));
    return Math.min(18, 3 + idx + 3);
  }

  function spawnMiniZombies(levelName) {
    const bounds = getPlayBounds();
    const baseW = 64;
    const baseH = 90;
    const scale = getMiniZombieScale();
    const zW = baseW * scale;
    const zH = baseH * scale;
    const count = getMiniZombieCount(levelName);
    const now = performance.now();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'zombie mini-zombie';
      el.textContent = '';
      el.style.setProperty('--mini-scale', String(scale));
      el.innerHTML = '<div class="mini-zombie__shadow"></div><div class="mini-zombie__core"></div><div class="mini-zombie__shield"></div><div class="mini-zombie__plate"></div>';
      const x = randInt(bounds.minX, bounds.maxX - zW);
      const y = randInt(bounds.minY, bounds.maxY - zH);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      gameArea.appendChild(el);
      const shieldOnMs = randInt(850, 1400);
      const shieldOffMs = randInt(700, 1200);
      const armor = Math.random() < 0.55 ? 1 : 0;
      if (armor > 0) el.classList.add('armored');
      el.classList.add('shielded');
      miniZombies.push({
        id: ++zombieIdCounter,
        el,
        x,
        y,
        w: zW,
        h: zH,
        speed: 0.45 + Math.random() * 0.35,
        shieldActive: true,
        shieldOnMs,
        shieldOffMs,
        nextShieldToggle: now + shieldOnMs,
        armor
      });
    }
  }

  function shootBenny() {
    if (!benny) return;
    const baseX = bennyState.x + 10;
    const baseY = bennyState.y + 8;
    const activeTier = getActiveTier();
    const isBoomerang = activeTier === 2 && isTierUnlocked(2);
    const isTargetLock = activeTier === 3 && isTierUnlocked(3);
    const isWizard = activeTier === 5 && isTierUnlocked(5);
    const isGamma = activeTier === 6 && isTierUnlocked(6);
    const aim = lastAim;
    const spread = isBoomerang ? 0.18 : 0.25;
    const angles = [
      Math.atan2(aim.y, aim.x) - spread,
      Math.atan2(aim.y, aim.x) + spread
    ];
    const wizardColors = ['#8b5cf6', '#facc15', '#fb923c', '#f472b6'];
    const shotChar = isBoomerang ? '<' : (isWizard ? 'π' : '−');
    const pickTargetId = (x, y) => {
      let chosen = null;
      let nearest = Infinity;
      miniZombies.forEach((z) => {
        const dx = z.x - x;
        const dy = z.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < nearest) {
          nearest = dist;
          chosen = z;
        }
      });
      return chosen ? chosen.id : null;
    };
    angles.forEach((angle, idx) => {
      const el = document.createElement('div');
      el.className = 'benny-shot';
      if (isGamma) {
        el.classList.add('gamma-shot');
        el.innerHTML = '<span class="gamma-line">~</span><span class="gamma-line">~</span><span class="gamma-line">~</span>';
      } else {
        el.textContent = shotChar;
      }
      el.style.position = 'absolute';
      el.style.fontWeight = '900';
      if (isGamma) {
        el.style.color = '#7cf4ff';
        el.style.textShadow = '0 0 10px rgba(124, 244, 255, 0.9), 0 0 18px rgba(59, 130, 246, 0.7)';
      } else if (isWizard) {
        const color = wizardColors[randInt(0, wizardColors.length - 1)];
        el.style.color = color;
        el.style.textShadow = `0 0 8px ${color}`;
      } else {
        el.style.color = '#ffef7a';
        el.style.textShadow = '0 0 6px rgba(255, 235, 120, 0.8)';
      }
      el.style.pointerEvents = 'none';
      const baseSpeed = isBoomerang ? 5.1 : 4.2;
      const vx = Math.cos(angle) * baseSpeed + (Math.random() - 0.5) * 0.3;
      const vy = Math.sin(angle) * baseSpeed + (Math.random() - 0.5) * 0.3;
      const shot = {
        el,
        x: baseX + (idx === 0 ? -6 : 6),
        y: baseY,
        vx,
        vy,
        homing: isTargetLock,
        targetId: isTargetLock ? pickTargetId(baseX, baseY) : null,
        boomerang: isBoomerang,
        returning: false,
        returnAfterMs: 420,
        lifeMs: 0,
        maxLifeMs: 2600,
        spin: idx === 0 ? -1 : 1
      };
      el.style.left = `${shot.x}px`;
      el.style.top = `${shot.y}px`;
      gameArea.appendChild(el);
      miniShots.push(shot);
    });
  }

  function tryLightsaber() {
    if (!benny) return false;
    if (!isTierUnlocked(4) || getActiveTier() !== 4) return false;
    let targetIndex = -1;
    let nearest = Infinity;
    miniZombies.forEach((z, idx) => {
      const dx = z.x - bennyState.x;
      const dy = z.y - bennyState.y;
      const dist = Math.hypot(dx, dy);
      if (dist < nearest) {
        nearest = dist;
        targetIndex = idx;
      }
    });
    if (targetIndex === -1) return false;
    const target = miniZombies[targetIndex];
    // Lunge toward target so Plasma Rod always triggers when selected.
    bennyState.x = clamp(target.x - 12, getPlayBounds().minX, getPlayBounds().maxX);
    bennyState.y = clamp(target.y + 8, getPlayBounds().minY, getPlayBounds().maxY);
    benny.style.left = `${bennyState.x}px`;
    benny.style.top = `${bennyState.y}px`;
    benny.classList.add('lightsaber');
    target.el.classList.add('lightsaber-cut');
    setTimeout(() => {
      target.el.classList.add('lightsaber-split');
      setTimeout(() => {
        target.el.remove();
        miniZombies.splice(targetIndex, 1);
      }, 300);
    }, 150);
    setTimeout(() => {
      if (benny) benny.classList.remove('lightsaber');
    }, 400);
    return true;
  }

  function tryDogKO() {
    if (!benny) return false;
    if (!isTierUnlocked(8) || getActiveTier() !== 8) return false;
    let targetIndex = -1;
    let nearest = Infinity;
    miniZombies.forEach((z, idx) => {
      const dx = z.x - bennyState.x;
      const dy = z.y - bennyState.y;
      const dist = Math.hypot(dx, dy);
      if (dist < nearest) {
        nearest = dist;
        targetIndex = idx;
      }
    });
    if (targetIndex === -1 || nearest > 70) return false;
    const target = miniZombies[targetIndex];
    benny.classList.add('dogko');
    target.el.classList.add('dogko');
    setTimeout(() => {
      target.el.classList.add('dogko-fly');
      setTimeout(() => {
        target.el.remove();
        miniZombies.splice(targetIndex, 1);
      }, 420);
    }, 220);
    setTimeout(() => {
      if (benny) benny.classList.remove('dogko');
    }, 520);
    return true;
  }

  function tryNurseCart() {
    if (!benny) return false;
    if (!isTierUnlocked(7) || getActiveTier() !== 7) return false;
    const dirX = lastAim.x || 1;
    const dirY = lastAim.y || 0;
    const len = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / len;
    const ny = dirY / len;
    const baseX = bennyState.x + 10;
    const baseY = bennyState.y + 18;
    const el = document.createElement('div');
    el.className = 'nurse-cart';
    el.style.left = `${baseX}px`;
    el.style.top = `${baseY}px`;
    gameArea.appendChild(el);
    miniShots.push({
      el,
      x: baseX,
      y: baseY,
      vx: nx * 6.2,
      vy: ny * 3.8,
      cart: true,
      w: 120,
      h: 54,
      lifeMs: 0,
      maxLifeMs: 1400
    });
    return true;
  }

  function getMiniZombieScale() {
    if (!isMobileLayout()) return 1;
    const width = window.innerWidth || 0;
    if (width <= 520) return 1.5;
    return 1.8;
  }

  function updateMiniGame(deltaMs) {
    const bounds = getPlayBounds();
    const baseW = 64;
    const baseH = 90;
    const scale = getMiniZombieScale();
    const zW = baseW * scale;
    const zH = baseH * scale;
    const speed = 0.18 * deltaMs;
    const activeTier = getActiveTier();
    const targetLockActive = activeTier === 3 && isTierUnlocked(3);
    if (benny) {
      benny.classList.toggle('wizard', activeTier === 5 && isTierUnlocked(5));
      benny.classList.toggle('nuclear', activeTier === 6 && isTierUnlocked(6));
    }
    if (pressedKeys.has('ArrowLeft')) { bennyState.x -= speed; lastAim = { x: -1, y: 0 }; }
    if (pressedKeys.has('ArrowRight')) { bennyState.x += speed; lastAim = { x: 1, y: 0 }; }
    if (pressedKeys.has('ArrowUp')) { bennyState.y -= speed; lastAim = { x: 0, y: -1 }; }
    if (pressedKeys.has('ArrowDown')) { bennyState.y += speed; lastAim = { x: 0, y: 1 }; }
    if (isMobileLayout() && joystickActive) {
      bennyState.x += joystickVector.x * speed;
      bennyState.y += joystickVector.y * speed;
      if (Math.abs(joystickVector.x) > 0.1 || Math.abs(joystickVector.y) > 0.1) {
        lastAim = { x: joystickVector.x, y: joystickVector.y };
      }
    }
    bennyState.x = clamp(bennyState.x, bounds.minX, bounds.maxX);
    bennyState.y = clamp(bennyState.y, bounds.minY, bounds.maxY);
    if (benny) {
      benny.style.left = `${bennyState.x}px`;
      benny.style.top = `${bennyState.y}px`;
    }

    const now = performance.now();
    miniZombies.forEach((z) => {
      if (now >= z.nextShieldToggle) {
        z.shieldActive = !z.shieldActive;
        z.nextShieldToggle = now + (z.shieldActive ? z.shieldOnMs : z.shieldOffMs);
        z.el.classList.toggle('shielded', z.shieldActive);
      }
      z.w = zW;
      z.h = zH;
      z.el.style.setProperty('--mini-scale', String(scale));
      const dx = z.x - bennyState.x;
      const dy = z.y - bennyState.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      let fleeX = (dx / dist) * z.speed * deltaMs * 0.085;
      let fleeY = (dy / dist) * z.speed * deltaMs * 0.085;
      let dodgeX = 0;
      let dodgeY = 0;
      let nearestShotDist = Infinity;
      let nearestShotVec = null;
      miniShots.forEach((s) => {
        const sx = s.x || 0;
        const sy = s.y || 0;
        const sdx = z.x - sx;
        const sdy = z.y - sy;
        const sdist = Math.hypot(sdx, sdy);
        if (sdist < nearestShotDist) {
          nearestShotDist = sdist;
          nearestShotVec = { dx: sdx, dy: sdy, dist: Math.max(1, sdist) };
        }
      });
      if (nearestShotVec && nearestShotDist < 220) {
        const side = (z.id % 2 === 0) ? 1 : -1;
        const perpX = (-nearestShotVec.dy / nearestShotVec.dist) * side;
        const perpY = (nearestShotVec.dx / nearestShotVec.dist) * side;
        const dodgeBoost = 0.12;
        dodgeX = perpX * z.speed * deltaMs * dodgeBoost;
        dodgeY = perpY * z.speed * deltaMs * dodgeBoost;
      }
      if (targetLockActive) {
        if (nearestShotVec && nearestShotDist < 200) {
          const runBoost = 0.11;
          fleeX += (nearestShotVec.dx / nearestShotVec.dist) * z.speed * deltaMs * runBoost;
          fleeY += (nearestShotVec.dy / nearestShotVec.dist) * z.speed * deltaMs * runBoost;
        }
      }
      z.x = clamp(z.x + fleeX + dodgeX, bounds.minX, bounds.maxX - zW);
      z.y = clamp(z.y + fleeY + dodgeY, bounds.minY, bounds.maxY - zH);
      z.el.style.left = `${z.x}px`;
      z.el.style.top = `${z.y}px`;
    });

    miniShots.forEach((s) => {
      const step = deltaMs / 16;
      if (s.cart) {
        s.lifeMs += deltaMs;
        s.x += s.vx * step;
        s.y += s.vy * step;
        s.el.style.left = `${s.x}px`;
        s.el.style.top = `${s.y}px`;
        if (s.lifeMs >= s.maxLifeMs) {
          s.done = true;
        }
        return;
      }
      if (s.boomerang) {
        s.lifeMs += deltaMs;
        if (s.lifeMs >= s.maxLifeMs) {
          s.done = true;
        }
        if (!s.returning && s.lifeMs >= s.returnAfterMs) {
          s.returning = true;
        }
        if (s.returning) {
          const targetX = bennyState.x + 10;
          const targetY = bennyState.y + 8;
          const dx = targetX - s.x;
          const dy = targetY - s.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const steer = 0.24 * step;
          s.vx += (dx / dist) * steer;
          s.vy += (dy / dist) * steer;
          const maxSpeed = 6.4;
          const speedNow = Math.hypot(s.vx, s.vy);
          if (speedNow > maxSpeed) {
            s.vx = (s.vx / speedNow) * maxSpeed;
            s.vy = (s.vy / speedNow) * maxSpeed;
          }
          if (dist < 18) {
            s.done = true;
          }
        }
        s.x += s.vx * step;
        s.y += s.vy * step;
        s.el.style.left = `${s.x}px`;
        s.el.style.top = `${s.y}px`;
        s.el.style.transform = `rotate(${s.lifeMs * s.spin * 0.6}deg)`;
        return;
      }
      if (s.homing) {
        let target = null;
        if (s.targetId) {
          target = miniZombies.find(z => z.id === s.targetId) || null;
        }
        if (!target && miniZombies.length) {
          let nearest = null;
          let nearestDist = Infinity;
          miniZombies.forEach((z) => {
            const dx = z.x - s.x;
            const dy = z.y - s.y;
            const dist = Math.hypot(dx, dy);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearest = z;
            }
          });
          if (nearest) {
            target = nearest;
            s.targetId = nearest.id;
          }
        }
        if (target) {
          const dx = target.x - s.x;
          const dy = target.y - s.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const steer = 0.34 * step;
          s.vx += (dx / dist) * steer;
          s.vy += (dy / dist) * steer;
          const maxSpeed = 6.8;
          const speedNow = Math.hypot(s.vx, s.vy);
          if (speedNow > maxSpeed) {
            s.vx = (s.vx / speedNow) * maxSpeed;
            s.vy = (s.vy / speedNow) * maxSpeed;
          }
        }
      }
      s.x += s.vx * step;
      s.y += s.vy * step;
      s.el.style.left = `${s.x}px`;
      s.el.style.top = `${s.y}px`;
    });

    const remainingShots = [];
    miniShots.forEach((s) => {
      if (s.done) {
        s.el.remove();
        return;
      }
      if (s.cart) {
        let hit = false;
        for (let i = miniZombies.length - 1; i >= 0; i--) {
          const z = miniZombies[i];
          const zw = z.w || zW;
          const zh = z.h || zH;
          const withinX = s.x + (s.w || 0) >= z.x && s.x <= z.x + zw;
          const withinY = s.y + (s.h || 0) >= z.y && s.y <= z.y + zh;
          if (withinX && withinY) {
            z.el.remove();
            miniZombies.splice(i, 1);
            hit = true;
          }
        }
        const inBounds = s.x <= bounds.maxX + 80 && s.y <= bounds.maxY + 80
          && s.x + (s.w || 0) >= bounds.minX - 80 && s.y + (s.h || 0) >= bounds.minY - 80;
        if (!inBounds) s.done = true;
        if (!s.done) remainingShots.push(s);
        return;
      }
      let hit = false;
      let removeShot = false;
      for (let i = miniZombies.length - 1; i >= 0; i--) {
        const z = miniZombies[i];
        const zw = z.w || zW;
        const zh = z.h || zH;
        const withinX = s.x >= z.x && s.x <= z.x + zw;
        const withinY = s.y >= z.y && s.y <= z.y + zh;
        if (withinX && withinY) {
          if (z.shieldActive) {
            s.vx = -s.vx * 0.9;
            s.vy = -s.vy * 0.9;
            s.repels = (s.repels || 0) + 1;
            s.el.classList.add('repelled');
            if (s.boomerang) s.returning = true;
            statusEl.textContent = 'Shielded! Wait for the glow to drop.';
            hit = true;
            if (!s.boomerang && s.repels >= 1) removeShot = true;
            break;
          }
          if (z.armor > 0) {
            z.armor -= 1;
            z.el.classList.add('armor-hit');
            setTimeout(() => z.el.classList.remove('armor-hit'), 180);
            if (z.armor <= 0) z.el.classList.remove('armored');
            hit = true;
            if (s.boomerang) s.returning = true;
            if (!s.boomerang) removeShot = true;
            break;
          }
          z.el.remove();
          miniZombies.splice(i, 1);
          hit = true;
          if (s.boomerang) s.returning = true;
          if (!s.boomerang) removeShot = true;
          break;
        }
      }
      const inBounds = s.x >= bounds.minX - 20 && s.x <= bounds.maxX + 20
        && s.y >= bounds.minY - 20 && s.y <= bounds.maxY + 20;
      if (s.boomerang && !s.returning && !inBounds) {
        s.returning = true;
      }
      if (removeShot) {
        s.el.remove();
        return;
      }
      if (s.boomerang) {
        if (s.done) {
          s.el.remove();
          return;
        }
        remainingShots.push(s);
        return;
      }
      if (!hit && inBounds) {
        remainingShots.push(s);
        return;
      }
      s.el.remove();
    });
    miniShots = remainingShots;

    if (miniZombies.length === 0) {
      endMiniGame();
    }
  }

  function miniGameLoop(timestamp) {
    if (!miniGameActive) return;
    if (!lastMiniTick) lastMiniTick = timestamp;
    const delta = Math.min(40, timestamp - lastMiniTick);
    lastMiniTick = timestamp;
    updateMiniGame(delta);
    miniGameFrame = requestAnimationFrame(miniGameLoop);
  }

  function startMiniGame(levelName) {
    if (!gameArea) return;
    miniGameActive = true;
    roundActive = false;
    clearRoundTimers();
    clearLevelTimer();
    if (timerEl) timerEl.classList.remove('timer-urgent');
    statusEl.textContent = 'Bonus round! Out-smart the zombies — wait for shields to drop.';
    clearMiniGame();
    ensureBenny();
    undockBenny();
    setMobileControlsActive(true);
    spawnMiniZombies(levelName);
    const endAt = performance.now() + 180000;
    if (timerEl) timerEl.textContent = 'Mini: 180s';
    miniGameCountdown = setInterval(() => {
      if (!miniGameActive) return;
      const remaining = endAt - performance.now();
      if (timerEl) timerEl.textContent = `Mini: ${Math.max(0, Math.ceil(remaining / 1000))}s`;
      if (remaining <= 0) {
        clearMiniGame();
      }
    }, 200);
    miniGameTimeout = setTimeout(() => {
      if (!miniGameActive) return;
      statusEl.textContent = 'Mini game time up!';
      endMiniGame();
    }, 180000);
    miniGameFrame = requestAnimationFrame(miniGameLoop);
  }

  function normalizeKey(e) {
    const code = e.code || e.key || '';
    if (code === 'Space' || code === 'Spacebar' || code === ' ') return 'Space';
    if (code === 'KeyW' || code === 'w') return 'ArrowUp';
    if (code === 'KeyA' || code === 'a') return 'ArrowLeft';
    if (code === 'KeyS' || code === 's') return 'ArrowDown';
    if (code === 'KeyD' || code === 'd') return 'ArrowRight';
    if (code.startsWith('Arrow')) return code;
    return '';
  }

  function endMiniGame() {
    miniGameActive = false;
    clearMiniGame();
    setMobileControlsActive(false);
    statusEl.textContent = 'Benny wakes up from a wild dream...';
    clearNextRoundTimeout();
    nextRoundTimeout = setTimeout(() => {
      if (!running) return;
      startRound(currentLevel);
    }, 400);
  }

  function startRound(levelName) {
    clearRoundTimers();
    clearNextRoundTimeout();
    if (!running || miniGameActive || levelExpired || roundActive) return;
    const ops = levelOperatorMap[levelName] || engine.config.operators;
    const prevOps = engine.config.operators;
    engine.config.operators = ops;
    try {
      const problem = engine.generate(levelName);
      engine.config.operators = prevOps;
      const displayExpr = problem.expr || `${problem.a} ${problem.op} ${problem.b}`;
      mathProblemEl.textContent = `${displayExpr} = ?`;
      ensureBenny();

      roundToken += 1;
      timerLevelName = levelName;
      problemStartAt = performance.now();
      problemSecondsLeft = Math.ceil(PROBLEM_TIME_MS / 1000);
      problemTimeRemaining = problemSecondsLeft * 1000;
      updateTimerDisplay();
      roundActive = true;
      // Safely start timer - may not be available if scripts load out of order
      if (window.mathPupTimer && typeof window.mathPupTimer.startRound === 'function') {
        window.mathPupTimer.startRound(levelName);
      }
      typedBuffer = '';
      typedContainer.textContent = '';
      statusEl.textContent = 'Answer the problem!';
      setHint('');
    } catch (err) {
      console.error('Problem generation error', err);
      engine.config.operators = prevOps;
      statusEl.textContent = 'Error generating problem. Try again.';
    }
  }

  function handleAnswer(answerStr, levelName) {
    if (!roundActive) return;
    roundActive = false;
    clearRoundTimers();
    clearNextRoundTimeout();
    // Safely handle answer - may not be available if scripts load out of order
    if (window.mathPupTimer && typeof window.mathPupTimer.handleAnswer === 'function') {
      window.mathPupTimer.handleAnswer();
    }
    updateTimerDisplay();
    if (!engine.currentProblem) {
      statusEl.textContent = 'No active problem. Press Start.';
      return;
    }
    const activeProblem = engine.currentProblem;
    const elapsedMs = problemStartAt ? performance.now() - problemStartAt : PROBLEM_TIME_MS;
    const numericAnswer = Number(answerStr);
    const res = engine.answer(numericAnswer);
    recordProblemTiming(levelName, activeProblem, elapsedMs, res.correct ? 'correct' : 'incorrect');
    if (res.correct) {
      score += res.pointsEarned;
      statusEl.textContent = `Correct! +${res.pointsEarned}`;
      setHint('');
      pupStreak = Math.min(pupStreak + 1, 999);
    } else {
      statusEl.textContent = 'Incorrect';
      const expected = Number.isFinite(activeProblem.answer)
        ? activeProblem.answer
        : computeAnswer(activeProblem.expr || `${activeProblem.a}${activeProblem.op}${activeProblem.b}`);
      const hint = buildHint(activeProblem);
      setHint(`${hint} Correct answer: ${formatAnswer(expected)}.`);
      pupStreak = 0;
    }

    scoreEl.textContent = 'Score: ' + score;
    updateBennyUnlocks(levelName);
    updateHighScoreIfNeeded(levelName);

    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathpup');
    stats.totalAttempted += 1;
    gameStats.attempted += 1;
    if (res.correct) {
      stats.totalCorrect += 1;
      gameStats.correct += 1;
      stats.totalPoints += res.pointsEarned;
      gameStats.points += res.pointsEarned;
    }
    stats.pupStreakRecord = Math.max(stats.pupStreakRecord, pupStreak);
    gameStats.streakRecord = Math.max(gameStats.streakRecord, pupStreak);
    gameStats.bestScore = Math.max(gameStats.bestScore, score);
    if (res.levelJustCompleted) {
      if (!stats.levelsCompleted.includes(levelName)) {
        stats.levelsCompleted.push(levelName);
      }
      if (!gameStats.levelsCompleted.includes(levelName)) {
        gameStats.levelsCompleted.push(levelName);
      }
    }
    saveProfileStats(stats);

    if (res.levelJustCompleted) {
      statusEl.textContent = `Level ${levelName} completed!`;
      if (engine.isMathanomicalUnlocked()) {
        statusEl.textContent += ' Mathanomical unlocked!';
      }
      const nextLevel = getNextLevel(levelName);
      if (nextLevel) {
        currentLevel = nextLevel;
        levelSelect.value = nextLevel;
        loadHighScore(nextLevel);
        renderBennyPalette(nextLevel);
        loadBennyColor(nextLevel);
        statusEl.textContent += ` Next up: ${nextLevel}.`;
      }
      if (levelExpired || levelTimeRemaining <= 0) {
        statusEl.textContent += ' Level time expired. No mini game.';
      } else {
        startMiniGame(levelName);
      }
      return;
    }

    clearNextRoundTimeout();
    nextRoundTimeout = setTimeout(() => {
      if (!running) return;
      clearRoundTimers();
      startRound(levelName);
    }, 4000);
  }

  keydownHandler = (e) => {
    // Don't capture keys when typing in input fields
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return; // Let input fields handle their own input
    }
    
    if (miniGameActive) {
      const key = normalizeKey(e);
      if (!key) return;
      pressedKeys.add(key);
      if (key === 'Space') {
        const usedLightsaber = tryLightsaber();
        if (!usedLightsaber) {
          const usedNurse = tryNurseCart();
          if (usedNurse) {
            // nurse cart handles clearing
          } else {
            const usedKo = tryDogKO();
            if (!usedKo) shootBenny();
          }
        }
      }
      e.preventDefault();
      return;
    }
    if (!running || !roundActive) return;
    if (e.key === 'Backspace') {
      typedBuffer = typedBuffer.slice(0, -1);
      typedContainer.textContent = typedBuffer;
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      if (typedBuffer.length > 0) {
        handleAnswer(typedBuffer, currentLevel);
        typedBuffer = '';
        typedContainer.textContent = '';
      }
      e.preventDefault();
      return;
    }
    if (/^[0-9\-]$/.test(e.key)) {
      typedBuffer += e.key;
      typedContainer.textContent = typedBuffer;
      e.preventDefault();
    }
  };
  window.addEventListener('keydown', keydownHandler);
  keyupHandler = (e) => {
    if (!miniGameActive) return;
    const key = normalizeKey(e);
    if (!key) return;
    pressedKeys.delete(key);
    e.preventDefault();
  };
  window.addEventListener('keyup', keyupHandler);
  window.addEventListener('resize', () => {
    if (miniGameActive) {
      undockBenny();
      return;
    }
    dockBennyIfNeeded();
  });

  function setMobileControlsActive(active) {
    if (!mobileControls) return;
    if (active && isMobileLayout()) {
      mobileControls.classList.add('active');
    } else {
      mobileControls.classList.remove('active');
    }
  }

  function resetJoystick() {
    joystickActive = false;
    joystickVector = { x: 0, y: 0 };
    if (mobileStick) mobileStick.style.transform = 'translate(-50%, -50%)';
  }

  function handleJoystickMove(clientX, clientY) {
    const dx = clientX - joystickCenter.x;
    const dy = clientY - joystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const ratio = dist > 0 ? Math.min(1, joystickRadius / dist) : 0;
    const clampedX = dx * ratio;
    const clampedY = dy * ratio;
    joystickVector = {
      x: clampedX / joystickRadius,
      y: clampedY / joystickRadius
    };
    if (mobileStick) {
      mobileStick.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
    }
  }

  if (mobileJoystick) {
    mobileJoystick.addEventListener('touchstart', (e) => {
      if (!miniGameActive) return;
      const touch = e.touches[0];
      const rect = mobileJoystick.getBoundingClientRect();
      joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      joystickActive = true;
      handleJoystickMove(touch.clientX, touch.clientY);
      e.preventDefault();
    }, { passive: false });

    mobileJoystick.addEventListener('touchmove', (e) => {
      if (!miniGameActive || !joystickActive) return;
      const touch = e.touches[0];
      handleJoystickMove(touch.clientX, touch.clientY);
      e.preventDefault();
    }, { passive: false });

    mobileJoystick.addEventListener('touchend', () => {
      resetJoystick();
    });
    mobileJoystick.addEventListener('touchcancel', () => {
      resetJoystick();
    });
  }

  if (mobileShoot) {
    const shootAction = () => {
      if (!miniGameActive) return;
      const usedPlasma = tryLightsaber();
      if (usedPlasma) return;
      const usedNurse = tryNurseCart();
      if (usedNurse) return;
      const usedKo = tryDogKO();
      if (!usedKo) shootBenny();
    };
    mobileShoot.addEventListener('click', shootAction);
    mobileShoot.addEventListener('touchstart', (e) => {
      shootAction();
      e.preventDefault();
    }, { passive: false });
    mobileShoot.addEventListener('pointerdown', (e) => {
      shootAction();
      e.preventDefault();
    });
  }

  function submitMobileAnswer() {
    if (!running || !roundActive || miniGameActive || !mobileAnswer) return;
    const value = mobileAnswer.value.trim();
    if (!value) return;
    handleAnswer(value, currentLevel);
    mobileAnswer.value = '';
  }

  if (mobileAnswerBtn) {
    mobileAnswerBtn.addEventListener('click', submitMobileAnswer);
  }
  if (mobileAnswer) {
    mobileAnswer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitMobileAnswer();
        e.preventDefault();
      }
    });
    mobileAnswer.addEventListener('input', () => {
      mobileAnswer.value = mobileAnswer.value.replace(/[^0-9-]/g, '');
    });
  }

  // Number keyboard functionality
  const keyboardDisplay = document.getElementById('keyboardDisplay');
  const keyboardButtons = document.querySelectorAll('#numberKeyboard .keyboard-grid button');
  let keyboardBuffer = '';

  function updateKeyboardDisplay() {
    if (keyboardDisplay) {
      keyboardDisplay.value = keyboardBuffer || '0';
    }
  }

  keyboardButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.id === 'keyDelete') {
        keyboardBuffer = keyboardBuffer.slice(0, -1);
      } else if (btn.id === 'keySubmit') {
        if (keyboardBuffer && running && roundActive && !miniGameActive) {
          handleAnswer(keyboardBuffer, currentLevel);
          keyboardBuffer = '';
        }
      } else {
        const key = btn.getAttribute('data-key');
        if (key) {
          keyboardBuffer += key;
          if (keyboardBuffer.length > 12) {
            keyboardBuffer = keyboardBuffer.slice(0, 12);
          }
        }
      }
      updateKeyboardDisplay();
    });
  });

  if (musicToggle) {
    musicToggle.checked = musicEnabled;
    musicToggleHandler = () => applyMusicEnabled(musicToggle.checked);
    musicToggleClickHandler = (e) => {
      if (!musicEnabled) return;
      e.preventDefault();
      handleMusicTap();
    };
    musicToggle.addEventListener('change', musicToggleHandler);
    musicToggle.addEventListener('click', musicToggleClickHandler);
  }
  applyMusicEnabled(musicEnabled);

  startBtn.addEventListener('click', () => {
    if (running) return;
    currentLevel = levelSelect.value;
    if (currentLevel === 'Mathanomical' && !engine.isMathanomicalUnlocked()) {
      statusEl.textContent = 'Mathanomical is locked. Complete other levels first.';
      return;
    }
    running = true;
    levelExpired = false;
    score = 0;
    pupStreak = 0;
    scoreEl.textContent = 'Score: ' + score;
    loadHighScore(currentLevel);
    statusEl.textContent = 'Game started';
    updateBennyUnlocks(currentLevel);
    startLevelTimer(currentLevel);
    startRound(currentLevel);
    pauseBtn.disabled = false;
    playBackgroundMusic();
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathpup');
    gameStats.gamesPlayed += 1;
    saveProfileStats(stats);
  });

  pauseBtn.addEventListener('click', () => {
    if (!running) return;
    running = false;
    roundActive = false;
    clearRoundTimers();
    clearNextRoundTimeout();
    clearLevelTimer();
    statusEl.textContent = 'Paused';
    pauseBtn.disabled = true;
    pauseBackgroundMusic();
  });

  levelSelect.addEventListener('change', () => {
    currentLevel = levelSelect.value;
    if (currentLevel === 'Mathanomical' && !engine.isMathanomicalUnlocked()) {
      statusEl.textContent = 'Mathanomical locked until other 8 levels are completed.';
    } else {
      statusEl.textContent = `Selected ${currentLevel}`;
    }
    loadHighScore(currentLevel);
    renderBennyPalette(currentLevel);
    loadBennyColor(currentLevel);
  });

  function gameOver(levelName) {
    running = false;
    roundActive = false;
    clearRoundTimers();
    clearLevelTimer();
    pauseBackgroundMusic();
    statusEl.textContent = 'Game Over';
    updateHighScoreIfNeeded(levelName || currentLevel);
    setTimeout(() => alert('Game Over! Your high score has been saved.'), 200);
  }

  scoreEl.textContent = 'Score: 0';
  mathProblemEl.textContent = 'Problem: --';
  loadHighScore(currentLevel || levelSelect.value);
  renderBennyPalette(currentLevel || levelSelect.value);
  loadBennyColor(currentLevel || levelSelect.value);

  window.MathPup = { engine };
  window.__MathPupCleanup = () => {
    // Remove event listeners
    if (keydownHandler) window.removeEventListener('keydown', keydownHandler);
    if (keyupHandler) window.removeEventListener('keyup', keyupHandler);
    
    // Stop game state
    running = false;
    roundActive = false;
    clearRoundTimers();
    clearLevelTimer();
    clearMiniGame();
    clearNextRoundTimeout();
    pauseBackgroundMusic();
    if (musicPopupTimer) {
      clearTimeout(musicPopupTimer);
      musicPopupTimer = null;
    }
    if (musicNowPlayingEl) musicNowPlayingEl.classList.remove('show');
    resetMusicTapSequence();
    resetJoystick();
    setMobileControlsActive(false);
    if (musicToggle && musicToggleHandler) {
      musicToggle.removeEventListener('change', musicToggleHandler);
      musicToggleHandler = null;
    }
    if (musicToggle && musicToggleClickHandler) {
      musicToggle.removeEventListener('click', musicToggleClickHandler);
      musicToggleClickHandler = null;
    }
    
    // Remove game elements from DOM
    const existingBenny = document.querySelector('#game-area .benny');
    if (existingBenny) {
      existingBenny.remove();
    }
    
    // Remove any zombie or shot elements
    document.querySelectorAll('#game-area .zombie, #game-area .benny-shot').forEach(el => el.remove());
    
    // Reset typed answer container
    const typedContainer = document.getElementById('typedAnswer');
    if (typedContainer) {
      typedContainer.textContent = '';
    }
    
    // Reset UI elements to initial state
    if (scoreEl) scoreEl.textContent = 'Score: 0';
    if (mathProblemEl) mathProblemEl.textContent = 'Problem: --';
    if (statusEl) statusEl.textContent = 'Press Start to begin.';
    if (timerEl) timerEl.textContent = 'Time: —';
    if (pauseBtn) pauseBtn.disabled = true;
    
    // Clear Benny reference and state
    benny = null;
    bennyState.x = 0;
    bennyState.y = 0;
    activeBennyColor = null;
    
    // Reset keyboard buffer
    keyboardBuffer = '';
    typedBuffer = '';
    
    // Reset timer module for fresh state on re-entry
    if (window.mathPupTimer && typeof window.mathPupTimer.resetTimer === 'function') {
      window.mathPupTimer.resetTimer();
    }
    
    // Clear global references
    window.MathPup = null;
  };
})();
/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
