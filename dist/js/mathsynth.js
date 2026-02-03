(() => {
  if (window.__MathSynthCleanup) window.__MathSynthCleanup();
  window.__MathSynthCleanup = null;

  const board = document.getElementById('mathSynthBoard');
  const startBtn = document.getElementById('startMathSynth');
  const resetBtn = document.getElementById('resetMathSynth');
  const levelSelect = document.getElementById('mathSynthLevel');
  const gridPreview = document.getElementById('mathSynthPreview');
  const scoreEl = document.getElementById('mathSynthScore');
  const timerEl = document.getElementById('mathSynthTimer');
  const bestEl = document.getElementById('mathSynthBest');
  const promptEl = document.getElementById('mathSynthPrompt');
  const feedbackEl = document.getElementById('mathSynthFeedback');
  const paletteEl = document.getElementById('mathSynthPalette');
  const colorPreview = document.getElementById('mathSynthColorPreview');
  const colorInfo = document.getElementById('mathSynthColorInfo');
  const equationsEl = document.getElementById('mathSynthEquations');
  const othersHost = document.getElementById('mathSynthOthers');

  if (!board || !startBtn) return;

  const bestKey = 'mathsynth-best';
  const unlockKey = 'mathsynth-unlocked';
  const colorKey = 'mathsynth-color';
  const schemes = buildColorSchemes(50);

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
      stats.games[gameId] = { points: 0, correct: 0, attempted: 0, bestScore: null, streakRecord: 0, gamesPlayed: 0, bestTime: null };
    }
    return stats.games[gameId];
  }

  function saveProfileStats(stats) {
    localStorage.setItem(profileStatsKey(), JSON.stringify(stats));
  }

  let rows = 6;
  let cols = 7;
  const cellSize = 52;
  let timerId = null;
  let timeLeft = 0;
  let othersInterval = null;
  let othersPhraseInterval = null;
  let othersTimerId = null;
  let othersMoveInterval = null;
  let othersActive = false;
  let othersDeadline = 0;
  let othersCorrect = 0;
  let othersIndex = 0;
  let othersEquation = null;
  let othersCard = null;
  let othersStatus = null;
  let othersTimerEl = null;
  let othersInput = null;
  let othersSubmit = null;
  let othersPhraseEl = null;
  let othersEquationEl = null;
  let othersFigure = null;
  let score = 0;
  let solved = 0;
  let total = 0;
  let running = false;
  let puzzle = [];

  let unlockedCount = clamp(parseInt(window.localStorage.getItem(unlockKey), 10) || 3, 1, schemes.length);
  let selectedIndex = clamp(parseInt(window.localStorage.getItem(colorKey), 10) || 0, 0, schemes.length - 1);
  if (selectedIndex >= unlockedCount) selectedIndex = unlockedCount - 1;

  const EQUATION_BANK = {
    easy: [
      { equation: 'x + 4 = 7', answer: 3, context: 'Retail pricing' },
      { equation: 'x + 12 = 20', answer: 8, context: 'Cooking portions' },
      { equation: 'x - 5 = 9', answer: 14, context: 'Construction measurement' },
      { equation: '2x = 18', answer: 9, context: 'Manufacturing batches' },
      { equation: 'x + 6 = 15', answer: 9, context: 'Classroom supplies' },
      { equation: '3x = 21', answer: 7, context: 'Sports drills' },
      { equation: 'x - 3 = 4', answer: 7, context: 'Gardening rows' },
      { equation: 'x + 9 = 16', answer: 7, context: 'Delivery stops' },
      { equation: '4x = 28', answer: 7, context: 'Music beats' },
      { equation: 'x + 2 = 11', answer: 9, context: 'Library checkouts' },
      { equation: 'x - 8 = 5', answer: 13, context: 'Travel miles' },
      { equation: '5x = 45', answer: 9, context: 'Catering trays' }
    ],
    medium: [
      { equation: '3x + 4 = 25', answer: 7, context: 'Carpentry cuts' },
      { equation: '5x - 10 = 35', answer: 9, context: 'Fitness reps' },
      { equation: '2x + 7 = 31', answer: 12, context: 'Marketing clicks' },
      { equation: '4x - 6 = 22', answer: 7, context: 'Engineering specs' },
      { equation: '6x + 3 = 45', answer: 7, context: 'Medical dosage' },
      { equation: '7x - 14 = 28', answer: 6, context: 'Shipping crates' },
      { equation: '9x - 18 = 36', answer: 6, context: 'Game scores' },
      { equation: '8x + 12 = 60', answer: 6, context: 'Factory output' },
      { equation: '12x - 24 = 72', answer: 8, context: 'Energy usage' },
      { equation: '10x + 15 = 95', answer: 8, context: 'Fashion orders' },
      { equation: '11x - 33 = 55', answer: 8, context: 'IT tickets' },
      { equation: '14x + 7 = 119', answer: 8, context: 'Inventory packs' }
    ],
    mathanomical: [
      { equation: '(3x + 6) / 3 = 12', answer: 10, context: 'Architecture scale' },
      { equation: '5(x - 4) = 35', answer: 11, context: 'Robotics timing' },
      { equation: '(4x - 8) / 2 = 10', answer: 7, context: 'Chemistry mix' },
      { equation: '2(x + 9) = 34', answer: 8, context: 'Film editing' },
      { equation: '(7x + 14) / 7 = 9', answer: 7, context: 'Aviation checks' },
      { equation: '6x - 3x = 24', answer: 8, context: 'Finance totals' },
      { equation: '(9x - 18) / 3 = 12', answer: 6, context: 'Music mixing' },
      { equation: '4(x + 2) - 6 = 22', answer: 5, context: 'Pharmacy counts' },
      { equation: '(8x + 4) / 4 = 11', answer: 5, context: 'Agriculture yield' },
      { equation: '3(x - 5) + 9 = 24', answer: 10, context: 'Construction crew' },
      { equation: '(12x - 6) / 3 = 22', answer: 6, context: 'Game design' },
      { equation: '2(x + 7) + 6 = 32', answer: 6, context: 'Space mission' }
    ]
  };

  const best = readBest();
  renderBest(best);
  applyColor(selectedIndex);
  renderPalette();
  updatePreview();
  buildGrid();

  startBtn.addEventListener('click', startGame);

  const resetGame = () => {
    stopTimer();
    running = false;
    score = 0;
    solved = 0;
    timeLeft = 0;
    scoreEl.textContent = '0';
    timerEl.textContent = '0';
    promptEl.textContent = 'Press Start to begin.';
    feedbackEl.textContent = '';
    buildGrid();
  };

  resetBtn.addEventListener('click', resetGame);

  if (levelSelect) {
    levelSelect.addEventListener('change', () => {
      const layout = getLevelLayout(levelSelect.value);
      rows = layout.rows;
      cols = layout.cols;
      if (running) {
        startGame();
      } else {
        buildGrid();
      }
    });
  }

  function startGame() {
    stopTimer();
    running = true;
    score = 0;
    solved = 0;
    scoreEl.textContent = '0';
    feedbackEl.textContent = '';
    const layout = getLevelLayout(levelSelect ? levelSelect.value : 'easy');
    rows = layout.rows;
    cols = layout.cols;
    buildGrid();
    timeLeft = calcTimeLimit(levelSelect ? levelSelect.value : 'easy');
    timerEl.textContent = `${timeLeft}`;
    promptEl.textContent = 'Solve all equations before the timer runs out.';
    // Disabled Others popups to prevent popup challenges
    // startOthersSpawner();
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathsynth');
    gameStats.gamesPlayed += 1;
    saveProfileStats(stats);
    timerId = window.setInterval(() => {
      timeLeft = Math.max(0, timeLeft - 1);
      timerEl.textContent = `${timeLeft}`;
      if (timeLeft === 0) {
        stopTimer();
        running = false;
        promptEl.textContent = 'Time is up! Press Start to try again.';
        stopOthersSpawner();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function buildGrid() {
    const level = levelSelect ? levelSelect.value : 'easy';
    const pool = shuffle(getEquationPool(level).slice());

    puzzle = [];
    solved = 0;
    total = 0;
    board.innerHTML = '';
    board.dataset.cols = `${cols}`;
    board.dataset.level = level;
    board.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    board.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    const blocked = generateBlockers(rows, cols);
    let poolIndex = 0;

    for (let i = 0; i < rows * cols; i += 1) {
      const cell = document.createElement('div');
      cell.className = 'ms-cell';
      cell.dataset.index = `${i}`;

      if (blocked[i]) {
        cell.classList.add('blocked');
        board.appendChild(cell);
        puzzle.push(null);
        continue;
      }

      const data = pool[poolIndex % pool.length];
      poolIndex += 1;
      total += 1;

      puzzle.push({ ...data, solved: false });

      const eq = document.createElement('div');
      eq.className = 'ms-equation';
      eq.textContent = data.equation;

      const input = document.createElement('input');
      input.className = 'ms-answer';
      input.inputMode = 'numeric';
      input.type = 'text';
      input.maxLength = 4;
      input.disabled = !running;

      // Removed focus event to prevent outline/highlighting
      // input.addEventListener('focus', () => {
      //   promptEl.textContent = `Context: ${data.context}`;
      //   feedbackEl.textContent = `Equation: ${data.equation}`;
      // });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          checkAnswer(cell, input);
        }
      });

      // Allow clicking directly on input to type, but don't auto-focus
      input.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      cell.appendChild(eq);
      cell.appendChild(input);
      const symbol = document.createElement('div');
      symbol.className = 'ms-symbol';
      cell.appendChild(symbol);
      board.appendChild(cell);
    }

    // Hide warm-up equations/clues
    // renderClues(pool, level);
  }

  function checkAnswer(cell, input) {
    const idx = Number(cell.dataset.index);
    const data = puzzle[idx];
    if (!data || data.solved || !running) return;
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;

    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathsynth');
    stats.totalAttempted += 1;
    gameStats.attempted += 1;

    if (value === data.answer) {
      data.solved = true;
      solved += 1;
      score -= 1;
      scoreEl.textContent = `${score}`;
      cell.classList.add('correct');
      cell.classList.add('solved');
      applySolvePattern(cell);
      input.disabled = true;
      input.value = `${data.answer}`;
      feedbackEl.textContent = 'Nice! Keep going.';
      unlockNextColor();
      stats.totalCorrect += 1;
      gameStats.correct += 1;
      stats.totalPoints += 1;
      gameStats.points += 1;
      if (solved === total) {
        finishGame();
      }
    } else {
      score += 1;
      scoreEl.textContent = `${score}`;
      cell.classList.add('wrong');
      feedbackEl.textContent = 'Not quite. Try again.';
      window.setTimeout(() => cell.classList.remove('wrong'), 220);
    }
    gameStats.bestScore = gameStats.bestScore === null ? score : Math.min(gameStats.bestScore, score);
    saveProfileStats(stats);
  }

  function finishGame() {
    stopTimer();
    stopOthersSpawner();
    running = false;
    promptEl.textContent = `Puzzle complete with ${timeLeft}s left.`;
    updateBest(score, timeLeft);
    revealSymbols();
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathsynth');
    gameStats.bestScore = gameStats.bestScore === null ? score : Math.min(gameStats.bestScore, score);
    gameStats.bestTime = Math.max(gameStats.bestTime || 0, timeLeft);
    saveProfileStats(stats);
  }

  function updateBest(newScore, newTime) {
    const current = readBest();
    if (!current || isBetter(newScore, newTime, current)) {
      const updated = { score: newScore, timeLeft: newTime };
      window.localStorage.setItem(bestKey, JSON.stringify(updated));
      renderBest(updated);
    }
  }

  function renderBest(bestValue) {
    if (!bestValue) {
      bestEl.textContent = '--';
      return;
    }
    bestEl.textContent = `${bestValue.score} (time ${bestValue.timeLeft}s)`;
  }

  function readBest() {
    const raw = window.localStorage.getItem(bestKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function isBetter(scoreValue, timeValue, bestValue) {
    if (scoreValue < bestValue.score) return true;
    if (scoreValue === bestValue.score && timeValue > bestValue.timeLeft) return true;
    return false;
  }

  function updatePreview() {
    if (gridPreview) gridPreview.textContent = `${cols}×${rows}`;
  }

  function renderClues(pool) {
    if (!equationsEl) return;
    const picks = shuffle(pool.slice()).slice(0, 3);
    equationsEl.innerHTML = '';
    picks.forEach((entry, idx) => {
      const span = document.createElement('span');
      span.textContent = entry.equation;
      equationsEl.appendChild(span);
    });
    if (picks.length < 3) {
      const fallback = document.createElement('span');
      fallback.textContent = 'x + 4 = 7';
      equationsEl.appendChild(fallback);
    }
  }

  function startOthersSpawner() {
    stopOthersSpawner();
    spawnOther();
    othersInterval = window.setInterval(() => {
      if (!othersActive) spawnOther();
    }, 100000);
  }

  function stopOthersSpawner() {
    if (othersInterval) {
      window.clearInterval(othersInterval);
      othersInterval = null;
    }
    if (othersPhraseInterval) {
      window.clearInterval(othersPhraseInterval);
      othersPhraseInterval = null;
    }
    if (othersTimerId) {
      window.clearInterval(othersTimerId);
      othersTimerId = null;
    }
    if (othersCard && othersCard.parentNode) {
      othersCard.parentNode.removeChild(othersCard);
    }
    othersCard = null;
    othersActive = false;
  }

  function spawnOther() {
    if (!othersHost || othersActive) return;
    othersActive = true;
    othersCorrect = 0;
    othersIndex = (othersIndex + 1) % 10;
    othersDeadline = performance.now() + getOthersTimeLimit(levelSelect ? levelSelect.value : 'easy') * 1000;

    const phrases = getOtherPhrases();
    const phrase = phrases[rand(0, phrases.length - 1)];
    const equation = pickOtherEquation(levelSelect ? levelSelect.value : 'easy');
    othersEquation = equation;

    othersCard = document.createElement('div');
    othersCard.className = 'others-card';
    const pos = randomOtherPosition();
    othersCard.dataset.x = `${pos.x}`;
    othersCard.dataset.y = `${pos.y}`;
    othersCard.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    othersFigure = document.createElement('div');
    othersFigure.className = 'others-figure';
    othersFigure.innerHTML = '<span class=\"hat\"></span><span class=\"head\"></span><span class=\"torso\"></span><span class=\"belt\"></span><span class=\"legs\"></span>';

    const content = document.createElement('div');
    content.className = 'others-content';

    const title = document.createElement('div');
    title.className = 'others-title';
    title.textContent = `The Others #${othersIndex + 1}`;

    othersPhraseEl = document.createElement('div');
    othersPhraseEl.className = 'others-phrase';
    othersPhraseEl.textContent = phrase;

    othersTimerEl = document.createElement('div');
    othersTimerEl.className = 'others-timer';
    othersTimerEl.textContent = formatOthersTimer();

    othersEquationEl = document.createElement('div');
    othersEquationEl.className = 'others-equation';
    othersEquationEl.textContent = equation.equation;

    othersInput = document.createElement('input');
    othersInput.className = 'others-input';
    othersInput.type = 'text';
    othersInput.inputMode = 'numeric';
    othersInput.placeholder = 'Type answer';

    othersSubmit = document.createElement('button');
    othersSubmit.className = 'others-submit';
    othersSubmit.type = 'button';
    othersSubmit.textContent = 'Submit';

    othersStatus = document.createElement('div');
    othersStatus.className = 'others-status';
    othersStatus.textContent = 'Answer 2 correctly to send them away.';

    othersSubmit.addEventListener('click', checkOtherAnswer);
    othersInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') checkOtherAnswer();
    });

    content.appendChild(title);
    content.appendChild(othersPhraseEl);
    content.appendChild(othersTimerEl);
    content.appendChild(othersEquationEl);
    content.appendChild(othersInput);
    content.appendChild(othersSubmit);
    content.appendChild(othersStatus);

    othersCard.appendChild(othersFigure);
    othersCard.appendChild(content);
    othersHost.appendChild(othersCard);

    if (othersPhraseInterval) window.clearInterval(othersPhraseInterval);
    othersPhraseInterval = window.setInterval(() => {
      const nextPhrase = phrases[rand(0, phrases.length - 1)];
      if (othersPhraseEl) othersPhraseEl.textContent = nextPhrase;
    }, 45000);

    if (othersTimerId) window.clearInterval(othersTimerId);
    othersTimerId = window.setInterval(() => {
      if (!othersActive) return;
      if (othersTimerEl) othersTimerEl.textContent = formatOthersTimer();
      if (performance.now() > othersDeadline) {
        othersStatus.textContent = 'They are still here. Try again!';
        resetOtherChallenge();
      }
    }, 1000);

    moveOther();
  }

  function checkOtherAnswer() {
    if (!othersActive || !othersEquation) return;
    const value = Number(othersInput.value);
    if (!Number.isFinite(value)) return;
    if (value === othersEquation.answer) {
      othersCorrect += 1;
      othersStatus.textContent = `Correct! ${othersCorrect}/2 answered.`;
      if (othersCorrect >= 2) {
        othersStatus.textContent = 'Nice! You sent them away.';
        removeOther();
        return;
      }
      othersEquation = pickOtherEquation(levelSelect ? levelSelect.value : 'easy');
      othersEquationEl.textContent = othersEquation.equation;
      othersInput.value = '';
    } else {
      othersStatus.textContent = 'Nope. Try again.';
    }
  }

  function resetOtherChallenge() {
    othersCorrect = 0;
    othersEquation = pickOtherEquation(levelSelect ? levelSelect.value : 'easy');
    othersEquationEl.textContent = othersEquation.equation;
    othersInput.value = '';
    othersDeadline = performance.now() + getOthersTimeLimit(levelSelect ? levelSelect.value : 'easy') * 1000;
  }

  function removeOther() {
    if (othersPhraseInterval) window.clearInterval(othersPhraseInterval);
    if (othersTimerId) window.clearInterval(othersTimerId);
    if (othersMoveInterval) window.clearInterval(othersMoveInterval);
    if (othersCard && othersCard.parentNode) othersCard.parentNode.removeChild(othersCard);
    othersCard = null;
    othersActive = false;
  }

  function randomOtherPosition() {
    const hostRect = othersHost.getBoundingClientRect();
    const cardRect = othersCard ? othersCard.getBoundingClientRect() : { width: 240, height: 140 };
    const maxX = Math.max(0, hostRect.width - cardRect.width - 10);
    const maxY = Math.max(0, hostRect.height - cardRect.height - 10);
    return {
      x: rand(10, Math.max(10, Math.floor(maxX))),
      y: rand(10, Math.max(10, Math.floor(maxY)))
    };
  }

  function moveOther() {
    if (!othersCard || !othersHost) return;
    const pos = randomOtherPosition();
    othersCard.dataset.x = `${pos.x}`;
    othersCard.dataset.y = `${pos.y}`;
    othersCard.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    if (othersMoveInterval) window.clearInterval(othersMoveInterval);
    othersMoveInterval = window.setInterval(() => {
      if (!othersActive) return;
      const next = randomOtherPosition();
      othersCard.dataset.x = `${next.x}`;
      othersCard.dataset.y = `${next.y}`;
      othersCard.style.transform = `translate(${next.x}px, ${next.y}px)`;
    }, 12000);
  }

  function getOthersTimeLimit(level) {
    if (level === 'medium') return 30;
    if (level === 'mathanomical') return 75;
    return 20;
  }

  function formatOthersTimer() {
    const seconds = Math.max(0, Math.ceil((othersDeadline - performance.now()) / 1000));
    return `Time left: ${seconds}s`;
  }

  function getOtherPhrases() {
    return [
      'Lease A Center is Mr.Boooiiiii here?',
      'Mr. Boooiiiii i want to discuss your cars extended warranty',
      'Mr. Boooiiii we know your home we see your dog outside-',
      'Hey that dog just ate your phone bill Mr!!!',
      'Hey your dog is in Andreas flowers again!!!!',
      'Hey your dog is on Richards Bears Jersey!',
      'I Represent all that is corny. We want our game back',
      'Nick here from Porch dash we need to talk about your  car no---- I mean i need to know where you want me to leave your order.',
      'Mr. Boooiiii i dont have enough craysons to explain why im here',
      'We think we can get the banks approval if you can get your dog to cosign'
    ];
  }

  function pickOtherEquation(level) {
    const pool = getEquationPool(level);
    return pool[rand(0, pool.length - 1)];
  }

  function generateBlockers(r, c) {
    const totalCells = r * c;
    const density = totalCells > 400 ? 0.2 : totalCells > 200 ? 0.16 : 0.12;
    const blocked = new Array(totalCells).fill(false);

    for (let i = 0; i < totalCells; i += 1) {
      if (Math.random() < density) blocked[i] = true;
    }

    for (let row = 0; row < r; row += 1) {
      let rowBlocked = true;
      for (let col = 0; col < c; col += 1) {
        if (!blocked[row * c + col]) {
          rowBlocked = false;
          break;
        }
      }
      if (rowBlocked) {
        blocked[row * c + rand(0, c - 1)] = false;
      }
    }

    for (let col = 0; col < c; col += 1) {
      let colBlocked = true;
      for (let row = 0; row < r; row += 1) {
        if (!blocked[row * c + col]) {
          colBlocked = false;
          break;
        }
      }
      if (colBlocked) {
        blocked[rand(0, r - 1) * c + col] = false;
      }
    }

    return blocked;
  }

  function applySolvePattern(cell) {
    const idx = Number(cell.dataset.index);
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    if ((row + col) % 2 === 0) {
      cell.classList.add('pattern-dark');
    } else {
      cell.classList.add('pattern-light');
    }
  }

  function revealSymbols() {
    const symbols = ['+', '-', '*', '/', '=', '^', '%', 'x'];
    const cells = board.querySelectorAll('.ms-cell.solved');
    cells.forEach((cell, i) => {
      const symbol = cell.querySelector('.ms-symbol');
      if (!symbol) return;
      symbol.textContent = symbols[i % symbols.length];
      cell.classList.add('reveal');
    });
  }

  function getLevelLayout(level) {
    if (level === 'medium') return { cols: 8, rows: 6 };
    if (level === 'mathanomical') return { cols: 10, rows: 6 };
    return { cols: 7, rows: 6 };
  }

  function getEquationPool(level) {
    return EQUATION_BANK[level] || EQUATION_BANK.easy;
  }

  function unlockNextColor() {
    if (unlockedCount >= schemes.length) return;
    unlockedCount += 1;
    window.localStorage.setItem(unlockKey, `${unlockedCount}`);
    updateColorInfo();
    renderPalette();
  }

  function renderPalette() {
    if (!paletteEl) return;
    paletteEl.innerHTML = '';
    schemes.forEach((scheme, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.style.background = `linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary})`;
      button.disabled = index >= unlockedCount;
      if (index === selectedIndex) button.classList.add('selected');
      if (button.disabled) button.classList.add('locked');

      button.addEventListener('click', () => {
        if (index >= unlockedCount) return;
        selectedIndex = index;
        window.localStorage.setItem(colorKey, `${selectedIndex}`);
        applyColor(selectedIndex);
        renderPalette();
      });

      paletteEl.appendChild(button);
    });

    updateColorInfo();
  }

  function applyColor(index) {
    const scheme = schemes[index] || schemes[0];
    board.style.setProperty('--ms-accent', scheme.primary);
    board.style.setProperty('--ms-accent-2', scheme.secondary);
    if (colorPreview) {
      colorPreview.style.background = `linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary})`;
    }
  }

  function updateColorInfo() {
    if (!colorInfo) return;
    colorInfo.textContent = `${unlockedCount}`;
  }

  function buildColorSchemes(count) {
    const list = [];
    for (let i = 0; i < count; i += 1) {
      const hue = Math.round((i / count) * 360);
      const primary = `hsl(${hue}, 95%, 60%)`;
      const secondary = `hsl(${(hue + 30) % 360}, 95%, 52%)`;
      list.push({ primary, secondary });
    }
    return list;
  }

  function calcTimeLimit(level) {
    if (level === 'medium') return 1600;
    if (level === 'mathanomical') return 2000;
    return 1000;
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  window.__MathSynthCleanup = () => {
    stopTimer();
    stopOthersSpawner();
    window.__MathSynthCleanup = null;
  };

  window.MathSynth = {
    start: startGame,
    reset: resetGame,
    applyGrid: () => {}
  };
})();
