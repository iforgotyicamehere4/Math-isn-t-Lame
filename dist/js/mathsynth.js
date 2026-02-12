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
  
  // Answer section elements
  const answerSection = document.getElementById('mathSynthAnswerSection');
  const problemValue = document.getElementById('mathSynthProblemValue');
  const answerInput = document.getElementById('mathSynthAnswer');
  const answerSubmit = document.getElementById('mathSynthSubmit');
  
  // Mobile popup elements
  let mobilePopup = null;
  let mobilePopupProblem = null;
  let mobilePopupInput = null;
  let mobilePopupSubmit = null;
  let mobilePopupClose = null;

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
  let solvedEquations = [];

  // Arena mode (post-level FPS)
  let arenaActive = false;
  let arenaEl = null;
  let arenaControlsEl = null;
  let arenaJoystick = null;
  let arenaStick = null;
  let arenaShootBtn = null;
  let arenaJoystickActive = false;
  let arenaJoystickVector = { x: 0, y: 0 };
  let arenaJoystickCenter = { x: 0, y: 0 };
  const arenaJoystickRadius = 30;
  const arenaKeys = new Set();
  let arenaLastAim = { x: 1, y: 0 };
  let bennyEl = null;
  const bennyState = { x: 0, y: 0 };
  let bennyShots = [];
  let enemyShots = [];
  let enemies = [];
  let enemyQueue = [];
  let waveIndex = 0;
  let nextWaveAt = 0;
  let arenaAnimId = null;
  let arenaLastTick = 0;
  let squadCenter = { x: 0, y: 0 };
  let squadVel = { x: 0, y: 0 };
  let coverRects = [];
  let coverRefreshAt = 0;
  
  // Selected cell tracking
  let selectedCellIndex = null;
  let selectedCellElement = null;

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
    stopArena();
    score = 0;
    solved = 0;
    timeLeft = 0;
    scoreEl.textContent = '0';
    timerEl.textContent = '0';
    promptEl.textContent = 'Press Start to begin.';
    feedbackEl.textContent = '';
    hideAnswerSection();
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

  // Answer section event handlers
  function handleAnswerSubmit() {
    if (selectedCellIndex === null || !running) return;
    const cell = board.children[selectedCellIndex];
    if (cell) {
      checkAnswer(cell, answerInput.value);
    }
  }
  
  answerSubmit.addEventListener('click', handleAnswerSubmit);
  
  answerInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAnswerSubmit();
    }
  });

  // Mobile popup functions
  function createMobilePopup() {
    if (mobilePopup) return;
    
    mobilePopup = document.createElement('div');
    mobilePopup.className = 'mobile-answer-popup';
    mobilePopup.innerHTML = `
      <button class="popup-close">&times;</button>
      <div class="popup-content">
        <div class="popup-instruction">Solve each equation for x</div>
        <div class="popup-problem"></div>
        <input type="text" class="popup-input" inputmode="numeric" placeholder="Type answer" />
        <button class="popup-submit">Submit</button>
        <div class="popup-quote">
          "What's the next right choice?"
          <div class="popup-quote-author">- Mr. Boooiiii -</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(mobilePopup);
    
    mobilePopupProblem = mobilePopup.querySelector('.popup-problem');
    mobilePopupInput = mobilePopup.querySelector('.popup-input');
    mobilePopupSubmit = mobilePopup.querySelector('.popup-submit');
    mobilePopupClose = mobilePopup.querySelector('.popup-close');
    
    // Close button
    mobilePopupClose.addEventListener('click', hideMobilePopup);
    
    // Submit button
    mobilePopupSubmit.addEventListener('click', handleMobileSubmit);
    
    // Enter key in input
    mobilePopupInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleMobileSubmit();
      }
    });
    
    // Click outside to close
    mobilePopup.addEventListener('click', (event) => {
      if (event.target === mobilePopup) {
        hideMobilePopup();
      }
    });
  }
  
  function showMobilePopup(cellIndex, cellData) {
    if (!mobilePopup) createMobilePopup();
    
    selectedCellIndex = cellIndex;
    selectedCellElement = cellIndex !== null ? board.children[cellIndex] : null;
    
    if (cellData) {
      mobilePopupProblem.textContent = cellData.equation;
      mobilePopupInput.value = '';
      mobilePopup.classList.add('active');
      setTimeout(() => mobilePopupInput.focus(), 100);
    }
  }
  
  function hideMobilePopup() {
    if (!mobilePopup) return;
    mobilePopup.classList.remove('active');
    selectedCellIndex = null;
    selectedCellElement = null;
  }
  
  function handleMobileSubmit() {
    if (selectedCellIndex === null || !running) return;
    const cell = board.children[selectedCellIndex];
    if (cell) {
      const value = mobilePopupInput.value;
      checkAnswer(cell, value);
      hideMobilePopup();
    }
  }
  
  function isMobileScreen() {
    return window.innerWidth <= 600;
  }

  function showAnswerSection(cellIndex, cellData) {
    if (!answerSection || !problemValue || !answerInput) return;
    
    selectedCellIndex = cellIndex;
    selectedCellElement = cellIndex !== null ? board.children[cellIndex] : null;
    
    if (cellData) {
      if (isMobileScreen()) {
        showMobilePopup(cellIndex, cellData);
        return;
      }
      
      problemValue.textContent = cellData.equation;
      answerSection.style.display = 'block';
      answerInput.value = '';
      answerInput.focus();
    } else {
      hideAnswerSection();
    }
  }
  
  function hideAnswerSection() {
    if (!answerSection) return;
    answerSection.style.display = 'none';
    selectedCellIndex = null;
    selectedCellElement = null;
  }

  function startGame() {
    stopTimer();
    stopArena();
    running = true;
    score = 0;
    solved = 0;
    scoreEl.textContent = '0';
    feedbackEl.textContent = '';
    hideAnswerSection();
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
    solvedEquations = [];
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

      cell.appendChild(eq);
      
      const symbol = document.createElement('div');
      symbol.className = 'ms-symbol';
      cell.appendChild(symbol);
      
      // Click cell to select and show answer section
      cell.addEventListener('click', () => {
        if (!running || data.solved) return;
        showAnswerSection(i, data);
      });

      board.appendChild(cell);
    }
  }

  function checkAnswer(cell, answerValue) {
    const idx = Number(cell.dataset.index);
    const data = puzzle[idx];
    if (!data || data.solved || !running) return;
    const value = Number(answerValue);
    if (!Number.isFinite(value)) return;

    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathsynth');
    stats.totalAttempted += 1;
    gameStats.attempted += 1;

    if (value === data.answer) {
      data.solved = true;
      solved += 1;
      solvedEquations.push(data);
      score -= 1;
      scoreEl.textContent = `${score}`;
      cell.classList.add('correct');
      cell.classList.add('solved');
      applySolvePattern(cell);
      feedbackEl.textContent = 'Nice! Keep going.';
      unlockNextColor();
      stats.totalCorrect += 1;
      gameStats.correct += 1;
      stats.totalPoints += 1;
      gameStats.points += 1;
      
      // Hide answer section after correct answer
      hideAnswerSection();
      
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
    hideAnswerSection();
    const stats = loadProfileStats();
    const gameStats = ensureGameStats(stats, 'mathsynth');
    gameStats.bestScore = gameStats.bestScore === null ? score : Math.min(gameStats.bestScore, score);
    gameStats.bestTime = Math.max(gameStats.bestTime || 0, timeLeft);
    saveProfileStats(stats);
    startArena();
  }

  window.addEventListener('keydown', (e) => {
    if (!arenaActive) return;
    const key = e.key;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(key)) {
      arenaKeys.add(key);
      e.preventDefault();
    }
    if (key === ' ') {
      arenaShoot();
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (!arenaActive) return;
    const key = e.key;
    arenaKeys.delete(key);
    e.preventDefault();
  });

  function getArenaTargetCount(level) {
    if (level === 'easy') return 42;
    if (level === 'medium') return 48;
    return 54;
  }

  function getTierState() {
    const user = currentUser();
    const raw = localStorage.getItem(`mathpop_profile_stats_${user}`);
    if (!raw) return { activeTier: 1, tierUnlocks: [1] };
    try {
      const parsed = JSON.parse(raw);
      const unlocks = Array.isArray(parsed.tierUnlocks) ? parsed.tierUnlocks : [];
      return {
        activeTier: Number(parsed.activeTier) || 1,
        tierUnlocks: [1, ...unlocks]
      };
    } catch {
      return { activeTier: 1, tierUnlocks: [1] };
    }
  }

  function isTierUnlocked(tierId, tierUnlocks) {
    return tierUnlocks.includes(tierId);
  }

  function ensureArenaElements() {
    if (arenaEl) return;
    arenaEl = document.createElement('div');
    arenaEl.id = 'mathSynthArena';
    arenaEl.className = 'mathsynth-arena';
    arenaEl.innerHTML = `
      <div class="mathsynth-arena__hint">Math escaped the board!</div>
    `;
    document.body.appendChild(arenaEl);

    const aimFromPoint = (clientX, clientY) => {
      const dx = clientX - bennyState.x;
      const dy = clientY - bennyState.y;
      const len = Math.hypot(dx, dy) || 1;
      arenaLastAim = { x: dx / len, y: dy / len };
    };
    arenaEl.addEventListener('pointermove', (e) => {
      if (!arenaActive) return;
      aimFromPoint(e.clientX, e.clientY);
    });
    arenaEl.addEventListener('pointerdown', (e) => {
      if (!arenaActive) return;
      aimFromPoint(e.clientX, e.clientY);
    });
    arenaEl.addEventListener('touchstart', (e) => {
      if (!arenaActive) return;
      const touch = e.touches[0];
      aimFromPoint(touch.clientX, touch.clientY);
    }, { passive: true });
    arenaEl.addEventListener('touchmove', (e) => {
      if (!arenaActive) return;
      const touch = e.touches[0];
      aimFromPoint(touch.clientX, touch.clientY);
    }, { passive: true });

    bennyEl = document.createElement('div');
    bennyEl.className = 'ms-benny';
    bennyEl.innerHTML = '<div class="ms-benny__body"></div><div class="ms-benny__face"></div>';
    arenaEl.appendChild(bennyEl);

    arenaControlsEl = document.createElement('div');
    arenaControlsEl.className = 'mathsynth-arena-controls';
    arenaControlsEl.innerHTML = `
      <div class="ms-joystick" id="msArenaJoystick">
        <div class="ms-stick" id="msArenaStick"></div>
      </div>
      <button class="ms-shoot" id="msArenaShoot" type="button">Play</button>
    `;
    arenaEl.appendChild(arenaControlsEl);
    arenaJoystick = arenaControlsEl.querySelector('#msArenaJoystick');
    arenaStick = arenaControlsEl.querySelector('#msArenaStick');
    arenaShootBtn = arenaControlsEl.querySelector('#msArenaShoot');

    if (arenaJoystick) {
      arenaJoystick.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = arenaJoystick.getBoundingClientRect();
        arenaJoystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        arenaJoystickActive = true;
        handleArenaJoystickMove(touch.clientX, touch.clientY);
        e.preventDefault();
      }, { passive: false });
      arenaJoystick.addEventListener('touchmove', (e) => {
        if (!arenaJoystickActive) return;
        const touch = e.touches[0];
        handleArenaJoystickMove(touch.clientX, touch.clientY);
        e.preventDefault();
      }, { passive: false });
      arenaJoystick.addEventListener('touchend', resetArenaJoystick);
      arenaJoystick.addEventListener('touchcancel', resetArenaJoystick);
    }

    if (arenaShootBtn) {
      const shootAction = (e) => {
        if (e) e.preventDefault();
        arenaShoot();
      };
      arenaShootBtn.addEventListener('touchstart', shootAction, { passive: false });
      arenaShootBtn.addEventListener('pointerdown', shootAction);
      arenaShootBtn.addEventListener('click', shootAction);
    }
  }

  function handleArenaJoystickMove(clientX, clientY) {
    const dx = clientX - arenaJoystickCenter.x;
    const dy = clientY - arenaJoystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const ratio = dist > 0 ? Math.min(1, arenaJoystickRadius / dist) : 0;
    const clampedX = dx * ratio;
    const clampedY = dy * ratio;
    arenaJoystickVector = {
      x: clampedX / arenaJoystickRadius,
      y: clampedY / arenaJoystickRadius
    };
    if (arenaStick) {
      arenaStick.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
    }
  }

  function resetArenaJoystick() {
    arenaJoystickActive = false;
    arenaJoystickVector = { x: 0, y: 0 };
    if (arenaStick) arenaStick.style.transform = 'translate(-50%, -50%)';
  }

  function refreshCoverRects() {
    if (!arenaActive) return;
    const covers = document.querySelectorAll(
      '.mathsynth .game-shell__header, .mathsynth .status-row, .mathsynth .palette-controls, .mathsynth .palette, .mathsynth .side-panel, .mathsynth .board-panel, .mathsynth .mathsynth-board, .mathsynth .mathsynth-board-name'
    );
    coverRects = Array.from(covers).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2
      };
    });
  }

  function startArena() {
    const level = levelSelect ? levelSelect.value : 'easy';
    if (!solvedEquations.length) return;
    stopArena();
    ensureArenaElements();
    arenaActive = true;
    arenaEl.classList.add('active');
    applyColor(selectedIndex);
    const targetCount = getArenaTargetCount(level);
    const equations = solvedEquations.slice();
    enemyQueue = [];
    for (let i = 0; i < targetCount; i += 1) {
      enemyQueue.push(equations[i % equations.length]);
    }
    waveIndex = 0;
    nextWaveAt = performance.now();
    enemies = [];
    bennyShots = [];
    enemyShots = [];
    squadCenter = { x: window.innerWidth * 0.5, y: 80 };
    squadVel = { x: 0, y: 0.06 };
    refreshCoverRects();
    coverRefreshAt = performance.now() + 1500;
    positionBenny();
    if (arenaAnimId) cancelAnimationFrame(arenaAnimId);
    arenaAnimId = requestAnimationFrame(arenaLoop);
  }

  function stopArena() {
    arenaActive = false;
    if (arenaAnimId) cancelAnimationFrame(arenaAnimId);
    arenaAnimId = null;
    arenaLastTick = 0;
    enemies.forEach(e => e.el.remove());
    bennyShots.forEach(s => s.el.remove());
    enemyShots.forEach(s => s.el.remove());
    enemies = [];
    bennyShots = [];
    enemyShots = [];
    if (arenaEl) arenaEl.classList.remove('active');
    resetArenaJoystick();
    arenaKeys.clear();
  }

  function positionBenny() {
    if (!bennyEl) return;
    const rect = board.getBoundingClientRect();
    const startX = rect.left + 16;
    const startY = rect.bottom - 60;
    bennyState.x = startX;
    bennyState.y = startY;
    bennyEl.style.left = `${bennyState.x}px`;
    bennyEl.style.top = `${bennyState.y}px`;
  }

  function spawnWave() {
    const now = performance.now();
    if (waveIndex >= enemyQueue.length) return;
    if (now < nextWaveAt) return;
    const batch = enemyQueue.slice(waveIndex, waveIndex + 5);
    waveIndex += batch.length;
    nextWaveAt = now + 1400;
    const width = window.innerWidth;
    batch.forEach((item) => {
      const enemyEl = document.createElement('div');
      enemyEl.className = 'ms-enemy';
      enemyEl.innerHTML = `
        <div class="ms-enemy__eq">${item.equation}</div>
        <div class="ms-enemy__hp"><span></span></div>
      `;
      arenaEl.appendChild(enemyEl);
      const x = Math.random() * (width - 120);
      const y = -120 - Math.random() * 80;
      const cover = coverRects.length ? coverRects[Math.floor(Math.random() * coverRects.length)] : null;
      const offset = {
        x: (Math.random() - 0.5) * 160,
        y: (Math.random() - 0.5) * 120
      };
      enemies.push({
        el: enemyEl,
        x,
        y,
        w: 120,
        h: 60,
        health: 4,
        state: 'advance',
        cover,
        peekOffset: 0,
        retreatAt: 0,
        shootAt: 0,
        offset
      });
      enemyEl.style.left = `${x}px`;
      enemyEl.style.top = `${y}px`;
    });
  }

  function arenaShoot() {
    if (!arenaActive) return;
    const { activeTier, tierUnlocks } = getTierState();
    const tier = activeTier;
    const unlocked = (id) => isTierUnlocked(id, tierUnlocks);
    const isBoomerang = tier === 2 && unlocked(2);
    const isTargetLock = tier === 3 && unlocked(3);
    const isWizard = tier === 5 && unlocked(5);
    const aim = arenaLastAim;
    const spread = isBoomerang ? 0.18 : 0.25;
    const angles = [
      Math.atan2(aim.y, aim.x) - spread,
      Math.atan2(aim.y, aim.x) + spread
    ];
    const wizardColors = ['#8b5cf6', '#facc15', '#fb923c', '#f472b6'];
    const shotChar = isBoomerang ? '>' : (isWizard ? 'π' : (isTargetLock ? '→' : '−'));
    const pickTarget = (x, y) => {
      let chosen = null;
      let nearest = Infinity;
      enemies.forEach((e) => {
        const dx = e.x - x;
        const dy = e.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < nearest) {
          nearest = dist;
          chosen = e;
        }
      });
      return chosen;
    };
    angles.forEach((angle, idx) => {
      const el = document.createElement('div');
      el.className = 'ms-shot';
      el.textContent = shotChar;
      if (isWizard) {
        const color = wizardColors[Math.floor(Math.random() * wizardColors.length)];
        el.style.color = color;
        el.style.textShadow = `0 0 8px ${color}`;
      }
      arenaEl.appendChild(el);
      const vx = Math.cos(angle) * 5.4;
      const vy = Math.sin(angle) * 5.4;
      const shot = {
        el,
        x: bennyState.x + 22,
        y: bennyState.y + 18 + (idx === 0 ? -4 : 4),
        vx,
        vy,
        homing: isTargetLock,
        target: isTargetLock ? pickTarget(bennyState.x, bennyState.y) : null,
        boomerang: isBoomerang,
        lifeMs: 0,
        returnAfterMs: 480,
        returning: false,
        repelled: 0
      };
      bennyShots.push(shot);
      el.style.left = `${shot.x}px`;
      el.style.top = `${shot.y}px`;
    });
  }

  function spawnEnemyShot(enemy) {
    const symbols = ['+', '-', '*', '/', '=', 'x', '%', '^', 'π', '>', '<'];
    const el = document.createElement('div');
    el.className = 'ms-shot enemy';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    arenaEl.appendChild(el);
    const dx = bennyState.x - enemy.x;
    const dy = bennyState.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    enemyShots.push({
      el,
      x: enemy.x + 40,
      y: enemy.y + 20,
      vx: (dx / dist) * 3.2,
      vy: (dy / dist) * 3.2,
      repelled: 0
    });
  }

  function updateBenny(delta) {
    const speed = 0.22 * delta;
    const moveX = (arenaKeys.has('ArrowRight') || arenaKeys.has('d') ? 1 : 0)
      - (arenaKeys.has('ArrowLeft') || arenaKeys.has('a') ? 1 : 0);
    const moveY = (arenaKeys.has('ArrowDown') || arenaKeys.has('s') ? 1 : 0)
      - (arenaKeys.has('ArrowUp') || arenaKeys.has('w') ? 1 : 0);
    let dx = moveX;
    let dy = moveY;
    if (arenaJoystickActive) {
      dx = arenaJoystickVector.x;
      dy = arenaJoystickVector.y;
    }
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      arenaLastAim = { x: dx / len, y: dy / len };
    }
    if (bennyEl && bennyEl.classList.contains('hit')) {
      dx *= 0.35;
      dy *= 0.35;
    }
    bennyState.x += dx * speed;
    bennyState.y += dy * speed;
    bennyState.x = clamp(bennyState.x, 8, window.innerWidth - 40);
    bennyState.y = clamp(bennyState.y, 80, window.innerHeight - 60);
    bennyEl.style.left = `${bennyState.x}px`;
    bennyEl.style.top = `${bennyState.y}px`;
  }

  function applyCoverRepel(shot) {
    for (let i = 0; i < coverRects.length; i += 1) {
      const c = coverRects[i];
      if (shot.x >= c.left && shot.x <= c.right && shot.y >= c.top && shot.y <= c.bottom) {
        shot.vx = -shot.vx * 0.8;
        shot.vy = -shot.vy * 0.8;
        shot.repelled = (shot.repelled || 0) + 1;
        return true;
      }
    }
    return false;
  }

  function updateShots(delta) {
    const step = delta / 16;
    bennyShots = bennyShots.filter((s) => {
      s.lifeMs += delta;
      if (s.boomerang && s.lifeMs >= s.returnAfterMs) s.returning = true;
      if (s.homing && s.target) {
        const dx = s.target.x - s.x;
        const dy = s.target.y - s.y;
        const dist = Math.hypot(dx, dy) || 1;
        s.vx += (dx / dist) * 0.12 * step;
        s.vy += (dy / dist) * 0.12 * step;
      }
      if (s.boomerang && s.returning) {
        const dx = bennyState.x - s.x;
        const dy = bennyState.y - s.y;
        const dist = Math.hypot(dx, dy) || 1;
        s.vx += (dx / dist) * 0.18 * step;
        s.vy += (dy / dist) * 0.18 * step;
      }
      s.x += s.vx * step;
      s.y += s.vy * step;
      applyCoverRepel(s);
      const maxX = window.innerWidth - 6;
      const maxY = window.innerHeight - 6;
      s.bounces = s.bounces || 0;
      if (s.x <= 0 || s.x >= maxX) {
        s.vx = -s.vx;
        s.x = clamp(s.x, 2, maxX - 2);
        s.bounces += 1;
      }
      if (s.y <= 0 || s.y >= maxY) {
        s.vy = -s.vy;
        s.y = clamp(s.y, 2, maxY - 2);
        s.bounces += 1;
      }
      s.el.style.left = `${s.x}px`;
      s.el.style.top = `${s.y}px`;
      if (s.repelled > 1 || s.bounces > 6) {
        s.el.remove();
        return false;
      }
      return true;
    });

    enemyShots = enemyShots.filter((s) => {
      s.x += s.vx * step;
      s.y += s.vy * step;
      applyCoverRepel(s);
      const maxX = window.innerWidth - 6;
      const maxY = window.innerHeight - 6;
      s.bounces = s.bounces || 0;
      if (s.x <= 0 || s.x >= maxX) {
        s.vx = -s.vx;
        s.x = clamp(s.x, 2, maxX - 2);
        s.bounces += 1;
      }
      if (s.y <= 0 || s.y >= maxY) {
        s.vy = -s.vy;
        s.y = clamp(s.y, 2, maxY - 2);
        s.bounces += 1;
      }
      s.el.style.left = `${s.x}px`;
      s.el.style.top = `${s.y}px`;
      if (s.repelled > 1 || s.bounces > 6) {
        s.el.remove();
        return false;
      }
      const hitBenny = s.x >= bennyState.x && s.x <= bennyState.x + 36
        && s.y >= bennyState.y && s.y <= bennyState.y + 36;
      if (hitBenny && bennyEl) {
        bennyEl.classList.add('hit');
        setTimeout(() => bennyEl.classList.remove('hit'), 180);
        s.el.remove();
        return false;
      }
      return true;
    });
  }

  function updateEnemies(delta) {
    const level = levelSelect ? levelSelect.value : 'easy';
    const baseSpeed = level === 'easy' ? 0.12 : (level === 'medium' ? 0.16 : 0.22);
    const speed = baseSpeed * delta;
    const driftTargetX = bennyState.x;
    const driftTargetY = bennyState.y * 0.2;
    const dxDrift = driftTargetX - squadCenter.x;
    const dyDrift = driftTargetY - squadCenter.y;
    const distDrift = Math.hypot(dxDrift, dyDrift) || 1;
    squadVel.x += (dxDrift / distDrift) * 0.002 * delta;
    squadVel.y += (dyDrift / distDrift) * 0.002 * delta;
    squadVel.x *= 0.98;
    squadVel.y *= 0.98;
    squadCenter.x += squadVel.x * delta;
    squadCenter.y += squadVel.y * delta;
    enemies.forEach((enemy) => {
      if (enemy.offset) {
        enemy.x += squadVel.x * delta * 0.6;
        enemy.y += squadVel.y * delta * 0.6;
      }
      if (enemy.state === 'advance') {
        const target = enemy.cover ? { x: enemy.cover.cx, y: enemy.cover.top - 18 } : { x: bennyState.x, y: bennyState.y };
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const dist = Math.hypot(dx, dy) || 1;
        enemy.x += (dx / dist) * speed;
        enemy.y += (dy / dist) * speed;
        if (dist < 40) {
          enemy.state = 'cover';
          enemy.peekOffset = 0;
          const peekDelay = level === 'easy' ? 900 : 450;
          enemy.shootAt = performance.now() + peekDelay + Math.random() * 600;
        }
      } else if (enemy.state === 'cover') {
        if (performance.now() >= enemy.shootAt) {
          enemy.state = 'peek';
        }
      } else if (enemy.state === 'peek') {
        const peekMax = level === 'easy' ? 36 : 22;
        const peekStep = level === 'easy' ? 0.5 : 0.8;
        enemy.peekOffset = Math.min(peekMax, enemy.peekOffset + speed * peekStep);
        const dx = bennyState.x - enemy.x;
        const dy = bennyState.y - enemy.y;
        const dist = Math.hypot(dx, dy) || 1;
        enemy.x += (dx / dist) * 0.3;
        enemy.y += (dy / dist) * 0.3;
        if (enemy.peekOffset >= peekMax - 2) {
          spawnEnemyShot(enemy);
          enemy.state = 'retreat';
          enemy.retreatAt = performance.now() + (level === 'easy' ? 700 : 420);
        }
      } else if (enemy.state === 'retreat') {
        const target = enemy.cover ? { x: enemy.cover.cx, y: enemy.cover.top - 18 } : { x: enemy.x, y: enemy.y };
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const dist = Math.hypot(dx, dy) || 1;
        enemy.x += (dx / dist) * speed * 1.2;
        enemy.y += (dy / dist) * speed * 1.2;
        if (performance.now() >= enemy.retreatAt) {
          enemy.state = 'cover';
          const peekDelay = level === 'easy' ? 900 : 500;
          enemy.shootAt = performance.now() + peekDelay + Math.random() * 900;
        }
      }
      enemy.el.style.left = `${enemy.x}px`;
      enemy.el.style.top = `${enemy.y}px`;
    });
  }

  function checkArenaHits() {
    bennyShots.forEach((s) => {
      enemies.forEach((e) => {
        const withinX = s.x >= e.x && s.x <= e.x + e.w;
        const withinY = s.y >= e.y && s.y <= e.y + e.h;
        if (withinX && withinY) {
          e.health -= 1;
          const hp = e.el.querySelector('.ms-enemy__hp span');
          if (hp) hp.style.width = `${(e.health / 4) * 100}%`;
          e.state = 'retreat';
          e.retreatAt = performance.now() + 700;
          s.el.remove();
          s.repelled = 99;
          if (e.health <= 0) {
            e.el.classList.add('down');
          }
        }
      });
    });
    enemies = enemies.filter((e) => {
      if (e.health <= 0) {
        e.el.remove();
        return false;
      }
      return true;
    });
  }

  function arenaLoop(ts) {
    if (!arenaActive) return;
    if (!arenaLastTick) arenaLastTick = ts;
    const delta = Math.min(40, ts - arenaLastTick);
    arenaLastTick = ts;
    if (ts >= coverRefreshAt) {
      refreshCoverRects();
      coverRefreshAt = ts + 1600;
    }
    spawnWave();
    updateBenny(delta);
    updateShots(delta);
    updateEnemies(delta);
    checkArenaHits();
    if (waveIndex >= enemyQueue.length && enemies.length === 0) {
      stopArena();
      promptEl.textContent = 'Arena cleared! Press Start for a new puzzle.';
      return;
    }
    arenaAnimId = requestAnimationFrame(arenaLoop);
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
    if (arenaEl) {
      arenaEl.style.setProperty('--ms-accent', scheme.primary);
      arenaEl.style.setProperty('--ms-accent-2', scheme.secondary);
    }
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
    hideAnswerSection();
    hideMobilePopup();
    window.__MathSynthCleanup = null;
  };

  window.MathSynth = {
    start: startGame,
    reset: resetGame,
    applyGrid: () => {}
  };
})();
