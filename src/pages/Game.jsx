import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/game.css';

export default function Game() {
  if (typeof window !== 'undefined' && window.performance) {
    const Perf = window.Performance || window.performance.constructor;
    if (Perf && typeof Perf.now !== 'function') {
      Perf.now = () => window.performance.now();
    }
    if (!window.Performance) {
      window.Performance = Perf;
    }
  }
  useEffect(() => {
    let cancelled = false;
    
    // Request landscape orientation lock for mobile devices
    if (window.screen && window.screen.orientation) {
      try {
        window.screen.orientation.lock('landscape').catch(() => {
          // Silently fail if orientation lock not supported
        });
      } catch (e) {
        // Orientation lock not supported
      }
    }
    
    const loadScript = (src, key, options = {}) => new Promise(resolve => {
      const existing = document.querySelector(`script[data-script-key="${key}"]`);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = options.async ?? true;
      if (options.type) script.type = options.type;
      script.dataset.scriptKey = key;
      script.onload = () => resolve(script);
      document.body.appendChild(script);
    });

    loadScript('/js/math.js', 'mathjs', { async: false }).then(() => {
      if (cancelled) return null;
      return loadScript('/js/game.js', 'mathpup', { type: 'module' });
    });

    return () => {
      cancelled = true;
      // Unlock orientation when leaving the game
      if (window.screen && window.screen.orientation) {
        try {
          window.screen.orientation.unlock();
        } catch (e) {
          // Ignore
        }
      }
      const mathScript = document.querySelector('script[data-script-key="mathjs"]');
      if (mathScript && mathScript.parentNode) mathScript.parentNode.removeChild(mathScript);
      const gameScript = document.querySelector('script[data-script-key="mathpup"]');
      if (gameScript && gameScript.parentNode) gameScript.parentNode.removeChild(gameScript);
      if (window.__MathPupCleanup) window.__MathPupCleanup();
    };
  }, []);

  return (
    <main className="game-shell game-page--mathpup">
      <header className="game-shell__header">
        <Link to="/list" className="back-link" id="backBtn">Back</Link>
        <h1>Math Pup</h1>
        <div className="game-shell__controls controls">
          <label htmlFor="levelSelect">Level:</label>
          <select id="levelSelect" defaultValue="Easy">
            <option value="Easy">Easy (subtraction + addition)</option>
            <option value="Easy25">Easy25 (addition & subtraction)</option>
            <option value="Easy50">Easy50 (two-digit addition & subtraction)</option>
            <option value="Easy75">Easy75 (two-digit addition & subtraction)</option>
            <option value="Medium">Medium (multiplication & division)</option>
            <option value="Medium26">Medium26 (mul & div)</option>
            <option value="Medium60">Medium60 (mul & div)</option>
            <option value="Medium100">Medium100 (mul & div)</option>
            <option value="Mathanomical">Mathanomical (all ops)</option>
          </select>
          <button id="startBtn">Start</button>
          <button id="pauseBtn" disabled>Pause</button>
        </div>
      </header>
      <section className="game-shell__body">
        <section className="game-info game-shell__panel" aria-live="polite">
          <div className="stats-card" aria-label="Score and timing">
            <div id="score">Score: 0</div>
            <div id="highscore">High Score: 0</div>
            <div id="math-problem">Problem: —</div>
            <div id="timer">Time: —</div>
          </div>
          <div className="status-row">
            <p id="status">Press Start to begin.</p>
            <div id="bennyDock" className="benny-dock" aria-hidden="true" />
          </div>
          <p id="mathHint" className="math-hint" aria-live="polite" />
          <div className="mobile-answer" aria-label="Answer input">
            <input
              id="mobileAnswer"
              type="text"
              inputMode="numeric"
              placeholder="Type answer"
              autoComplete="off"
            />
            <button id="mobileAnswerBtn" type="button">Answer</button>
          </div>
          <p id="bennyStory" className="benny-story">
            Benny Sum A.K.A the Dog Knight is at home in the backyard while Mr.
            Boooiiii is teaching. Can you help keep Benny from zombies and keep
            him company by completing math problems? Benny is 54 in human years,
            but in this game he is always 8 years old. If Benny gets lost inside
            a zombie, type his dog age (8) to unlock an ancient Mathanomical
            power and bring him back.
          </p>
          <div id="bennyUnlockInfo" style={{ marginTop: 8 }} />
          <div id="bennyPalette" className="benny-palette" />
        </section>

        <div className="game-shell__board">
          <div className="canvas-anchor">
            <canvas
              id="gameCanvas"
              width="800"
              height="600"
              aria-label="Game canvas"
            />
            <div id="game-area" className="game-area" aria-hidden="false" />
          </div>
        </div>
      </section>
      <div className="mobile-controls" id="mobileControls" aria-hidden="true">
        <div className="joystick" id="mobileJoystick">
          <div className="stick" id="mobileStick" />
        </div>
        <button className="shoot-btn" id="mobileShoot" type="button">
          Benny, Go Potty!
        </button>
      </div>
      <div className="number-keyboard" id="numberKeyboard" aria-label="Number keyboard for answers">
        <div className="keyboard-display">
          <input
            id="keyboardDisplay"
            type="text"
            readOnly
            placeholder="0"
            className="keyboard-input"
          />
        </div>
        <div className="keyboard-grid">
          <button className="key-num" data-key="7" type="button">7</button>
          <button className="key-num" data-key="8" type="button">8</button>
          <button className="key-num" data-key="9" type="button">9</button>
          <button className="key-op" data-key="/" type="button">÷</button>
          <button className="key-num" data-key="4" type="button">4</button>
          <button className="key-num" data-key="5" type="button">5</button>
          <button className="key-num" data-key="6" type="button">6</button>
          <button className="key-op" data-key="*" type="button">×</button>
          <button className="key-num" data-key="1" type="button">1</button>
          <button className="key-num" data-key="2" type="button">2</button>
          <button className="key-num" data-key="3" type="button">3</button>
          <button className="key-op" data-key="-" type="button">−</button>
          <button className="key-num zero" data-key="0" type="button">0</button>
          <button className="key-op" data-key="+" type="button">+</button>
          <button className="key-delete" id="keyDelete" type="button">DEL</button>
          <button className="key-submit" id="keySubmit" type="button">Enter</button>
        </div>
      </div>
    </main>
  );
}
