/* Combined bennyworld.js with embedded Babylon placeholder
   - Includes the Babylon placeholder Benny model from bennyworld-babylon.js
   - Keeps the original desk-dash game code from bennyworld.js
*/

/* Run any previous cleanup functions (both the 2D game and Babylon 3D) */
if (window.__BennyWorldCleanup) window.__BennyWorldCleanup();
if (window.__BennyWorldBabylonCleanup) window.__BennyWorldBabylonCleanup();
window.__BennyWorldCleanup = null;
window.__BennyWorldBabylonCleanup = null;

(() => {
  const qs = sel => document.querySelector(sel);
  const root = qs('#bennyWorldRoot');
  const area = qs('#bennyWorldArea');
  const levelLabel = qs('#bwLevelLabel');
  const msgEl = qs('#bwMessage');
  const pointsEl = qs('#bwPoints');
  const dashEl = qs('#bwDash');
  const statusEl = qs('#bwStatus');
  const difficultySelect = qs('#bwDifficulty');
  const progressBtn = qs('#bwProgressBtn');
  const leftBtn = qs('#bwLeft');
  const rightBtn = qs('#bwRight');
  const jumpBtn = qs('#bwJump');
  const glideBtn = qs('#bwGlide');
  const planeBtn = qs('#bwPlane');
  const fireBtn = qs('#bwFire');
  
  // Joystick elements
  const joystickContainer = qs('#bwJoystickContainer');
  const joystick = qs('#bwJoystick');
  const joystickKnob = qs('#bwJoystickKnob');
  
  // Joystick state
  let joystickActive = false;
  let joystickCenter = { x: 0, y: 0 };
  let joystickVector = { x: 0, y: 0 };
  const joystickRadius = 35; // Radius of joystick movement

  if (!root || !area) return;

  /* --- Babylon placeholder: embedded from bennyworld-babylon.js --- */
  (() => {
    // Ensure a canvas exists with id 'bwBabylon' (if not, create one and append to root)
    let canvas = document.getElementById('bwBabylon');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bwBabylon';
      // Give it a default size and style; adjust in CSS as desired
      canvas.width = 400;
      canvas.height = 300;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = '200px';
      canvas.style.pointerEvents = 'none'; // prevent interfering with game input
      root.appendChild(canvas);
    }

    let tries = 0;
    const waitForBabylon = () => {
      if (window.BABYLON) {
        initBabylon();
        return;
      }
      tries += 1;
      if (tries > 40) return;
      setTimeout(waitForBabylon, 250);
    };

    const initBabylon = () => {
      const BABYLON = window.BABYLON;
      let engine;
      try {
        engine = new BABYLON.Engine(canvas, true, {
          preserveDrawingBuffer: true,
          stencil: true,
          disableWebGL2Support: true
        });
      } catch (err) {
        console.error('Babylon engine init failed', err);
        return;
      }
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

      const camera = new BABYLON.ArcRotateCamera(
        'bwCam',
        Math.PI / 2,
        Math.PI / 2.2,
        6,
        new BABYLON.Vector3(0, 1.5, 0),
        scene
      );
      camera.lowerRadiusLimit = 4;
      camera.upperRadiusLimit = 8;
      camera.wheelPrecision = 1000;
      camera.panningSensibility = 0;
      if (camera.inputs && camera.inputs.attached && camera.inputs.attached.pointers) {
        camera.inputs.attached.pointers.buttons = [];
      }

      new BABYLON.HemisphericLight('bwLight', new BABYLON.Vector3(0, 1, 0), scene);

      const bennyRoot = new BABYLON.TransformNode('bennyRoot', scene);

      const body = BABYLON.MeshBuilder.CreateBox('body', { height: 1.2, width: 0.8, depth: 0.5 }, scene);
      body.position.y = 0.9;
      body.parent = bennyRoot;

      const head = BABYLON.MeshBuilder.CreateSphere('head', { diameter: 0.7 }, scene);
      head.position.y = 1.8;
      head.position.x = 0.45;
      head.parent = bennyRoot;

      const legL = BABYLON.MeshBuilder.CreateCylinder('legL', { height: 0.6, diameter: 0.2 }, scene);
      legL.position.y = 0.2;
      legL.position.x = -0.2;
      legL.parent = bennyRoot;

      const legR = BABYLON.MeshBuilder.CreateCylinder('legR', { height: 0.6, diameter: 0.2 }, scene);
      legR.position.y = 0.2;
      legR.position.x = 0.2;
      legR.parent = bennyRoot;

      const headMat = new BABYLON.StandardMaterial('headMat', scene);
      headMat.diffuseColor = BABYLON.Color3.FromHexString('#9ae6ff');
      head.material = headMat;

      const bodyMat = new BABYLON.StandardMaterial('bodyMat', scene);
      bodyMat.diffuseColor = BABYLON.Color3.FromHexString('#38bdf8');
      body.material = bodyMat;

      const legMat = new BABYLON.StandardMaterial('legMat', scene);
      legMat.diffuseColor = BABYLON.Color3.FromHexString('#d4d2bf');
      legL.material = legMat;
      legR.material = legMat;

      bennyRoot.scaling = new BABYLON.Vector3(0.6, 0.6, 0.6);

      scene.registerBeforeRender(() => {
        bennyRoot.rotation.y += 0.01;
      });

      engine.runRenderLoop(() => {
        scene.render();
      });

      window.addEventListener('resize', () => engine.resize());
      window.BennyWorld3D = { scene, bennyRoot, camera };
      window.__BennyWorldBabylonCleanup = () => {
        try {
          engine.stopRenderLoop();
          scene.dispose();
          engine.dispose();
        } catch (e) {
          // ignore cleanup errors
        }
      };
    };

    waitForBabylon();
  })();
  /* --- end Babylon placeholder --- */

  const themeIds = [
    'looseleaf', 'pencil', 'markers', 'whiteboard', 'locker',
    'cafeteria', 'bus', 'library', 'chalkboard', 'gym',
    'artroom', 'music', 'science', 'desk', 'backpack',
    'ruler', 'calendar', 'notepad', 'graphpaper', 'indexcard',
    'planner', 'lab', 'chalk', 'computerlab', 'hallway'
  ];
  const BENNY_COLORS = [
    { id: 'solid-01', type: 'solid', primary: '#7dd3fc' },
    { id: 'tone-01', type: 'tone', primary: '#6ee7b7', secondary: '#a3e635' },
    { id: 'solid-02', type: 'solid', primary: '#c4b5fd' },
    { id: 'tone-02', type: 'tone', primary: '#38bdf8', secondary: '#2563eb' },
    { id: 'solid-03', type: 'solid', primary: '#fde047' },
    { id: 'tone-03', type: 'tone', primary: '#f9a8d4', secondary: '#fb7185' },
    { id: 'solid-04', type: 'solid', primary: '#5eead4' },
    { id: 'tone-04', type: 'tone', primary: '#f472b6', secondary: '#a855f7' },
    { id: 'solid-05', type: 'solid', primary: '#a3e635' },
    { id: 'tone-05', type: 'tone', primary: '#22d3ee', secondary: '#0ea5e9' },
    { id: 'solid-06', type: 'solid', primary: '#fb7185' },
    { id: 'tone-06', type: 'tone', primary: '#f472b6', secondary: '#facc15' },
    { id: 'solid-07', type: 'solid', primary: '#60a5fa' },
    { id: 'tone-07', type: 'tone', primary: '#818cf8', secondary: '#4f46e5' },
    { id: 'solid-08', type: 'solid', primary: '#86efac' },
    { id: 'tone-08', type: 'tone', primary: '#a5b4fc', secondary: '#e0f2fe' },
    { id: 'solid-09', type: 'solid', primary: '#f9a8d4' },
    { id: 'tone-09', type: 'tone', primary: '#fde047', secondary: '#bef264' },
    { id: 'solid-10', type: 'solid', primary: '#cbd5f5' },
    { id: 'tone-10', type: 'tone', primary: '#e2e8f0', secondary: '#93c5fd' },
    { id: 'solid-11', type: 'solid', primary: '#7dd3fc' },
    { id: 'tone-11', type: 'tone', primary: '#2dd4bf', secondary: '#99f6e4' },
    { id: 'solid-12', type: 'solid', primary: '#c084fc' },
    { id: 'tone-12', type: 'tone', primary: '#d8b4fe', secondary: '#fda4af' },
    { id: 'solid-13', type: 'solid', primary: '#fb7185' },
    { id: 'tone-13', type: 'tone', primary: '#bef264', secondary: '#4ade80' },
    { id: 'solid-14', type: 'solid', primary: '#bae6fd' },
    { id: 'tone-14', type: 'tone', primary: '#60a5fa', secondary: '#6366f1' },
    { id: 'solid-15', type: 'solid', primary: '#a5b4fc' },
    { id: 'tone-15', type: 'tone', primary: '#5eead4', secondary: '#14b8a6' },
    { id: 'solid-16', type: 'solid', primary: '#fde68a' },
    { id: 'tone-16', type: 'tone', primary: '#fda4af', secondary: '#fb7185' },
    { id: 'solid-17', type: 'solid', primary: '#93c5fd' },
    { id: 'tone-17', type: 'tone', primary: '#a3e635', secondary: '#2dd4bf' },
    { id: 'solid-18', type: 'solid', primary: '#d8b4fe' },
    { id: 'tone-18', type: 'tone', primary: '#7dd3fc', secondary: '#6ee7b7' },
    { id: 'solid-19', type: 'solid', primary: '#99f6e4' },
    { id: 'tone-19', type: 'tone', primary: '#f472b6', secondary: '#60a5fa' },
    { id: 'solid-20', type: 'solid', primary: '#facc15' },
    { id: 'tone-20', type: 'tone', primary: '#5eead4', secondary: '#38bdf8' },
    { id: 'solid-21', type: 'solid', primary: '#a78bfa' },
    { id: 'tone-21', type: 'tone', primary: '#3b82f6', secondary: '#14b8a6' },
    { id: 'solid-22', type: 'solid', primary: '#4ade80' },
    { id: 'tone-22', type: 'tone', primary: '#c4b5fd', secondary: '#bae6fd' },
    { id: 'solid-23', type: 'solid', primary: '#fda4af' },
    { id: 'tone-23', type: 'tone', primary: '#5eead4', secondary: '#38bdf8' },
    { id: 'solid-24', type: 'solid', primary: '#2dd4bf' },
    { id: 'tone-24', type: 'tone', primary: '#fde047', secondary: '#c4b5fd' },
    { id: 'solid-25', type: 'solid', primary: '#e2e8f0' },
    { id: 'tone-25', type: 'tone', primary: '#fb7185', secondary: '#6ee7b7' }
  ];

  const totalLevels = 75;
  const TEST_START_LEVEL_75_ON_EASY = true;
  const TEST_START_DISTANCE_METERS = 9000;
  const TEST_FINAL_STAR_METERS = 10000;
  let levelIndex = 0;
  let points = 0;
  let distance = 0;
  let difficulty = 'easy';
  const deskPlaneDurationMs = 12000;
  let deskFuel = 0;
  let deskPlaneActive = false;
  let deskPlaneEndsAt = 0;

  const gravity = 0.55;
  const jumpPower = 11.5;
  const wallJumpPower = 14.5;
  const moveSpeed = 3.2;
  const maxFall = 12;
  const autoJump = true;
  const offscreenRenderBuffer = 220;
  const collisionBufferX = 96;
  const renderEpsilon = 0.1;
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const lowMemoryDevice = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const perfModeMobile = isMobileDevice || lowMemoryDevice;
  const levelWidthBaseMultiplier = perfModeMobile ? 5 : 8;
  const levelWidthPerLevelMultiplier = perfModeMobile ? 1 : 2;
  const levelWidthMax = perfModeMobile ? 14000 : 28000;
  const maxPathSteps = perfModeMobile ? 120 : 260;
  const extraPlatformScale = perfModeMobile ? 0.6 : 1;
  const movingDeskScale = perfModeMobile ? 0.55 : 1;
  const obstacleScale = perfModeMobile ? 0.65 : 1;
  const maxActiveAirEnemies = perfModeMobile ? 14 : 26;

  const keys = { left: false, right: false, jump: false, glide: false };
  let rafId = 0;
  let lastAutoSaveAt = 0;
  let jumpPulseTimer = 0;

  const benny = document.createElement('div');
  benny.className = 'bw-benny';
  benny.innerHTML = '<div class="benny-base"><div class="benny-shape"><div class="back"></div><div class="leg-left"></div><div class="leg-right"></div><div class="head"></div><div class="hardhat"><span class="hardhat-brand">S+L Dogineers</span></div><div class="nuclear-gauge"><span class="g-handle"></span><span class="g-knob"></span><span class="g-post g-post-left"></span><span class="g-post g-post-right"></span><span class="g-base"></span></div></div></div>';
  const star = document.createElement('div');
  star.className = 'bw-star';
  star.textContent = '★';
  
// Black hole element
  const blackHole = document.createElement('div');
  blackHole.className = 'bw-blackhole';
  blackHole.innerHTML = `
    <div class="blackhole-core"></div>
    <div class="blackhole-ring"></div>
    <div class="blackhole-ring"></div>
    <div class="blackhole-ring"></div>
    <div class="event-horizon"></div>
    <div class="blackhole-particles"></div>
  `;
  
  // Add inline styles for immediate visibility
  blackHole.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 140px;
    height: 140px;
    z-index: 2;
    pointer-events: none;
    display: block !important;
    visibility: visible !important;
  `;
  
  // Crumbling floor element
  const crumblingFloor = document.createElement('div');
  crumblingFloor.className = 'bw-crumbling-floor';
  crumblingFloor.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
    overflow: visible;
    display: block !important;
    visibility: visible !important;
  `;
  
  area.appendChild(blackHole);
  area.appendChild(crumblingFloor);
  const debugKing = document.createElement('div');
  debugKing.className = 'bw-debug-king';
  debugKing.innerHTML = `
    <div class="bw-debug-king__crown">Syntax Queen</div>
    <div class="bw-debug-king__cloak">Lead Guitar / Glitch Riffs</div>
    <div class="bw-debug-king__body">BOSS MODE</div>
  `;
  const bossArena = document.createElement('div');
  bossArena.className = 'bw-boss-arena';
  const syntaxIntroOverlay = document.createElement('div');
  syntaxIntroOverlay.className = 'bw-syntax-intro';
  syntaxIntroOverlay.innerHTML = `
    <div class="bw-syntax-intro__panel">
      <div class="bw-syntax-intro__kicker">Benny Dash Zone 1</div>
      <h2 class="bw-syntax-intro__title">Syntax Queen Theme Song</h2>
      <p class="bw-syntax-intro__scene">Syntax Queen enters with her electric guitar.</p>
      <div class="bw-syntax-intro__band">
        <div class="bw-bandmate queen" data-role="queen">
          <strong>Syntax Queen</strong>
          <span>Electric Guitar</span>
        </div>
        <div class="bw-bandmate drums" data-role="drums">
          <strong>Syntax Error</strong>
          <span>Drums</span>
        </div>
        <div class="bw-bandmate bass" data-role="bass">
          <strong>Syntax Error</strong>
          <span>Bass</span>
        </div>
      </div>
      <div class="bw-syntax-intro__timer">2:07</div>
    </div>
  `;
  const syntaxIntroSceneEl = syntaxIntroOverlay.querySelector('.bw-syntax-intro__scene');
  const syntaxIntroTimerEl = syntaxIntroOverlay.querySelector('.bw-syntax-intro__timer');
  const syntaxIntroBandmates = {
    queen: syntaxIntroOverlay.querySelector('[data-role="queen"]'),
    drums: syntaxIntroOverlay.querySelector('[data-role="drums"]'),
    bass: syntaxIntroOverlay.querySelector('[data-role="bass"]')
  };
  const postVictoryOverlay = document.createElement('div');
  postVictoryOverlay.className = 'bw-post-victory';
  postVictoryOverlay.innerHTML = `
    <div class="bw-post-victory__message">
      BARK BARK!!!!! Congragulations you've beat this game. Though its just a game; beating shows you can follow thru when you want to. BARK BARK I KNOW this is a power in its self. Keep practicing and thinking of ways you can apply it in your own way.
    </div>
    <div class="bw-credits" aria-live="polite">
      <div class="bw-credits__sheet">
        <div class="bw-credits__paper">
          <div class="bw-credits__page-label">Page 1</div>
          <p class="bw-credits__text"></p>
        </div>
      </div>
    </div>
  `;
  const postVictoryMessageEl = postVictoryOverlay.querySelector('.bw-post-victory__message');
  const creditsRootEl = postVictoryOverlay.querySelector('.bw-credits');
  const creditsSheetEl = postVictoryOverlay.querySelector('.bw-credits__sheet');
  const creditsPageLabelEl = postVictoryOverlay.querySelector('.bw-credits__page-label');
  const creditsTextEl = postVictoryOverlay.querySelector('.bw-credits__text');
  area.appendChild(bossArena);
  area.appendChild(debugKing);
  area.appendChild(syntaxIntroOverlay);
  area.appendChild(postVictoryOverlay);

  let bennyState = { x: 40, y: 0, vx: 0, vy: 0, onGround: false };
  let starPos = { x: 0, y: 0 };
  let cameraOffset = 0;
  let areaWidth = 0;
  let areaHeight = 0;
  let currentLevelWidth = 0;
  let platforms = [];
  const obstacles = [];
  let wallContact = 0;
  let gameOver = false;
  let flipActiveUntil = 0;
  let glideActive = false;
  let pendingSuperJump = false;
  const upPresses = [];
  const downPresses = [];
  let bossActive = false;
  let bossPhase = 0;
  let bossHealth = 0;
  let bossX = 0;
  let bossY = 0;
  let mirroredControls = false;
  let bossProjectiles = [];
  let bossPatternNodes = [];
  let bossPatternProgress = 0;
  let bossPatternGraceUntil = 0;
  let bossLastSpawnAt = 0;
  let bossPulseAt = 0;
  let bossWonThisLevel = false;
  const bossPatternSequence = ['2x', '4x', '8x'];
  const bossProjectilePool = ['x+/=y', '(a+b]?', '÷0', 'if(x){', '==??', 'loop()'];
  const bossSpawnMs = { 1: 850, 2: 620, 3: 700 };
  const airEnemies = [];
  let enemyErrors = [];
  let bennyShots = [];
  let lastBennyShotAt = 0;
  let slowUntil = 0;
  let freezeUntil = 0;
  let nextEnemyWaveDistance = 500;
  const bennyShotCooldownMs = 220;
  const syntaxQueenThemeDurationMs = 30000;
  const syntaxQueenThemeFadeStartMs = 27000;
  const syntaxQueenThemeSong = 'Syntax Queen Theme song.mp3';
  const syntaxIntroTimeline = [
    { atMs: 0, text: 'Syntax Queen storms in on electric guitar.', role: 'queen' },
    { atMs: 9000, text: 'Capture the Fraction syntax errors lock in on drums and bass.', role: 'drums' },
    { atMs: 18000, text: 'The loop builds. Benny gets ready for battle.', role: 'bass' },
    { atMs: 25500, text: 'Final bars. Battle starts in seconds.', role: 'queen' }
  ];
  let syntaxIntroActive = false;
  let syntaxIntroStartedAt = 0;
  let syntaxIntroStepIndex = -1;
  let syntaxIntroTimeoutId = 0;
  const postVictoryMessageFadeMs = 30000;
  const postVictoryMessageHideMs = 33000;
  const postVictoryPageTurnMs = 15000;
  const postVictoryCreditsPages = [
    '"Bark Bark its all fun and games until you try to make em"',
    '"Dedicated to Benny a good dog in a strange world"\n\nSpecial thanks to all my math teachers growing up. I wasn\'t a easy kid i know..... I hope this Game makes up for all the bad behavior!',
    '"Thank you Andrea and Richard. 2 great human beings Benny can always count on!. Can you believe Benny made this with out any thumbs?????"',
    '"Thank you Mom and Thank you Dad, I love both of you and this game in some ways is me watching yall growing up."',
    '"Dedicated to My Aunt Shila and Aunt Monkey. Amazing human beings with warm hearts and tenacious spirits."',
    'The End'
  ];
  let postVictoryActive = false;
  let postVictoryStartedAt = 0;
  let postVictoryPageIndex = 0;
  const tierPowerNames = {
    1: 'Subtraction eyes',
    2: 'Greater-than blast',
    3: 'Arrow blaster',
    4: 'Playful pounce',
    5: 'Pi wand blast',
    6: 'Gamma / neutron beam',
    7: 'Crash cart charge',
    8: 'Dogko finisher',
    9: 'Mythic finisher',
    10: 'Mathtality'
  };
  
  // Black hole and crumbling floor state
  let blackHoleActive = false;
  let blackHoleTimer = 0;
  let debrisInterval = null;
  const blackHoleDelay = 5000; // 5 seconds after level starts
  const blackHolePartsOrder = ['core', 'fuelCell', 'lens'];
  const blackHolePartMeta = {
    core: { label: 'Core', token: 'C' },
    fuelCell: { label: 'Fuel Cell', token: 'F' },
    lens: { label: 'Lens', token: 'L' }
  };
  let blackHoleWindowIndex = 0;
  let blackHolePartsCollected = { core: false, fuelCell: false, lens: false };
  let blackHoleReady = false;
  let blackHoleCooldownUntilLevel = 0;
  let activeBlackHolePart = null;

  function currentUser() {
    return localStorage.getItem('mathpop_current_user') || 'guest';
  }

  function normalizeDifficulty(mode) {
    return ['easy', 'medium', 'mathanomical'].includes(mode) ? mode : 'easy';
  }

  function progressKey(mode = difficulty) {
    const normalized = normalizeDifficulty(mode);
    return `mathpop_benny_dash_progress_${currentUser()}_${normalized}`;
  }

  function applyEasyTestStartLevel() {
    if (!TEST_START_LEVEL_75_ON_EASY) return;
    if (difficulty !== 'easy') return;
    levelIndex = totalLevels - 1;
    bossWonThisLevel = false;
  }

  function applyEasyTestStartDistance() {
    if (!TEST_START_LEVEL_75_ON_EASY) return;
    if (difficulty !== 'easy') return;
    if (levelIndex !== totalLevels - 1) return;
    const meters = Math.max(0, Number(TEST_START_DISTANCE_METERS) || 0);
    distance = meters;
    bennyState.x = Math.max(bennyState.x, meters);
    // Skip retroactive wave spawning for all earlier 500m checkpoints.
    nextEnemyWaveDistance = Math.ceil((meters + 1) / 500) * 500;
  }

  function applyEasyTestStarPosition() {
    if (!TEST_START_LEVEL_75_ON_EASY) return;
    if (difficulty !== 'easy') return;
    if (levelIndex !== totalLevels - 1) return;
    const starMeters = Math.max(0, Number(TEST_FINAL_STAR_METERS) || 0);
    starPos.x = starMeters;
    star.style.left = `${starMeters - cameraOffset}px`;
  }

  function legacyProgressKey() {
    return `mathpop_benny_dash_progress_${currentUser()}`;
  }

  function deskFuelKey() {
    return `mathpop_benny_desk_fuel_${currentUser()}`;
  }

  function bennyColorKey() {
    return `mathpup_benny_color_${currentUser()}`;
  }

  function loadDeskFuel() {
    return Math.max(0, parseInt(localStorage.getItem(deskFuelKey()) || '0', 10) || 0);
  }

  function saveDeskFuel(value) {
    const next = Math.max(0, Math.floor(value));
    deskFuel = next;
    localStorage.setItem(deskFuelKey(), String(next));
  }

  function applyBennyColor() {
    const selectedId = localStorage.getItem(bennyColorKey()) || 'solid-01';
    const color = BENNY_COLORS.find((c) => c.id === selectedId) || BENNY_COLORS[0];
    const back = benny.querySelector('.back');
    const head = benny.querySelector('.head');
    if (!back || !head) return;
    if (color.type === 'tone' && color.secondary) {
      back.style.background = color.primary;
      head.style.background = color.secondary;
    } else {
      back.style.background = color.primary;
      head.style.background = color.primary;
    }
  }

  function saveProgress(mode = 'auto') {
    const payload = {
      version: 2,
      savedAt: Date.now(),
      levelIndex: Math.max(0, Math.min(totalLevels - 1, Math.floor(levelIndex))),
      points: Math.max(0, Math.floor(points)),
      distance: Math.max(0, Math.floor(distance)),
      difficulty: ['easy', 'medium', 'mathanomical'].includes(difficulty) ? difficulty : 'easy',
      deskFuel: Math.max(0, Math.floor(deskFuel)),
      bossWonThisLevel: Boolean(bossWonThisLevel),
      blackHoleWindowIndex: Math.max(0, Math.floor(blackHoleWindowIndex)),
      blackHolePartsCollected: {
        core: Boolean(blackHolePartsCollected.core),
        fuelCell: Boolean(blackHolePartsCollected.fuelCell),
        lens: Boolean(blackHolePartsCollected.lens)
      },
      blackHoleReady: Boolean(blackHoleReady),
      blackHoleCooldownUntilLevel: Math.max(0, Math.floor(blackHoleCooldownUntilLevel))
    };
    localStorage.setItem(progressKey(payload.difficulty), JSON.stringify(payload));
    if (mode === 'manual') {
      setMessage(`Progress saved: Level ${payload.levelIndex + 1}.`, 1000);
    }
  }

  function loadProgress(showMessage = true) {
    const raw = localStorage.getItem(progressKey(difficulty));
    const legacyRaw = localStorage.getItem(legacyProgressKey());
    const source = raw || legacyRaw;
    if (!source) return false;
    try {
      const data = JSON.parse(source);
      if (!data || typeof data !== 'object') return false;
      const nextDifficulty = ['easy', 'medium', 'mathanomical'].includes(data.difficulty)
        ? data.difficulty
        : 'easy';
      levelIndex = Math.max(0, Math.min(totalLevels - 1, Number(data.levelIndex) || 0));
      points = Math.max(0, Number(data.points) || 0);
      distance = Math.max(0, Number(data.distance) || 0);
      difficulty = nextDifficulty;
      saveDeskFuel(Number(data.deskFuel) || 0);
      bossWonThisLevel = Boolean(data.bossWonThisLevel);
      blackHoleWindowIndex = Math.max(0, Math.floor(Number(data.blackHoleWindowIndex) || 0));
      const rawParts = data.blackHolePartsCollected || {};
      blackHolePartsCollected = {
        core: Boolean(rawParts.core),
        fuelCell: Boolean(rawParts.fuelCell),
        lens: Boolean(rawParts.lens)
      };
      blackHoleReady = Boolean(data.blackHoleReady);
      blackHoleCooldownUntilLevel = Math.max(0, Math.floor(Number(data.blackHoleCooldownUntilLevel) || 0));
      if (!data.blackHolePartsCollected && !data.blackHoleReady) {
        resetBlackHolePartsForWindow(Math.floor(levelIndex / 10));
      }
      if (difficultySelect) difficultySelect.value = nextDifficulty;
      // Migrate legacy single-slot save into difficulty-specific save slots.
      if (!raw && legacyRaw) {
        localStorage.setItem(progressKey(nextDifficulty), JSON.stringify({
          ...data,
          difficulty: nextDifficulty
        }));
      }
      if (showMessage) setMessage(`Progress loaded: Level ${levelIndex + 1}.`, 1100);
      return true;
    } catch {
      return false;
    }
  }

  function activateDeskPlane() {
    if (deskPlaneActive || deskFuel <= 0) return false;
    saveDeskFuel(deskFuel - 1);
    deskPlaneActive = true;
    deskPlaneEndsAt = performance.now() + deskPlaneDurationMs;
    setMessage('Desk plane launched! Hopes and dreams online.', 1400);
    return true;
  }

  function triggerDeskPlane() {
    if (deskPlaneActive) return;
    if (!activateDeskPlane()) {
      setMessage('No desk fuel. Collect desks in Deci-What bonus.', 1300);
    }
  }

  function deskPlaneRemainingRatio(now) {
    if (!deskPlaneActive) return 0;
    return Math.max(0, (deskPlaneEndsAt - now) / deskPlaneDurationMs);
  }

  function setMessage(text, holdMs = 1400) {
    if (!msgEl) return;
    msgEl.textContent = text;
    if (holdMs <= 0) return;
    setTimeout(() => {
      if (msgEl.textContent === text) msgEl.textContent = '';
    }, holdMs);
  }

  function dispatchMusicControl(action, payload = {}) {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
    window.dispatchEvent(new CustomEvent('mathpop:music-control', {
      detail: { action, ...payload }
    }));
  }

  function getBlackHoleNeededPartForLevel(level) {
    const localIndex = ((level % 10) + 10) % 10;
    if (localIndex <= 3) return blackHolePartsOrder[0];
    if (localIndex <= 6) return blackHolePartsOrder[1];
    return blackHolePartsOrder[2];
  }

  function resetBlackHolePartsForWindow(windowIndex) {
    blackHoleWindowIndex = Math.max(0, windowIndex);
    blackHolePartsCollected = { core: false, fuelCell: false, lens: false };
    blackHoleReady = false;
  }

  function syncBlackHoleWindowForLevel() {
    const windowIndex = Math.floor(levelIndex / 10);
    if (windowIndex !== blackHoleWindowIndex && !blackHoleReady) {
      resetBlackHolePartsForWindow(windowIndex);
    }
  }

  function allBlackHolePartsCollected() {
    return blackHolePartsOrder.every((key) => blackHolePartsCollected[key]);
  }

  function blackHoleCooldownRemaining() {
    return Math.max(0, blackHoleCooldownUntilLevel - levelIndex);
  }

  function canUseBlackHoleShortcut() {
    return blackHoleReady && blackHoleCooldownRemaining() === 0 && !bossActive;
  }

  function clearBlackHolePartOnMap() {
    if (!activeBlackHolePart) return;
    if (activeBlackHolePart.el && activeBlackHolePart.el.parentNode) {
      activeBlackHolePart.el.parentNode.removeChild(activeBlackHolePart.el);
    }
    activeBlackHolePart = null;
  }

  function collectBlackHolePart(partKey) {
    if (!blackHolePartMeta[partKey] || blackHolePartsCollected[partKey]) return;
    blackHolePartsCollected[partKey] = true;
    clearBlackHolePartOnMap();
    setMessage(`Collected ${blackHolePartMeta[partKey].label}!`, 1200);
    if (allBlackHolePartsCollected()) {
      blackHoleReady = true;
      setMessage('Gravity shortcut ready! Touch the black hole.', 1800);
    }
  }

  function triggerBlackHoleShortcut() {
    if (!canUseBlackHoleShortcut()) return false;
    const fromLevel = levelIndex;
    const targetLevel = Math.min(totalLevels - 1, fromLevel + 10);
    if (targetLevel <= fromLevel) return false;
    blackHoleReady = false;
    blackHolePartsCollected = { core: false, fuelCell: false, lens: false };
    blackHoleCooldownUntilLevel = Math.min(totalLevels - 1, fromLevel + 20);
    clearBlackHolePartOnMap();
    levelIndex = targetLevel;
    points += 200;
    saveProgress('auto');
    setMessage(`Gravity jump: Level ${fromLevel + 1} -> Level ${targetLevel + 1}`, 1800);
    startLevel();
    return true;
  }

  function triggerBlackHoleDeath() {
    // Reset black hole state
    blackHoleActive = false;
    blackHoleTimer = 0;
    
    // Remove warning and debris
    const warning = qs('.bw-warning');
    if (warning) warning.remove();
    stopDebrisFall();
    
    // Visual effect - Benny gets sucked in
    benny.style.transition = 'all 0.5s ease-in';
    benny.style.transform = 'scale(0)';
    benny.style.opacity = '0';
    
    setMessage('Sucked into the void!', 2000);
    
    setTimeout(() => {
      // Reset Benny
      benny.style.transition = '';
      benny.style.transform = '';
      benny.style.opacity = '';
      
      // Reset position
      const rect = area.getBoundingClientRect();
      const groundY = rect.height - 40;
      bennyState = { x: 40, y: groundY - 36, vx: 0, vy: 0, onGround: true };
      blackHoleTimer = 0;
      
      // Restart level
      startLevel();
    }, 1000);
  }

  function startDebrisFall() {
    if (debrisInterval) return;
    
    debrisInterval = setInterval(() => {
      if (!blackHoleActive) return;
      
      // Create falling debris
      const rect = area.getBoundingClientRect();
      const debris = document.createElement('div');
      debris.className = 'bw-debris';
      debris.style.left = `${Math.random() * rect.width}px`;
      debris.style.top = '0px';
      area.appendChild(debris);
      
      // Remove debris after animation
      setTimeout(() => {
        if (debris.parentNode) debris.parentNode.removeChild(debris);
      }, 3000);
    }, 500);
    
    // Create crack effects on the floor
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const crack = document.createElement('div');
        crack.className = 'bw-crack';
        crack.style.left = `${Math.random() * 80}%`;
        crack.style.bottom = '0';
        area.appendChild(crack);
        
        setTimeout(() => {
          if (crack.parentNode) crack.parentNode.removeChild(crack);
        }, 2000);
      }, i * 300);
    }
  }

  function stopDebrisFall() {
    if (debrisInterval) {
      clearInterval(debrisInterval);
      debrisInterval = null;
    }
    
    // Remove all existing debris
    document.querySelectorAll('.bw-debris').forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function setBossMode(active) {
    bossActive = active;
    debugKing.classList.toggle('active', active);
    bossArena.classList.toggle('active', active);
    if (!active) {
      mirroredControls = false;
      bossPhase = 0;
      bossPatternProgress = 0;
      bossPatternGraceUntil = 0;
      bossPatternNodes.forEach(node => node.el.remove());
      bossPatternNodes = [];
      bossProjectiles.forEach(p => p.el.remove());
      bossProjectiles = [];
    }
  }

  function formatMsAsClock(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function applySyntaxIntroStep(nextIndex) {
    if (nextIndex === syntaxIntroStepIndex || nextIndex < 0 || nextIndex >= syntaxIntroTimeline.length) return;
    syntaxIntroStepIndex = nextIndex;
    const step = syntaxIntroTimeline[nextIndex];
    if (syntaxIntroSceneEl) syntaxIntroSceneEl.textContent = step.text;
    Object.values(syntaxIntroBandmates).forEach((node) => node && node.classList.remove('is-live'));
    const roleNode = step.role ? syntaxIntroBandmates[step.role] : null;
    if (roleNode) roleNode.classList.add('is-live');
  }

  function stopSyntaxQueenIntro(startBoss = true, unlockMusic = true) {
    if (syntaxIntroTimeoutId) {
      clearTimeout(syntaxIntroTimeoutId);
      syntaxIntroTimeoutId = 0;
    }
    syntaxIntroActive = false;
    syntaxIntroStepIndex = -1;
    area.classList.remove('syntax-intro-active');
    syntaxIntroOverlay.classList.remove('active', 'fade-out');
    Object.values(syntaxIntroBandmates).forEach((node) => node && node.classList.remove('is-live'));
    if (unlockMusic) dispatchMusicControl('unlock');
    if (startBoss) startDebugKingFight();
  }

  function ensureBossRewardSongUnlocked() {
    const user = currentUser();
    if (!user || user === 'guest') return;
    const key = `mathpop_jukebox_${user}`;
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem(key) || '{}') || {};
    } catch {
      state = {};
    }
    if (!Object.prototype.hasOwnProperty.call(state, 'song-27')) {
      state['song-27'] = false;
      localStorage.setItem(key, JSON.stringify(state));
    }
  }

  function setCreditsPage(index, turn = false) {
    const safeIndex = Math.max(0, Math.min(postVictoryCreditsPages.length - 1, index));
    if (safeIndex === postVictoryPageIndex && creditsTextEl && creditsTextEl.textContent) return;
    postVictoryPageIndex = safeIndex;
    if (creditsPageLabelEl) creditsPageLabelEl.textContent = `Page ${safeIndex + 1}`;
    if (creditsTextEl) creditsTextEl.textContent = postVictoryCreditsPages[safeIndex] || '';
    if (turn && creditsSheetEl) {
      creditsSheetEl.classList.remove('turning');
      void creditsSheetEl.offsetWidth;
      creditsSheetEl.classList.add('turning');
    }
  }

  function stopPostVictorySequence(clearOnly = true) {
    postVictoryActive = false;
    postVictoryStartedAt = 0;
    postVictoryPageIndex = 0;
    dispatchMusicControl('unlock');
    area.classList.remove('post-victory-active');
    postVictoryOverlay.classList.remove('active', 'hide-message', 'show-credits');
    if (creditsSheetEl) creditsSheetEl.classList.remove('turning');
    if (creditsRootEl) creditsRootEl.classList.remove('active');
    if (postVictoryMessageEl) postVictoryMessageEl.classList.remove('fade-out');
    if (clearOnly && statusEl) statusEl.textContent = 'Run to the star!';
  }

  function startPostVictorySequence() {
    if (postVictoryActive) return;
    ensureBossRewardSongUnlocked();
    postVictoryActive = true;
    postVictoryStartedAt = performance.now();
    postVictoryPageIndex = 0;
    stopSyntaxQueenIntro(false, true);
    setBossMode(false);
    stopDebrisFall();
    blackHoleActive = false;
    blackHole.style.display = 'none';
    area.classList.add('post-victory-active');
    postVictoryOverlay.classList.add('active');
    postVictoryOverlay.classList.remove('hide-message', 'show-credits');
    if (postVictoryMessageEl) {
      postVictoryMessageEl.classList.remove('fade-out');
    }
    if (creditsRootEl) creditsRootEl.classList.remove('active');
    setCreditsPage(0, false);
    dispatchMusicControl('play-track', {
      title: 'For the Dev',
      filename: 'For the Dev.mp3',
      lock: true
    });
  }

  function updatePostVictorySequence(now = performance.now()) {
    if (!postVictoryActive) return;
    const elapsed = Math.max(0, now - postVictoryStartedAt);
    if (elapsed >= postVictoryMessageFadeMs && postVictoryMessageEl) {
      postVictoryMessageEl.classList.add('fade-out');
    }
    if (elapsed >= postVictoryMessageHideMs) {
      postVictoryOverlay.classList.add('show-credits');
      if (creditsRootEl) creditsRootEl.classList.add('active');
      const creditsElapsed = elapsed - postVictoryMessageHideMs;
      const pageIndex = Math.min(
        postVictoryCreditsPages.length - 1,
        Math.max(0, Math.floor(creditsElapsed / postVictoryPageTurnMs))
      );
      setCreditsPage(pageIndex, pageIndex !== postVictoryPageIndex);
    }
  }

  function updateSyntaxQueenIntro(now = performance.now()) {
    if (!syntaxIntroActive) return;
    const elapsed = Math.max(0, now - syntaxIntroStartedAt);
    const remaining = Math.max(0, syntaxQueenThemeDurationMs - elapsed);
    if (syntaxIntroTimerEl) syntaxIntroTimerEl.textContent = formatMsAsClock(remaining);
    if (elapsed >= syntaxQueenThemeFadeStartMs) {
      syntaxIntroOverlay.classList.add('fade-out');
    }

    let nextIndex = 0;
    for (let i = 0; i < syntaxIntroTimeline.length; i += 1) {
      if (elapsed >= syntaxIntroTimeline[i].atMs) nextIndex = i;
      else break;
    }
    applySyntaxIntroStep(nextIndex);
  }

  function startSyntaxQueenIntro() {
    if (syntaxIntroActive || bossActive) return;
    syntaxIntroActive = true;
    syntaxIntroStartedAt = performance.now();
    syntaxIntroStepIndex = -1;
    setBossMode(false);
    blackHoleActive = false;
    blackHoleTimer = 0;
    clearBlackHolePartOnMap();
    blackHole.style.display = 'none';
    stopDebrisFall();
    crumblingFloor.classList.remove('crumpling');
    area.classList.remove('shake');
    area.classList.add('syntax-intro-active');
    syntaxIntroOverlay.classList.add('active');
    syntaxIntroOverlay.classList.remove('fade-out');
    setMessage('Syntax Queen intro starts. Battle queues in 30 seconds.', 1800);
    updateSyntaxQueenIntro(syntaxIntroStartedAt);
    dispatchMusicControl('play-track', {
      title: 'Syntax Queen Theme song',
      filename: syntaxQueenThemeSong,
      lock: true,
      stopOnEnd: true
    });

    syntaxIntroTimeoutId = setTimeout(() => stopSyntaxQueenIntro(true, false), syntaxQueenThemeDurationMs);
  }

  function spawnBossProjectile(type = 'syntax') {
    const el = document.createElement('div');
    el.className = `bw-boss-projectile ${type}`;
    el.textContent = bossProjectilePool[Math.floor(Math.random() * bossProjectilePool.length)];
    area.appendChild(el);
    const angle = Math.atan2((bennyState.y + 18) - bossY, (bennyState.x + 18) - bossX);
    const base = type === 'illusion' ? 4.5 : 3.5;
    bossProjectiles.push({
      el,
      x: bossX + 30,
      y: bossY + 24,
      vx: Math.cos(angle) * base,
      vy: Math.sin(angle) * base,
      type
    });
  }

  function triggerBossPulse() {
    if (!bossActive) return;
    const now = performance.now();
    if (now - bossPulseAt < 350) return;
    bossPulseAt = now;
    const ring = document.createElement('div');
    ring.className = 'bw-boss-pulse';
    ring.style.left = `${bennyState.x - cameraOffset - 28}px`;
    ring.style.top = `${bennyState.y - 28}px`;
    area.appendChild(ring);
    setTimeout(() => ring.remove(), 260);

    const bennyCx = bennyState.x + 18;
    const bennyCy = bennyState.y + 18;
    const bossDist = Math.hypot((bossX + 24) - bennyCx, (bossY + 24) - bennyCy);
    if (bossPhase < 3 && bossDist < 160) {
      bossHealth = Math.max(0, bossHealth - 1);
      debugKing.classList.add('hit');
      setTimeout(() => debugKing.classList.remove('hit'), 160);
    }
  }

  function spawnBossPatternNodes() {
    bossPatternNodes.forEach(node => node.el.remove());
    bossPatternNodes = [];
    const rect = area.getBoundingClientRect();
    const minWorldX = cameraOffset + 180;
    const maxWorldX = cameraOffset + rect.width - 180;
    const cx = Math.max(minWorldX, Math.min(maxWorldX, bossX));
    const cy = Math.max(130, Math.min(rect.height - 120, bossY));
    const placements = [
      { label: '2x', angle: Math.PI * 0.92, radius: 94 },
      { label: '4x', angle: Math.PI * 0.5, radius: 82 },
      { label: '8x', angle: Math.PI * 0.08, radius: 94 },
      { label: '3x', angle: Math.PI * 1.28, radius: 148 },
      { label: '6x', angle: Math.PI * -0.28, radius: 148 }
    ];
    placements.forEach(({ label, angle, radius }) => {
      const el = document.createElement('div');
      el.className = 'bw-pattern-node';
      el.textContent = label;
      area.appendChild(el);
      bossPatternNodes.push({
        el,
        label,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    });
  }

  function startDebugKingFight() {
    stopPostVictorySequence(false);
    setBossMode(true);
    // Battle arena cleanup: remove desk platforms and keep only ground.
    platforms = platforms.filter((p) => {
      const isGround = p.el && p.el.classList && p.el.classList.contains('ground');
      if (!isGround && p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
      return isGround;
    });
    blackHoleActive = false;
    blackHoleTimer = 0;
    clearBlackHolePartOnMap();
    blackHole.style.display = 'none';
    stopDebrisFall();
    crumblingFloor.classList.remove('crumpling');
    area.classList.remove('shake');
    bossWonThisLevel = false;
    bossHealth = 12;
    bossPhase = 1;
    bossPatternProgress = 0;
    bossPatternGraceUntil = 0;
    bossLastSpawnAt = performance.now();
    const rect = area.getBoundingClientRect();
    const groundY = rect.height - 40;
    const fightAnchorX = Math.max(80, starPos.x - 260);
    bennyState.x = fightAnchorX;
    bennyState.y = groundY - 36;
    bennyState.vx = 0;
    bennyState.vy = 0;
    bennyState.onGround = true;
    bossX = bennyState.x + 170;
    bossY = groundY - 120;
    debugKing.style.left = `${bossX - cameraOffset}px`;
    debugKing.style.top = `${bossY}px`;
    setMessage('Syntax Queen appears: Phase 1 - Syntax Chaos', 1600);
  }

  function finishDebugKingFight() {
    setBossMode(false);
    bossWonThisLevel = true;
    points += 500;
    setMessage('Syntax Queen defeated! +500', 1800);
    levelIndex = Math.min(totalLevels - 1, levelIndex + 1);
    saveProgress('auto');
    startPostVictorySequence();
  }

  function updateHud() {
    if (pointsEl) pointsEl.textContent = `Points: ${points}`;
    if (dashEl) dashEl.textContent = `Dash: ${Math.floor(distance)}m`;
    if (statusEl) {
      if (postVictoryActive) {
        statusEl.textContent = 'BARK BARK!!!!! Victory credits rolling.';
        return;
      }
      if (syntaxIntroActive) {
        const remaining = Math.max(0, syntaxQueenThemeDurationMs - (performance.now() - syntaxIntroStartedAt));
        statusEl.textContent = `Syntax Queen intro: ${formatMsAsClock(remaining)} to battle`;
        return;
      }
      if (bossActive) {
        const phaseLabel = bossPhase === 1
          ? 'Syntax Chaos'
          : bossPhase === 2
            ? 'Logic Illusions'
            : 'Infinite Loop Arena';
        const pattern = bossPhase === 3
          ? ` | Pattern ${bossPatternProgress}/${bossPatternSequence.length}`
          : '';
        statusEl.textContent = `Syntax Queen: ${phaseLabel} | HP ${bossHealth}${pattern}`;
        return;
      }
      if (deskPlaneActive) {
        const ratio = deskPlaneRemainingRatio(performance.now());
        const pct = Math.max(0, Math.ceil(ratio * 100));
        statusEl.textContent = `Desk Fuel: ${deskFuel} | Plane ${pct}%`;
      } else {
        const parts = blackHolePartsOrder
          .map((key) => `${blackHolePartMeta[key].token}:${blackHolePartsCollected[key] ? 'Y' : 'N'}`)
          .join(' ');
        if (canUseBlackHoleShortcut()) {
          statusEl.textContent = `Black Hole Ready! Parts ${parts} | Touch it for +10 levels`;
        } else {
          const cooldownLeft = blackHoleCooldownRemaining();
          const cooldownText = cooldownLeft > 0 ? ` | BH recharge ${cooldownLeft}` : '';
          statusEl.textContent = `Run to the star! Desk Fuel: ${deskFuel} | Parts ${parts}${cooldownText}`;
        }
      }
    }
  }

  function getDifficultyScale() {
    if (difficulty === 'easy') return 0.5;
    if (difficulty === 'medium') return 0.75;
    return 1;
  }

  function freezeDurationMs() {
    if (difficulty === 'easy') return 3000;
    if (difficulty === 'medium') return 4000;
    return 5000;
  }

  function getUnlockedTierSet() {
    const key = `mathpop_profile_stats_${currentUser()}`;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      const rawUnlocks = Array.isArray(parsed.tierUnlocks) ? parsed.tierUnlocks : [];
      const unlocks = new Set(
        rawUnlocks
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v) && v >= 1 && v <= 10)
      );
      unlocks.add(1);
      return unlocks;
    } catch {
      return new Set([1]);
    }
  }

  function activeTier() {
    const key = `mathpop_profile_stats_${currentUser()}`;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      const tier = Math.max(1, Math.min(10, Math.floor(Number(parsed.activeTier) || 1)));
      const unlocks = getUnlockedTierSet();
      return unlocks.has(tier) ? tier : 1;
    } catch {
      return 1;
    }
  }

  function hitsNeededForTier() {
    return Math.max(1, 11 - activeTier());
  }

  function getShotPowerConfig() {
    const tier = activeTier();
    const cfg = {
      tier,
      powerName: tierPowerNames[tier] || tierPowerNames[1],
      cooldown: bennyShotCooldownMs,
      shotCount: 1,
      spread: 0,
      speed: 7.2,
      damage: 1,
      splashRadius: 0,
      splashDamage: 0,
      pierce: 0,
      freezeMs: 0,
      killBonus: 0,
      clearChance: 0,
      symbol: '−',
      shotClass: 'shot-subtraction'
    };

    if (tier === 2) {
      cfg.symbol = '>';
      cfg.damage = 2;
      cfg.cooldown = 210;
      cfg.shotClass = 'shot-greater';
    } else if (tier === 3) {
      cfg.symbol = '−';
      cfg.shotCount = 3;
      cfg.spread = 0.2;
      cfg.cooldown = 200;
      cfg.shotClass = 'shot-subtraction';
    } else if (tier === 4) {
      cfg.symbol = '−';
      cfg.shotCount = 2;
      cfg.spread = 0.14;
      cfg.damage = 2;
      cfg.cooldown = 190;
      cfg.shotClass = 'shot-subtraction';
    } else if (tier === 5) {
      cfg.symbol = 'π';
      cfg.shotCount = 3;
      cfg.spread = 0.18;
      cfg.damage = 2;
      cfg.splashRadius = 46;
      cfg.splashDamage = 1;
      cfg.cooldown = 180;
      cfg.shotClass = 'shot-wizard';
    } else if (tier === 6) {
      cfg.symbol = '~';
      cfg.shotCount = 3;
      cfg.spread = 0.2;
      cfg.damage = 3;
      cfg.splashRadius = 56;
      cfg.splashDamage = 2;
      cfg.freezeMs = 1400;
      cfg.cooldown = 170;
      cfg.shotClass = 'shot-gamma';
    } else if (tier === 7) {
      cfg.symbol = '✚';
      cfg.shotCount = 4;
      cfg.spread = 0.22;
      cfg.damage = 3;
      cfg.splashRadius = 64;
      cfg.splashDamage = 2;
      cfg.killBonus = 10;
      cfg.cooldown = 165;
      cfg.shotClass = 'shot-nurse';
    } else if (tier === 8) {
      cfg.symbol = '🐾';
      cfg.shotCount = 4;
      cfg.spread = 0.24;
      cfg.damage = 4;
      cfg.splashRadius = 70;
      cfg.splashDamage = 3;
      cfg.killBonus = 20;
      cfg.clearChance = 0.12;
      cfg.cooldown = 160;
      cfg.shotClass = 'shot-dogko';
    } else if (tier === 9) {
      cfg.symbol = '✦';
      cfg.shotCount = 5;
      cfg.spread = 0.26;
      cfg.damage = 4;
      cfg.splashRadius = 78;
      cfg.splashDamage = 3;
      cfg.pierce = 2;
      cfg.killBonus = 30;
      cfg.clearChance = 0.2;
      cfg.cooldown = 150;
      cfg.shotClass = 'shot-mythic';
    } else if (tier >= 10) {
      cfg.symbol = '⚡';
      cfg.shotCount = 6;
      cfg.spread = 0.28;
      cfg.damage = 5;
      cfg.splashRadius = 90;
      cfg.splashDamage = 4;
      cfg.pierce = 4;
      cfg.killBonus = 40;
      cfg.clearChance = 0.35;
      cfg.cooldown = 140;
      cfg.shotClass = 'shot-mathtality';
    }

    return cfg;
  }

  function spawnAirEnemy(type, x, baseY) {
    const el = document.createElement('div');
    el.className = `bw-air-enemy ${type}`;
    el.textContent = type === 'syntax' ? '⚠️' : '🐛';
    area.appendChild(el);
    airEnemies.push({
      type,
      el,
      x,
      y: baseY - 120 - Math.random() * 80,
      w: 40,
      h: 40,
      vx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.1),
      vy: -5 - Math.random() * 3,
      baseY: baseY - 120 - Math.random() * 80,
      nextHopAt: performance.now() + 500 + Math.random() * 700,
      nextThrowAt: performance.now() + 800 + Math.random() * 1100,
      hp: hitsNeededForTier()
    });
  }

  function spawnEnemyError(enemy) {
    const el = document.createElement('div');
    const warning = enemy.type === 'syntax';
    el.className = `bw-error-projectile ${warning ? 'warning' : 'stop'}`;
    el.textContent = warning ? '⚠️' : '🛑';
    area.appendChild(el);
    const fromX = enemy.x + enemy.w * 0.5;
    const fromY = enemy.y + enemy.h * 0.4;
    const toX = bennyState.x + 18;
    const toY = bennyState.y + 18;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const speed = warning ? 3.8 : 3.1;
    enemyErrors.push({
      el,
      x: fromX,
      y: fromY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      type: warning ? 'warning' : 'stop',
      owner: enemy,
      returned: false
    });
  }

  function removeEnemy(enemy) {
    if (!enemy) return;
    if (enemy.el) enemy.el.remove();
    const idx = airEnemies.indexOf(enemy);
    if (idx >= 0) airEnemies.splice(idx, 1);
  }

  function awardEnemyElimination(enemy, killBonus = 0) {
    points += 120 + Math.max(0, killBonus);
    setMessage(`${enemy.type === 'syntax' ? 'Syntax Error' : 'Bug'} eliminated!`, 900);
    removeEnemy(enemy);
  }

  function applySplashDamage(shot, centerEnemy) {
    if (!shot.splashRadius || !shot.splashDamage) return;
    const cx = centerEnemy.x + centerEnemy.w * 0.5;
    const cy = centerEnemy.y + centerEnemy.h * 0.5;
    airEnemies.slice().forEach((enemy) => {
      if (enemy === centerEnemy) return;
      const ex = enemy.x + enemy.w * 0.5;
      const ey = enemy.y + enemy.h * 0.5;
      const dist = Math.hypot(ex - cx, ey - cy);
      if (dist > shot.splashRadius) return;
      enemy.hp -= shot.splashDamage;
      if (enemy.hp <= 0) {
        awardEnemyElimination(enemy, shot.killBonus || 0);
      }
    });
  }

  function clearAllAirEnemies(reasonText, killBonus = 0) {
    if (!airEnemies.length) return 0;
    const toClear = airEnemies.slice();
    toClear.forEach((enemy) => {
      points += 120 + Math.max(0, killBonus);
      if (enemy.el) enemy.el.remove();
    });
    airEnemies.length = 0;
    if (reasonText) setMessage(reasonText, 1000);
    return toClear.length;
  }

  function spawnShot(cfg, direction) {
    const el = document.createElement('div');
    el.className = 'bw-shot';
    if (cfg.shotClass) el.classList.add(cfg.shotClass);
    el.textContent = cfg.symbol;
    area.appendChild(el);
    bennyShots.push({
      el,
      x: bennyState.x + 18,
      y: bennyState.y + 16,
      vx: Math.cos(direction) * cfg.speed,
      vy: Math.sin(direction) * cfg.speed,
      damage: cfg.damage,
      splashRadius: cfg.splashRadius,
      splashDamage: cfg.splashDamage,
      pierceLeft: cfg.pierce,
      freezeMs: cfg.freezeMs,
      killBonus: cfg.killBonus,
      clearChance: cfg.clearChance
    });
  }

  function fireBennyShot() {
    if (syntaxIntroActive || postVictoryActive) return;
    const cfg = getShotPowerConfig();
    const now = performance.now();
    if (now - lastBennyShotAt < cfg.cooldown) return;
    lastBennyShotAt = now;

    let target = null;
    let nearest = Infinity;
    airEnemies.forEach((enemy) => {
      const dx = (enemy.x + enemy.w * 0.5) - (bennyState.x + 18);
      const dy = (enemy.y + enemy.h * 0.5) - (bennyState.y + 18);
      const dist = Math.hypot(dx, dy);
      if (dist < nearest) {
        nearest = dist;
        target = enemy;
      }
    });

    const baseDir = target
      ? Math.atan2((target.y + target.h * 0.5) - (bennyState.y + 18), (target.x + target.w * 0.5) - (bennyState.x + 18))
      : (benny.classList.contains('bw-benny--left') ? Math.PI : 0);

    const count = Math.max(1, Math.floor(cfg.shotCount));
    if (count === 1) {
      spawnShot(cfg, baseDir);
    } else {
      const offsetCenter = (count - 1) / 2;
      for (let i = 0; i < count; i += 1) {
        const offset = (i - offsetCenter) * cfg.spread;
        spawnShot(cfg, baseDir + offset);
      }
    }
  }

  function spawnDistanceEnemyWave() {
    if (!areaWidth || !areaHeight) refreshAreaMetrics();
    const groundY = areaHeight - 40;
    const levelWidth = currentLevelWidth || Math.min(
      levelWidthMax,
      areaWidth * (levelWidthBaseMultiplier + levelIndex * levelWidthPerLevelMultiplier)
    );
    const aheadX = Math.max(
      200,
      Math.min(levelWidth - 220, bennyState.x + areaWidth * 0.9 + Math.random() * 320)
    );
    const diffScale = getDifficultyScale();
    const enemySlots = Math.max(0, maxActiveAirEnemies - airEnemies.length);
    if (enemySlots <= 0) return;
    const syntaxWaveRaw = Math.max(2, Math.ceil((1 + Math.floor(levelIndex / 12)) * (1 + diffScale)));
    const bugWaveRaw = Math.max(1, Math.ceil((1 + Math.floor(levelIndex / 16)) * (0.9 + diffScale)));
    const syntaxWave = Math.min(enemySlots, Math.max(1, Math.floor(syntaxWaveRaw * obstacleScale)));
    const bugWave = Math.min(enemySlots - syntaxWave, Math.max(0, Math.floor(bugWaveRaw * obstacleScale)));
    for (let i = 0; i < syntaxWave; i += 1) {
      spawnAirEnemy('syntax', aheadX + (Math.random() - 0.5) * 220, groundY);
    }
    for (let i = 0; i < bugWave; i += 1) {
      spawnAirEnemy('bug', aheadX + (Math.random() - 0.5) * 220, groundY);
    }
    setMessage(`Enemy wave at ${Math.floor(nextEnemyWaveDistance)}m!`, 900);
  }

  function setTheme() {
    const theme = themeIds[levelIndex % themeIds.length];
    root.dataset.theme = theme;
  }

  function triggerGameOver() {
    const overlay = qs('#bwGameOver');
    gameOver = true;
    keys.left = false;
    keys.right = false;
    keys.jump = false;
    if (overlay) {
      overlay.textContent = 'Benny needs a nap\nTry again later.';
      overlay.classList.add('is-visible');
    }
    setTimeout(() => {
      gameOver = false;
      points = 0;
      saveProgress('auto');
      if (overlay) {
        overlay.classList.remove('is-visible');
        overlay.textContent = '';
      }
      startLevel();
    }, 4000);
  }

  function triggerFlip() {
    benny.classList.remove('bw-benny--flip');
    requestAnimationFrame(() => benny.classList.add('bw-benny--flip'));
    flipActiveUntil = performance.now() + 500;
  }

  function refreshAreaMetrics() {
    const rect = area.getBoundingClientRect();
    areaWidth = rect.width;
    areaHeight = rect.height;
  }

  function setEntityScreenX(entity, x) {
    if (entity._sx !== undefined && Math.abs(entity._sx - x) < renderEpsilon) return;
    entity._sx = x;
    entity.el.style.left = `${x}px`;
  }

  function setEntityScreenY(entity, y) {
    if (entity._sy !== undefined && Math.abs(entity._sy - y) < renderEpsilon) return;
    entity._sy = y;
    entity.el.style.top = `${y}px`;
  }

  function setEntityVisible(entity, visible) {
    if (entity._visible === visible) return;
    entity._visible = visible;
    entity.el.style.display = visible ? '' : 'none';
  }

  function addPlatform(x, y, w, h, type = 'desk') {
    const el = document.createElement('div');
    el.className = `bw-platform ${type}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    area.appendChild(el);
    platforms.push({ x, y, w, h, el, vx: 0, _sx: x, _sy: y, _visible: true });
  }

  function addObstacle(x, y, w, h, type = 'eraser') {
    const el = document.createElement('div');
    el.className = `bw-obstacle ${type}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    area.appendChild(el);
    obstacles.push({ x, y, w, h, vx: 0, vy: 0, el, type, _sx: x, _sy: y, _visible: true });
  }

  function addFallingNumber(x, y, value) {
    const size = 28;
    const el = document.createElement('div');
    el.className = 'bw-obstacle falling-number';
    el.textContent = value;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    area.appendChild(el);
    obstacles.push({ x, y, w: size, h: size, vx: 0, vy: 1.2, el, type: 'falling-number', _sx: x, _sy: y, _visible: true });
  }

  function spawnBlackHolePartPickup(levelWidth, groundY, safePath = []) {
    clearBlackHolePartOnMap();
    if (blackHoleReady) return;
    const neededPart = getBlackHoleNeededPartForLevel(levelIndex);
    if (!neededPart || blackHolePartsCollected[neededPart]) return;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const size = 26;
    const label = blackHolePartMeta[neededPart];
    const segmentByPart = {
      core: [0.12, 0.38],
      fuelCell: [0.4, 0.68],
      lens: [0.7, 0.92]
    };
    const [segStart, segEnd] = segmentByPart[neededPart] || [0.15, 0.85];
    const startX = levelWidth * segStart;
    const endX = levelWidth * segEnd;
    const safeCandidates = safePath.filter((p) => p.x >= startX && p.x <= endX);
    const anchorPool = safeCandidates.length > 0 ? safeCandidates : safePath;
    const anchor = anchorPool.length > 0
      ? anchorPool[Math.floor(Math.random() * anchorPool.length)]
      : { x: 160 + Math.random() * Math.max(1, levelWidth - 260), y: groundY - 120, w: 60 };

    const preferDesktop = Math.random() < 0.6;
    const desktopPlatforms = platforms.filter((p) => !p.el.classList.contains('ground') && !p.vx);
    const nearbyDesktops = desktopPlatforms.filter((p) => Math.abs((p.x + p.w / 2) - anchor.x) <= 180);
    const desktopPool = nearbyDesktops.length > 0 ? nearbyDesktops : desktopPlatforms;
    const useDesktop = preferDesktop && desktopPlatforms.length > 0;
    const chosenDesktop = useDesktop
      ? desktopPool[Math.floor(Math.random() * desktopPool.length)]
      : null;
    const spawnX = useDesktop
      ? chosenDesktop.x + Math.max(0, (chosenDesktop.w - size) / 2)
      : clamp(anchor.x + (Math.random() - 0.5) * 180, 120, levelWidth - 120);
    const spawnY = useDesktop
      ? chosenDesktop.y - 30
      : groundY - 34;

    const el = document.createElement('div');
    el.className = 'bw-blackhole-part';
    el.textContent = label.token;
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      line-height: ${size}px;
      text-align: center;
      font-weight: 800;
      font-size: 13px;
      border-radius: 50%;
      color: #ffffff;
      background: radial-gradient(circle at 30% 30%, #7dd3fc 0%, #1d4ed8 70%);
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.9);
      z-index: 7;
      pointer-events: none;
    `;
    area.appendChild(el);
    activeBlackHolePart = { key: neededPart, x: spawnX, y: spawnY, w: size, h: size, el };
    el.style.left = `${spawnX}px`;
    el.style.top = `${spawnY}px`;
  }

  function buildLevel() {
    // Save persistent FX/boss nodes before clearing
    const savedBlackHole = blackHole;
    const savedCrumblingFloor = crumblingFloor;
    const savedDebugKing = debugKing;
    const savedBossArena = bossArena;
    const savedSyntaxIntro = syntaxIntroOverlay;
    const savedPostVictory = postVictoryOverlay;
    
    area.innerHTML = '';
    clearBlackHolePartOnMap();
    platforms = [];
    obstacles.splice(0, obstacles.length);
    airEnemies.forEach((enemy) => enemy.el.remove());
    airEnemies.splice(0, airEnemies.length);
    enemyErrors.forEach((proj) => proj.el.remove());
    enemyErrors = [];
    bennyShots.forEach((shot) => shot.el.remove());
    bennyShots = [];
    slowUntil = 0;
    freezeUntil = 0;
    nextEnemyWaveDistance = 500;
    distance = 0;
    cameraOffset = 0;
    bennyState = { x: 40, y: 0, vx: 0, vy: 0, onGround: false };
    glideActive = false;
    deskPlaneActive = false;
    deskPlaneEndsAt = 0;
    deskFuel = loadDeskFuel();

    refreshAreaMetrics();
    const groundY = areaHeight - 40;
    const viewportWidth = areaWidth;
    
    // Make level MUCH wider - extends far beyond viewport
    const levelWidth = Math.min(
      levelWidthMax,
      viewportWidth * (levelWidthBaseMultiplier + levelIndex * levelWidthPerLevelMultiplier)
    );
    currentLevelWidth = levelWidth;
    
    // Ground spans entire level
    addPlatform(0, groundY, levelWidth, 40, 'ground');

    const safePath = [];
    // Create safe path from start to end of level
    const pathSteps = Math.min(maxPathSteps, Math.floor(levelWidth / 80));
    const startX = 60;
    const endX = levelWidth - 120;
    const stepX = (endX - startX) / pathSteps;
    let lastY = groundY - 120;
    for (let i = 0; i <= pathSteps; i += 1) {
      const w = 60 + Math.random() * 25;
      const x = startX + stepX * i;
      const yShift = (Math.random() - 0.5) * 100;
      const y = Math.max(80, Math.min(groundY - 120, lastY + yShift));
      lastY = y;
      safePath.push({ x, y, w, h: 10 });
      addPlatform(x, y, w, 10, 'desk');
    }

    const extraCount = Math.max(
      12,
      Math.floor((20 + Math.min(40, Math.floor(levelIndex / 2))) * extraPlatformScale)
    );
    for (let i = 0; i < extraCount; i += 1) {
      const w = 55 + Math.random() * 40;
      const x = 60 + Math.random() * (levelWidth - w - 60);
      const y = 80 + Math.random() * (groundY - 140);
      addPlatform(x, y, w, 10, 'desk');
    }

    // Add moving desks throughout level
    const movingDeskCount = Math.max(3, Math.floor((5 + Math.floor(levelIndex / 4)) * movingDeskScale));
    for (let m = 0; m < movingDeskCount; m += 1) {
      const moverW = 55;
      const moverX = 80 + (m * (levelWidth / (movingDeskCount + 1)));
      const moverY = groundY - 80 - (m % 2) * 60;
      const mover = { x: moverX, y: moverY, w: moverW, h: 10, vx: 1.2 * getDifficultyScale() };
      addPlatform(mover.x, mover.y, mover.w, mover.h, 'desk moving');
      platforms[platforms.length - 1].vx = mover.vx;
    }

    const eraserCount = Math.max(
      4,
      Math.floor((5 + Math.min(10, Math.floor(levelIndex / 3))) * getDifficultyScale() * obstacleScale)
    );
    for (let i = 0; i < eraserCount; i += 1) {
      const w = 24;
      const h = 12;
      const x = 40 + Math.random() * (levelWidth - w - 80);
      const y = groundY - h;
      const speed = (Math.random() * 1.2 + 0.6) * getDifficultyScale() * (Math.random() < 0.5 ? -1 : 1);
      addObstacle(x, y, w, h, 'eraser');
      obstacles[obstacles.length - 1].vx = speed;
    }

    const fallingCount = Math.max(4, Math.floor((levelIndex + 5) * getDifficultyScale() * obstacleScale));
    for (let i = 0; i < fallingCount; i += 1) {
      const w = 40;
      const h = 8;
      const x = 80 + Math.random() * (levelWidth - w - 160);
      addObstacle(x, 24, w, h, 'falling');
    }

    const numberCount = Math.max(
      4,
      Math.floor((5 + Math.floor(levelIndex / 2)) * getDifficultyScale() * obstacleScale)
    );
    for (let i = 0; i < numberCount; i += 1) {
      const x = 40 + Math.random() * (levelWidth - 80);
      const value = `-${1 + Math.floor(Math.random() * 9)}`;
      addFallingNumber(x, 24, value);
    }

    // Re-append Benny, star, FX and boss elements
    area.appendChild(benny);
    area.appendChild(star);
    area.appendChild(savedBlackHole);
    area.appendChild(savedCrumblingFloor);
    area.appendChild(savedBossArena);
    area.appendChild(savedDebugKing);
    area.appendChild(savedSyntaxIntro);
    area.appendChild(savedPostVictory);

    const lastPath = safePath[safePath.length - 1];
    const starX = lastPath ? lastPath.x + lastPath.w / 2 : areaWidth - 70;
    const starY = lastPath ? lastPath.y - 26 : 40 + Math.random() * (groundY - 120);
    starPos = { x: starX, y: starY };
    star.style.left = `${starX}px`;
    star.style.top = `${starY}px`;
    applyEasyTestStarPosition();

    if (bossActive) {
      blackHole.style.display = 'none';
    } else if (blackHoleReady) {
      blackHole.style.display = 'block';
      blackHole.style.opacity = canUseBlackHoleShortcut() ? '1' : '0.35';
    } else {
      blackHole.style.display = 'none';
    }

    spawnBlackHolePartPickup(levelWidth, groundY, safePath);

    benny.style.left = `${bennyState.x}px`;
    benny.style.top = `${groundY - 36}px`;
  }

  function applyPhysics() {
    if (gameOver) return;
    if (syntaxIntroActive || postVictoryActive) return;
    if (!areaWidth || !areaHeight) refreshAreaMetrics();
    const groundY = areaHeight - 40;
    if (bossActive) {
      blackHoleActive = false;
      blackHoleTimer = 0;
      crumblingFloor.classList.remove('crumpling');
      area.classList.remove('shake');
      blackHole.style.display = 'none';
    }

    if (!bossActive) {
      blackHoleActive = canUseBlackHoleShortcut();
      blackHole.style.display = blackHoleReady ? 'block' : 'none';
      blackHole.style.opacity = blackHoleActive ? '1' : '0.35';
      const nearShortcut = blackHoleActive && bennyState.x < 100 && bennyState.y > groundY - 90;
      if (nearShortcut) {
        if (triggerBlackHoleShortcut()) return;
      }
    }

    if (pendingSuperJump && bennyState.onGround) {
      bennyState.vy = -(jumpPower * 2.5);
      bennyState.vx = 0;
      bennyState.onGround = false;
      pendingSuperJump = false;
      
    }

    const now = performance.now();
    if (deskPlaneActive && now >= deskPlaneEndsAt) {
      deskPlaneActive = false;
      setMessage('Desk plane power depleted.', 1200);
    }
    const frozen = now < freezeUntil;
    const slowed = now < slowUntil;
    const planeRatio = deskPlaneRemainingRatio(now);
    let speedMultiplier = 1;
    if (deskPlaneActive) {
      if (planeRatio > 0.5) speedMultiplier = 2.1;
      else if (planeRatio > 0.25) speedMultiplier = 1.5;
      else speedMultiplier = 0.85;
    }
    if (slowed) speedMultiplier *= 0.55;
const speed = (bennyState.onGround ? moveSpeed * 1.2 : moveSpeed) * speedMultiplier;
    const moveLeft = mirroredControls ? keys.right : keys.left;
    const moveRight = mirroredControls ? keys.left : keys.right;
    
    // Keyboard input
    if (frozen) {
      bennyState.vx = 0;
      bennyState.vy = 0;
    } else if (moveLeft) bennyState.vx = -speed;
    else if (moveRight) bennyState.vx = speed;
    else {
      // Joystick input - only use if joystick is active and has horizontal input
      if (joystickActive && Math.abs(joystickVector.x) > 0.1) {
        const joyX = mirroredControls ? -joystickVector.x : joystickVector.x;
        bennyState.vx = joyX * speed;
      } else {
        bennyState.vx = 0;
      }
    }

    const wantsJump = !frozen && (keys.jump || (autoJump && bennyState.onGround));
    if (wantsJump && (bennyState.onGround || wallContact !== 0)) {
      const boost = bennyState.onGround ? 1.1 : 1;
      bennyState.vy = -(wallContact !== 0 ? wallJumpPower : jumpPower * boost);
      bennyState.onGround = false;
      if (wallContact !== 0) {
        bennyState.vx = wallContact * moveSpeed * 1.4;
      }
      wallContact = 0;
    }

    if (!frozen) {
      bennyState.vy = Math.min(maxFall, bennyState.vy + gravity);
    }
    if (deskPlaneActive) {
      if (planeRatio > 0.25) {
        bennyState.vy = Math.min(bennyState.vy, 0.75);
      } else {
        bennyState.vy = Math.max(bennyState.vy + 0.18, 1.8);
      }
      glideActive = false;
      benny.classList.add('bw-benny--glide');
    } else if (keys.glide && bennyState.vy > 0) {
      if (!glideActive) {
        glideActive = true;
      }
      bennyState.vy = Math.min(bennyState.vy, 1.4);
      benny.classList.add('bw-benny--glide');
    } else {
      glideActive = false;
      benny.classList.remove('bw-benny--glide');
    }
    bennyState.x += bennyState.vx;
    bennyState.y += bennyState.vy;

    // Allow Benny to move across the entire level width
    bennyState.x = Math.max(8, bennyState.x);

    const collisionMinX = bennyState.x - collisionBufferX;
    const collisionMaxX = bennyState.x + 36 + collisionBufferX;
    let landed = false;
    wallContact = 0;
    platforms.forEach((p) => {
      if (p.vx) {
        p.x += p.vx;
        if (p.x < 20 || p.x + p.w > areaWidth - 20) p.vx *= -1;
      }
      if (p.x > collisionMaxX || p.x + p.w < collisionMinX) return;

      const bx = bennyState.x;
      const by = bennyState.y;
      const bw = 36;
      const bh = 36;
      const overlapX = bx + bw > p.x && bx < p.x + p.w;
      const overlapY = by + bh > p.y && by + bh < p.y + p.h + 8;
      if (overlapX && overlapY && bennyState.vy >= 0) {
        bennyState.y = p.y - bh;
        bennyState.vy = 0;
        bennyState.onGround = true;
        landed = true;
      }

      const leftWall = Math.abs((bx + bw) - p.x) < 6 && by + bh > p.y && by < p.y + p.h;
      const rightWall = Math.abs(bx - (p.x + p.w)) < 6 && by + bh > p.y && by < p.y + p.h;
      if (leftWall) wallContact = 1;
      if (rightWall) wallContact = -1;
    });

    if (!landed) bennyState.onGround = false;
    if (bennyState.onGround) {
      glideActive = false;
      if (!deskPlaneActive) keys.glide = false;
    }

    obstacles.forEach((ob) => {
      if (ob.type === 'eraser') {
        ob.x += ob.vx;
        if (ob.x < 10 || ob.x + ob.w > areaWidth - 10) ob.vx *= -1;
      } else if (ob.type === 'falling') {
        if (!ob.vy) ob.vy = (0.6 + Math.random() * 0.8) * getDifficultyScale();
        ob.y += ob.vy;
        if (ob.y > groundY - ob.h) {
          ob.y = 24;
        }
      } else if (ob.type === 'falling-number') {
        if (!ob.vy) ob.vy = 1.2 * getDifficultyScale();
        ob.y += ob.vy;
        if (ob.y > groundY - ob.h) {
          ob.y = 24;
          ob.x = 30 + Math.random() * (areaWidth - 60);
        }
      }
      if (ob.x > collisionMaxX || ob.x + ob.w < collisionMinX) return;

      const bx = bennyState.x;
      const by = bennyState.y;
      const bw = 36;
      const bh = 36;
      const overlapX = bx + bw > ob.x && bx < ob.x + ob.w;
      const overlapY = by + bh > ob.y && by < ob.y + ob.h;
      if (overlapX && overlapY) {
        if (ob.type === 'falling-number') {
          if (performance.now() <= flipActiveUntil) {
            points += 50;
            setMessage('+50 points!', 800);
          } else {
            points = Math.max(0, points - 50);
            setMessage('-50 points!', 800);
          }
          ob.y = 24;
          ob.x = 30 + Math.random() * (areaWidth - 60);
          if (points === 0) {
            triggerGameOver();
            return;
          }
        } else {
          setMessage('Oof! Try again.', 1200);
          startLevel();
        }
      }
    });

    airEnemies.forEach((enemy) => {
      if (enemy.nextHopAt <= now && Math.abs(enemy.vy) < 0.2) {
        enemy.vy = -(7.8 + Math.random() * 3.2);
        enemy.nextHopAt = now + 520 + Math.random() * 720;
      }
      enemy.vy = Math.min(9, enemy.vy + gravity * 0.35);
      enemy.y += enemy.vy;
      enemy.x += enemy.vx;
      if (enemy.y > enemy.baseY) {
        enemy.y = enemy.baseY;
        enemy.vy = 0;
      }
      if (enemy.x < 12 || enemy.x + enemy.w > currentLevelWidth - 12) {
        enemy.vx *= -1;
      }
      if (enemy.nextThrowAt <= now && !frozen) {
        spawnEnemyError(enemy);
        enemy.nextThrowAt = now + 900 + Math.random() * 1400;
      }
      enemy.el.style.left = `${enemy.x - cameraOffset}px`;
      enemy.el.style.top = `${enemy.y}px`;
    });

    enemyErrors = enemyErrors.filter((proj) => {
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.el.style.left = `${proj.x - cameraOffset}px`;
      proj.el.style.top = `${proj.y}px`;
      const hit = !proj.returned && Math.abs((bennyState.x + 18) - proj.x) < 20 && Math.abs((bennyState.y + 18) - proj.y) < 20;
      if (hit) {
        const ownerAlive = proj.owner && airEnemies.includes(proj.owner);
        if (!ownerAlive) {
          proj.el.remove();
          return false;
        }
        const ownerX = proj.owner.x + proj.owner.w * 0.5;
        const ownerY = proj.owner.y + proj.owner.h * 0.5;
        const angle = Math.atan2(ownerY - proj.y, ownerX - proj.x);
        const speed = 5.4;
        proj.returned = true;
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
        proj.el.classList.add('reflected');
        proj.el.textContent = '↩️';
        setMessage('Bounce back!', 800);
        return true;
      }
      if (proj.returned) {
        if (!proj.owner || !airEnemies.includes(proj.owner)) {
          proj.el.remove();
          return false;
        }
        const ownerX = proj.owner.x + proj.owner.w * 0.5;
        const ownerY = proj.owner.y + proj.owner.h * 0.5;
        const angle = Math.atan2(ownerY - proj.y, ownerX - proj.x);
        const speed = 5.8;
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
        const hitOwner = Math.abs(ownerX - proj.x) < 22 && Math.abs(ownerY - proj.y) < 22;
        if (hitOwner) {
          awardEnemyElimination(proj.owner, 30);
          proj.el.remove();
          return false;
        }
      }
      const out = proj.x < cameraOffset - 90 || proj.x > cameraOffset + areaWidth + 90 || proj.y < -80 || proj.y > areaHeight + 80;
      if (out) {
        proj.el.remove();
        return false;
      }
      return true;
    });

    bennyShots = bennyShots.filter((shot) => {
      shot.x += shot.vx;
      shot.y += shot.vy;
      shot.el.style.left = `${shot.x - cameraOffset}px`;
      shot.el.style.top = `${shot.y}px`;

      const enemyProjIndex = enemyErrors.findIndex((proj) =>
        Math.abs(shot.x - proj.x) < 18 && Math.abs(shot.y - proj.y) < 18
      );
      if (enemyProjIndex !== -1) {
        const [blockedProj] = enemyErrors.splice(enemyProjIndex, 1);
        if (blockedProj && blockedProj.el) blockedProj.el.remove();
        points += 15;
        shot.el.remove();
        return false;
      }

      let hitEnemy = null;
      for (let i = 0; i < airEnemies.length; i += 1) {
        const enemy = airEnemies[i];
        const withinX = shot.x >= enemy.x && shot.x <= enemy.x + enemy.w;
        const withinY = shot.y >= enemy.y && shot.y <= enemy.y + enemy.h;
        if (withinX && withinY) {
          hitEnemy = enemy;
          break;
        }
      }
      if (hitEnemy) {
        hitEnemy.hp -= shot.damage;
        if (hitEnemy.hp <= 0) {
          awardEnemyElimination(hitEnemy, shot.killBonus || 0);
        }
        if (shot.splashRadius > 0 && shot.splashDamage > 0) {
          applySplashDamage(shot, hitEnemy);
        }
        if (shot.freezeMs > 0) {
          freezeUntil = Math.max(freezeUntil, now + shot.freezeMs);
        }
        if (shot.clearChance > 0 && Math.random() < shot.clearChance) {
          const cleared = clearAllAirEnemies('Power wipe! Screen cleared.', shot.killBonus || 0);
          if (cleared > 0) {
            shot.el.remove();
            return false;
          }
        }

        if (shot.pierceLeft > 0) {
          shot.pierceLeft -= 1;
        } else {
          shot.el.remove();
          return false;
        }
      }
      const out = shot.x < cameraOffset - 120 || shot.x > cameraOffset + areaWidth + 120 || shot.y < -120 || shot.y > areaHeight + 120;
      if (out) {
        shot.el.remove();
        return false;
      }
      return true;
    });

    if (bennyState.y > groundY) {
      bennyState.y = groundY - 36;
      bennyState.vy = 0;
      bennyState.onGround = true;
    }

    if (activeBlackHolePart) {
      const bx = bennyState.x;
      const by = bennyState.y;
      const bw = 36;
      const bh = 36;
      const overlapX = bx + bw > activeBlackHolePart.x && bx < activeBlackHolePart.x + activeBlackHolePart.w;
      const overlapY = by + bh > activeBlackHolePart.y && by < activeBlackHolePart.y + activeBlackHolePart.h;
      if (overlapX && overlapY) {
        collectBlackHolePart(activeBlackHolePart.key);
      }
    }

    distance += Math.abs(bennyState.vx) * 0.2;
    
    // Camera follow: Keep Benny in left 25% of viewport
    const cameraTarget = bennyState.x - areaWidth * 0.25;
    cameraOffset = Math.max(0, cameraTarget);

    const minVisibleX = -offscreenRenderBuffer;
    const maxVisibleX = areaWidth + offscreenRenderBuffer;

    // Update visible platform positions with camera offset.
    platforms.forEach((p) => {
      const sx = p.x - cameraOffset;
      const visible = sx + p.w >= minVisibleX && sx <= maxVisibleX;
      setEntityVisible(p, visible);
      if (visible) setEntityScreenX(p, sx);
    });

    // Update visible obstacle positions with camera offset.
    obstacles.forEach((ob) => {
      const sx = ob.x - cameraOffset;
      const visible = sx + ob.w >= minVisibleX && sx <= maxVisibleX;
      setEntityVisible(ob, visible);
      if (!visible) return;
      setEntityScreenX(ob, sx);
      setEntityScreenY(ob, ob.y);
    });
    
    // Update star position with camera offset
    star.style.left = `${starPos.x - cameraOffset}px`;

    if (activeBlackHolePart && activeBlackHolePart.el) {
      activeBlackHolePart.el.style.left = `${activeBlackHolePart.x - cameraOffset}px`;
      activeBlackHolePart.el.style.top = `${activeBlackHolePart.y}px`;
    }
    
    // Update Benny with camera offset
    benny.style.left = `${bennyState.x - cameraOffset}px`;
    benny.style.top = `${bennyState.y}px`;
    benny.classList.toggle('bw-benny--nuclear', activeTier() === 6);

    if (bossActive) {
      const now = performance.now();
      bossX += Math.sin(now / 500) * 0.8;
      bossY += Math.cos(now / 800) * 0.5;
      debugKing.style.left = `${bossX - cameraOffset}px`;
      debugKing.style.top = `${bossY}px`;

      if (bossPhase === 1 && bossHealth <= 8) {
        bossPhase = 2;
        mirroredControls = true;
        setMessage('Phase 2 - Logic Illusions (controls mirrored!)', 1600);
      } else if (bossPhase === 2 && bossHealth <= 4) {
        bossPhase = 3;
        mirroredControls = false;
        bossPatternProgress = 0;
        bossPatternGraceUntil = 0;
        spawnBossPatternNodes();
        setMessage('Phase 3 - Infinite Loop Arena. Solve the pattern!', 1800);
      }

      const spawnEvery = bossSpawnMs[bossPhase] || 700;
      if (now - bossLastSpawnAt >= spawnEvery) {
        const projectileType = bossPhase === 2 ? 'illusion' : 'syntax';
        spawnBossProjectile(projectileType);
        bossLastSpawnAt = now;
      }

      bossProjectiles = bossProjectiles.filter((proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.el.style.left = `${proj.x - cameraOffset}px`;
        proj.el.style.top = `${proj.y}px`;
        const hitBenny = Math.abs((bennyState.x + 18) - proj.x) < 24 && Math.abs((bennyState.y + 18) - proj.y) < 24;
        if (hitBenny) {
          points = Math.max(0, points - (proj.type === 'illusion' ? 40 : 25));
          setMessage(proj.type === 'illusion' ? 'Fake answer trap! -40' : 'Syntax hit! -25', 900);
          proj.el.remove();
          return false;
        }
        const tooFar = proj.x < cameraOffset - 120 || proj.x > cameraOffset + areaWidth + 120 || proj.y > areaHeight + 80 || proj.y < -80;
        if (tooFar) {
          proj.el.remove();
          return false;
        }
        return true;
      });

      if (bossPhase === 3) {
        const arenaCenterX = bossX - 40;
        const arenaCenterY = bossY + 30;
        const dxArena = (bennyState.x + 18) - arenaCenterX;
        const dyArena = (bennyState.y + 18) - arenaCenterY;
        const maxR = 180;
        bossArena.style.left = `${arenaCenterX - maxR - cameraOffset}px`;
        bossArena.style.top = `${arenaCenterY - maxR}px`;

        bossPatternNodes.forEach((node) => {
          node.el.style.left = `${node.x - cameraOffset}px`;
          node.el.style.top = `${node.y}px`;
          const hit = Math.abs((bennyState.x + 18) - node.x) < 34 && Math.abs((bennyState.y + 18) - node.y) < 34;
          if (!hit || node.done) return;
          const expected = bossPatternSequence[bossPatternProgress];
          const graceActive = now < bossPatternGraceUntil;
          if (node.label === expected) {
            node.done = true;
            node.el.classList.add('done');
            bossPatternProgress += 1;
            bossPatternGraceUntil = now + 450;
            setMessage(`Pattern ${bossPatternProgress}/${bossPatternSequence.length}`, 700);
            if (bossPatternProgress >= bossPatternSequence.length) {
              finishDebugKingFight();
            }
          } else if (!graceActive) {
            bossPatternProgress = 0;
            bossPatternGraceUntil = 0;
            bossPatternNodes.forEach((n) => {
              n.done = false;
              n.el.classList.remove('done');
            });
            setMessage('Infinite loop reset. Find 2x -> 4x -> 8x', 1200);
          }
        });
      }
    }
  }

  function registerPress(list) {
    const now = performance.now();
    list.push(now);
    while (list.length > 3) list.shift();
    if (list.length === 3 && now - list[0] <= 650) {
      list.length = 0;
      return true;
    }
    return false;
  }

  function tryBreakPlatform() {
    if (!bennyState.onGround) return;
    const bx = bennyState.x;
    const by = bennyState.y;
    const bw = 36;
    const bh = 36;
    const idx = platforms.findIndex(p => {
      if (p.el.classList.contains('ground')) return false;
      const overlapX = bx + bw > p.x && bx < p.x + p.w;
      const overlapY = Math.abs((by + bh) - p.y) < 6;
      return overlapX && overlapY;
    });
    if (idx === -1) return;
    const [platform] = platforms.splice(idx, 1);
    if (platform.el && platform.el.parentNode) platform.el.parentNode.removeChild(platform.el);
    bennyState.onGround = false;
    setMessage('Desk cracked!', 900);
  }

  function checkGoal() {
    if (bossActive || syntaxIntroActive || postVictoryActive) return;
    // Use the stored star position instead of getBoundingClientRect
    const hit = bennyState.x + 30 > starPos.x && bennyState.x < starPos.x + 30 && bennyState.y + 30 > starPos.y && bennyState.y < starPos.y + 30;
    if (hit) {
      const isFinalLevel = levelIndex === totalLevels - 1;
      if (isFinalLevel && !bossWonThisLevel) {
        points += 200;
        saveProgress('auto');
        setMessage('Level 75 cleared. Syntax Queen intro starts!', 1600);
        startSyntaxQueenIntro();
        return;
      }
      points += 200;
      levelIndex = Math.min(totalLevels - 1, levelIndex + 1);
      // Keep boss completion state on the final level so the encounter
      // does not re-trigger on every star touch after victory.
      if (!isFinalLevel) bossWonThisLevel = false;
      saveProgress('auto');
      setMessage('Desk Dash cleared!', 1200);
      startLevel();
    }
  }

  function tick() {
    updatePostVictorySequence();
    updateSyntaxQueenIntro();
    applyPhysics();
    while (distance >= nextEnemyWaveDistance) {
      spawnDistanceEnemyWave();
      nextEnemyWaveDistance += 500;
    }
    checkGoal();
    updateHud();
    const now = performance.now();
    if (!gameOver && now - lastAutoSaveAt >= 15000) {
      saveProgress('auto');
      lastAutoSaveAt = now;
    }
    if (bennyState.vx < -0.1) {
      benny.classList.add('bw-benny--left');
    } else if (bennyState.vx > 0.1) {
      benny.classList.remove('bw-benny--left');
    }
    rafId = requestAnimationFrame(tick);
  }

  function startLevel() {
    stopPostVictorySequence(false);
    stopSyntaxQueenIntro(false, true);
    applyEasyTestStartLevel();
    setBossMode(false);
    syncBlackHoleWindowForLevel();
    applyBennyColor();
    setTheme();
    if (levelLabel) levelLabel.textContent = `Level ${levelIndex + 1}`;
    buildLevel();
    applyEasyTestStartDistance();
    const activePower = getShotPowerConfig().powerName;
    setMessage(`Active power: ${activePower}`, 1200);
    saveProgress('auto');
  }

  if (difficultySelect) {
    difficulty = normalizeDifficulty(difficultySelect.value || 'easy');
    loadProgress(false);
    applyEasyTestStartLevel();
    root.dataset.difficulty = difficulty;
    difficultySelect.addEventListener('change', () => {
      difficulty = normalizeDifficulty(difficultySelect.value || 'easy');
      root.dataset.difficulty = difficulty;
      if (!loadProgress(false)) {
        levelIndex = 0;
        points = 0;
        distance = 0;
        bossWonThisLevel = false;
        resetBlackHolePartsForWindow(0);
        blackHoleCooldownUntilLevel = 0;
      }
      applyEasyTestStartLevel();
      saveProgress('auto');
      startLevel();
    });
  }

  let cleanupProgressBtn = () => {};
  if (progressBtn) {
    const onProgressClick = (e) => {
      e.preventDefault();
      saveProgress('manual');
    };
    progressBtn.addEventListener('click', onProgressClick);
    cleanupProgressBtn = () => progressBtn.removeEventListener('click', onProgressClick);
  }

  function bindKeyEvents() {
    const down = (e) => {
      if (syntaxIntroActive || postVictoryActive) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        keys.jump = true;
        triggerFlip();
        triggerBossPulse();
        if (registerPress(upPresses)) {
          pendingSuperJump = true;
        }
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        if (registerPress(downPresses)) {
          tryBreakPlatform();
        }
      }
      if (e.key === 'Shift') keys.glide = true;
    };
    const up = (e) => {
      if (syntaxIntroActive || postVictoryActive) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.jump = false;
      if (e.key === 'Shift') keys.glide = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }

  function bindButton(btn, key, pressed) {
    if (!btn) return () => {};
    const clearJumpPulse = () => {
      if (jumpPulseTimer) {
        clearTimeout(jumpPulseTimer);
        jumpPulseTimer = 0;
      }
    };
    const onDown = (e) => {
      e.preventDefault();
      if (syntaxIntroActive || postVictoryActive) return;
      if (key === 'jump') {
        // Use a short pulse on mobile taps so jump always triggers at least once.
        keys.jump = true;
        triggerFlip();
        triggerBossPulse();
        clearJumpPulse();
        jumpPulseTimer = setTimeout(() => {
          keys.jump = false;
          jumpPulseTimer = 0;
        }, 160);
        return;
      }
      keys[key] = pressed;
    };
    const onUp = (e) => {
      e.preventDefault();
      if (syntaxIntroActive || postVictoryActive) return;
      if (key === 'jump') {
        clearJumpPulse();
      }
      keys[key] = false;
    };
    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointerleave', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('touchstart', onDown, { passive: false });
    btn.addEventListener('touchend', onUp, { passive: false });
    btn.addEventListener('touchcancel', onUp, { passive: false });
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('mouseup', onUp);
    return () => {
      clearJumpPulse();
      btn.removeEventListener('pointerdown', onDown);
      btn.removeEventListener('pointerup', onUp);
      btn.removeEventListener('pointerleave', onUp);
      btn.removeEventListener('pointercancel', onUp);
      btn.removeEventListener('touchstart', onDown);
      btn.removeEventListener('touchend', onUp);
      btn.removeEventListener('touchcancel', onUp);
      btn.removeEventListener('mousedown', onDown);
      btn.removeEventListener('mouseup', onUp);
    };
  }

  function bindActionButton(btn, action) {
    if (!btn) return () => {};
    const onDown = (e) => {
      e.preventDefault();
      if (syntaxIntroActive || postVictoryActive) return;
      action();
    };
    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('touchstart', onDown, { passive: false });
    btn.addEventListener('click', onDown);
    return () => {
      btn.removeEventListener('pointerdown', onDown);
      btn.removeEventListener('touchstart', onDown);
      btn.removeEventListener('click', onDown);
    };
  }

const cleanupKeys = bindKeyEvents();
  const cleanupLeft = bindButton(leftBtn, 'left', true);
  const cleanupRight = bindButton(rightBtn, 'right', true);
  const cleanupJump = bindButton(jumpBtn, 'jump', true);
  const cleanupGlide = bindButton(glideBtn, 'glide', true);
  const cleanupPlane = bindActionButton(planeBtn, triggerDeskPlane);
  const cleanupFire = bindActionButton(fireBtn, fireBennyShot);
  refreshAreaMetrics();
  const handleResize = () => refreshAreaMetrics();
  window.addEventListener('resize', handleResize);

  // Joystick event handlers
  function handleJoystickStart(clientX, clientY) {
    if (!joystick) return;
    const rect = joystick.getBoundingClientRect();
    joystickCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    joystickActive = true;
    handleJoystickMove(clientX, clientY);
  }

  function handleJoystickMove(clientX, clientY) {
    if (!joystickActive || !joystickKnob) return;
    
    const dx = clientX - joystickCenter.x;
    const dy = clientY - joystickCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = joystickRadius;
    const clampedDist = Math.min(dist, maxDist);
    const ratio = maxDist > 0 ? clampedDist / maxDist : 0;
    
    // Calculate clamped position
    const clampedX = (dx / dist) * clampedDist || 0;
    const clampedY = (dy / dist) * clampedDist || 0;
    
    // Update knob visual position
    joystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    
    // Set joystick vector (-1 to 1 for each axis)
    joystickVector = {
      x: clampedX / maxDist,
      y: clampedY / maxDist
    };
  }

  function handleJoystickEnd() {
    if (!joystickKnob) return;
    joystickActive = false;
    joystickVector = { x: 0, y: 0 };
    joystickKnob.style.transform = 'translate(0, 0)';
  }

  // Touch events for joystick
  if (joystick) {
    joystick.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleJoystickStart(touch.clientX, touch.clientY);
    }, { passive: false });

    joystick.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleJoystickMove(touch.clientX, touch.clientY);
    }, { passive: false });

    joystick.addEventListener('touchend', handleJoystickEnd);
    joystick.addEventListener('touchcancel', handleJoystickEnd);
    
    // Mouse events for testing on desktop
    joystick.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleJoystickStart(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (joystickActive) {
        handleJoystickMove(e.clientX, e.clientY);
      }
    });
    
    document.addEventListener('mouseup', handleJoystickEnd);
  }

  startLevel();
  rafId = requestAnimationFrame(tick);

  window.__BennyWorldCleanup = () => {
    stopPostVictorySequence(false);
    stopSyntaxQueenIntro(false, true);
    saveProgress('auto');
    if (rafId) cancelAnimationFrame(rafId);
    airEnemies.forEach((enemy) => enemy.el.remove());
    enemyErrors.forEach((proj) => proj.el.remove());
    bennyShots.forEach((shot) => shot.el.remove());
    if (jumpPulseTimer) {
      clearTimeout(jumpPulseTimer);
      jumpPulseTimer = 0;
    }
    keys.jump = false;
    keys.glide = false;
    cleanupKeys();
    cleanupLeft();
    cleanupRight();
    cleanupJump();
    cleanupGlide();
    cleanupPlane();
    cleanupFire();
    window.removeEventListener('resize', handleResize);
    cleanupProgressBtn();
    // Also call the Babylon cleanup if present
    if (window.__BennyWorldBabylonCleanup) {
      try { window.__BennyWorldBabylonCleanup(); } catch (e) {}
      window.__BennyWorldBabylonCleanup = null;
    }
  };
})();
