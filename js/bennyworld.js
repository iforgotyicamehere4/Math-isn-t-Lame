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
  const leftBtn = qs('#bwLeft');
  const rightBtn = qs('#bwRight');
  const jumpBtn = qs('#bwJump');
  const glideBtn = qs('#bwGlide');

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

  const totalLevels = 100;
  let levelIndex = 0;
  let points = 0;
  let distance = 0;
  let difficulty = 'mathanomical';

  const gravity = 0.55;
  const jumpPower = 11.5;
  const wallJumpPower = 14.5;
  const moveSpeed = 3.2;
  const maxFall = 12;
  const autoJump = true;

  const keys = { left: false, right: false, jump: false, glide: false };
  let rafId = 0;

  const benny = document.createElement('div');
  benny.className = 'bw-benny';
  benny.innerHTML = '<div class="benny-base"><div class="benny-shape"><div class="back"></div><div class="leg-left"></div><div class="leg-right"></div><div class="head"></div></div></div>';
  const star = document.createElement('div');
  star.className = 'bw-star';
  star.textContent = '★';

  let bennyState = { x: 40, y: 0, vx: 0, vy: 0, onGround: false };
  let starPos = { x: 0, y: 0 };
  let cameraOffset = 0;
  let platforms = [];
  const obstacles = [];
  let wallContact = 0;
  let gameOver = false;
  let flipActiveUntil = 0;
  let glideCharges = 2;
  let glideActive = false;
  let pendingSuperJump = false;
  const upPresses = [];
  const downPresses = [];

  function setMessage(text, holdMs = 1400) {
    if (!msgEl) return;
    msgEl.textContent = text;
    if (holdMs <= 0) return;
    setTimeout(() => {
      if (msgEl.textContent === text) msgEl.textContent = '';
    }, holdMs);
  }

  function updateHud() {
    if (pointsEl) pointsEl.textContent = `Points: ${points}`;
    if (dashEl) dashEl.textContent = `Dash: ${Math.floor(distance)}m`;
    if (statusEl) statusEl.textContent = 'Run to the star!';
  }

  function getDifficultyScale() {
    if (difficulty === 'easy') return 0.5;
    if (difficulty === 'medium') return 0.75;
    return 1;
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
      if (overlay) {
        overlay.classList.remove('is-visible');
        overlay.textContent = '';
      }
      startLevel();
    }, 4000);
  }

  function triggerFlip() {
    benny.classList.remove('bw-benny--flip');
    void benny.offsetWidth;
    benny.classList.add('bw-benny--flip');
    flipActiveUntil = performance.now() + 500;
  }

  function addPlatform(x, y, w, h, type = 'desk') {
    const el = document.createElement('div');
    el.className = `bw-platform ${type}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    area.appendChild(el);
    platforms.push({ x, y, w, h, el, vx: 0 });
  }

  function addObstacle(x, y, w, h, type = 'eraser') {
    const el = document.createElement('div');
    el.className = `bw-obstacle ${type}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    area.appendChild(el);
    obstacles.push({ x, y, w, h, vx: 0, vy: 0, el, type });
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
    obstacles.push({ x, y, w: size, h: size, vx: 0, vy: 1.2, el, type: 'falling-number' });
  }

  function buildLevel() {
    area.innerHTML = '';
    platforms = [];
    obstacles.splice(0, obstacles.length);
    distance = 0;
    cameraOffset = 0;
    bennyState = { x: 40, y: 0, vx: 0, vy: 0, onGround: false };
    glideCharges = 2;
    glideActive = false;

    const rect = area.getBoundingClientRect();
    const groundY = rect.height - 40;
    const viewportWidth = rect.width;
    
    // Make level MUCH wider - extends far beyond viewport
    const levelWidth = viewportWidth * (8 + levelIndex * 2);
    
    // Ground spans entire level
    addPlatform(0, groundY, levelWidth, 40, 'ground');

    const safePath = [];
    // Create safe path from start to end of level
    const pathSteps = Math.floor(levelWidth / 80);
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

    const extraCount = 20 + Math.min(40, Math.floor(levelIndex / 2));
    for (let i = 0; i < extraCount; i += 1) {
      const w = 55 + Math.random() * 40;
      const x = 60 + Math.random() * (levelWidth - w - 60);
      const y = 80 + Math.random() * (groundY - 140);
      addPlatform(x, y, w, 10, 'desk');
    }

    // Add moving desks throughout level
    const movingDeskCount = 5 + Math.floor(levelIndex / 4);
    for (let m = 0; m < movingDeskCount; m += 1) {
      const moverW = 55;
      const moverX = 80 + (m * (levelWidth / (movingDeskCount + 1)));
      const moverY = groundY - 80 - (m % 2) * 60;
      const mover = { x: moverX, y: moverY, w: moverW, h: 10, vx: 1.2 * getDifficultyScale() };
      addPlatform(mover.x, mover.y, mover.w, mover.h, 'desk moving');
      platforms[platforms.length - 1].vx = mover.vx;
    }

    const eraserCount = Math.max(5, Math.ceil((5 + Math.min(10, Math.floor(levelIndex / 3))) * getDifficultyScale()));
    for (let i = 0; i < eraserCount; i += 1) {
      const w = 24;
      const h = 12;
      const x = 40 + Math.random() * (levelWidth - w - 80);
      const y = groundY - h;
      const speed = (Math.random() * 1.2 + 0.6) * getDifficultyScale() * (Math.random() < 0.5 ? -1 : 1);
      addObstacle(x, y, w, h, 'eraser');
      obstacles[obstacles.length - 1].vx = speed;
    }

    const fallingCount = Math.max(5, Math.ceil((levelIndex + 5) * getDifficultyScale()));
    for (let i = 0; i < fallingCount; i += 1) {
      const w = 40;
      const h = 8;
      const x = 80 + Math.random() * (levelWidth - w - 160);
      addObstacle(x, 24, w, h, 'falling');
    }

    const numberCount = Math.max(5, Math.ceil((5 + Math.floor(levelIndex / 2)) * getDifficultyScale()));
    for (let i = 0; i < numberCount; i += 1) {
      const x = 40 + Math.random() * (levelWidth - 80);
      const value = `-${1 + Math.floor(Math.random() * 9)}`;
      addFallingNumber(x, 24, value);
    }

    area.appendChild(benny);
    area.appendChild(star);

    const lastPath = safePath[safePath.length - 1];
    const starX = lastPath ? lastPath.x + lastPath.w / 2 : rect.width - 70;
    const starY = lastPath ? lastPath.y - 26 : 40 + Math.random() * (groundY - 120);
    starPos = { x: starX, y: starY };
    star.style.left = `${starX}px`;
    star.style.top = `${starY}px`;

    benny.style.left = `${bennyState.x}px`;
    benny.style.top = `${groundY - 36}px`;
  }

  function applyPhysics() {
    if (gameOver) return;
    const rect = area.getBoundingClientRect();
    const groundY = rect.height - 40;

    if (pendingSuperJump && bennyState.onGround) {
      bennyState.vy = -(jumpPower * 2.5);
      bennyState.vx = 0;
      bennyState.onGround = false;
      pendingSuperJump = false;
      
    }

    const speed = bennyState.onGround ? moveSpeed * 1.2 : moveSpeed;
    if (keys.left) bennyState.vx = -speed;
    else if (keys.right) bennyState.vx = speed;
    else bennyState.vx = 0;

    const wantsJump = keys.jump || (autoJump && bennyState.onGround);
    if (wantsJump && (bennyState.onGround || wallContact !== 0)) {
      const boost = bennyState.onGround ? 1.1 : 1;
      bennyState.vy = -(wallContact !== 0 ? wallJumpPower : jumpPower * boost);
      bennyState.onGround = false;
      if (wallContact !== 0) {
        bennyState.vx = wallContact * moveSpeed * 1.4;
      }
      wallContact = 0;
    }

    bennyState.vy = Math.min(maxFall, bennyState.vy + gravity);
    if (keys.glide && bennyState.vy > 0) {
      if (!glideActive) {
        if (glideCharges <= 0) {
          keys.glide = false;
        } else {
          glideCharges -= 1;
          glideActive = true;
        }
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

    let landed = false;
    wallContact = 0;
    platforms.forEach((p) => {
      if (p.vx) {
        p.x += p.vx;
        if (p.x < 20 || p.x + p.w > rect.width - 20) p.vx *= -1;
        p.el.style.left = `${p.x}px`;
      }

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
      keys.glide = false;
    }

    obstacles.forEach((ob) => {
      if (ob.type === 'eraser') {
        ob.x += ob.vx;
        if (ob.x < 10 || ob.x + ob.w > rect.width - 10) ob.vx *= -1;
        ob.el.style.left = `${ob.x}px`;
      } else if (ob.type === 'falling') {
        if (!ob.vy) ob.vy = (0.6 + Math.random() * 0.8) * getDifficultyScale();
        ob.y += ob.vy;
        if (ob.y > groundY - ob.h) {
          ob.y = 24;
        }
        ob.el.style.top = `${ob.y}px`;
      } else if (ob.type === 'falling-number') {
        if (!ob.vy) ob.vy = 1.2 * getDifficultyScale();
        ob.y += ob.vy;
        if (ob.y > groundY - ob.h) {
          ob.y = 24;
          ob.x = 30 + Math.random() * (rect.width - 60);
          ob.el.style.left = `${ob.x}px`;
        }
        ob.el.style.top = `${ob.y}px`;
      }

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
          ob.x = 30 + Math.random() * (rect.width - 60);
          ob.el.style.left = `${ob.x}px`;
          ob.el.style.top = `${ob.y}px`;
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

    if (bennyState.y > groundY) {
      bennyState.y = groundY - 36;
      bennyState.vy = 0;
      bennyState.onGround = true;
    }

    benny.style.left = `${bennyState.x}px`;
    benny.style.top = `${bennyState.y}px`;
    distance += Math.abs(bennyState.vx) * 0.2;
    
    // Camera follow: Keep Benny in left 25% of viewport
    const cameraTarget = bennyState.x - rect.width * 0.25;
    cameraOffset = Math.max(0, cameraTarget);
    
    // Update all platform positions with camera offset
    platforms.forEach(p => {
      p.el.style.left = `${p.x - cameraOffset}px`;
    });
    
    // Update all obstacle positions with camera offset
    obstacles.forEach(ob => {
      ob.el.style.left = `${ob.x - cameraOffset}px`;
    });
    
    // Update star position with camera offset
    star.style.left = `${starPos.x - cameraOffset}px`;
    
    // Update Benny with camera offset
    benny.style.left = `${bennyState.x - cameraOffset}px`;
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
    // Use the stored star position instead of getBoundingClientRect
    const hit = bennyState.x + 30 > starPos.x && bennyState.x < starPos.x + 30 && bennyState.y + 30 > starPos.y && bennyState.y < starPos.y + 30;
    if (hit) {
      points += 200;
      levelIndex = Math.min(totalLevels - 1, levelIndex + 1);
      setMessage('Desk Dash cleared!', 1200);
      startLevel();
    }
  }

  function tick() {
    applyPhysics();
    checkGoal();
    updateHud();
    if (bennyState.vx < -0.1) {
      benny.classList.add('bw-benny--left');
    } else if (bennyState.vx > 0.1) {
      benny.classList.remove('bw-benny--left');
    }
    rafId = requestAnimationFrame(tick);
  }

  function startLevel() {
    setTheme();
    if (levelLabel) levelLabel.textContent = `Level ${levelIndex + 1}`;
    buildLevel();
  }

  if (difficultySelect) {
    difficulty = difficultySelect.value || 'mathanomical';
    difficultySelect.addEventListener('change', () => {
      difficulty = difficultySelect.value || 'mathanomical';
      root.dataset.difficulty = difficulty;
      startLevel();
    });
  }

  function bindKeyEvents() {
    const down = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        keys.jump = true;
        triggerFlip();
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
    const onDown = (e) => {
      e.preventDefault();
      keys[key] = pressed;
      if (key === 'jump') triggerFlip();
    };
    const onUp = (e) => {
      e.preventDefault();
      keys[key] = false;
    };
    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointerleave', onUp);
    btn.addEventListener('pointercancel', onUp);
    return () => {
      btn.removeEventListener('pointerdown', onDown);
      btn.removeEventListener('pointerup', onUp);
      btn.removeEventListener('pointerleave', onUp);
      btn.removeEventListener('pointercancel', onUp);
    };
  }

  const cleanupKeys = bindKeyEvents();
  const cleanupLeft = bindButton(leftBtn, 'left', true);
  const cleanupRight = bindButton(rightBtn, 'right', true);
  const cleanupJump = bindButton(jumpBtn, 'jump', true);
  const cleanupGlide = bindButton(glideBtn, 'glide', true);

  startLevel();
  rafId = requestAnimationFrame(tick);

  window.__BennyWorldCleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    cleanupKeys();
    cleanupLeft();
    cleanupRight();
    cleanupJump();
    cleanupGlide();
    // Also call the Babylon cleanup if present
    if (window.__BennyWorldBabylonCleanup) {
      try { window.__BennyWorldBabylonCleanup(); } catch (e) {}
      window.__BennyWorldBabylonCleanup = null;
    }
  };
})();