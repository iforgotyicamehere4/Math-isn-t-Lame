import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/game.css';
import { JUKEBOX_SONGS } from '../data/jukeboxSongs';

// Import scripts using Vite's asset handling for proper bundling
import mathScript from '../../public/js/math.js?url';
import timerScript from '../../public/js/mathpup-timer.js?url';
import gameScript from '../../public/js/game.js?url';

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
    // Make Vite base URL available to the legacy game script loaded from /public.
    window.__MathPopBaseUrl = import.meta.env.BASE_URL || '/';
    window.__MathPopJukeboxSongs = JUKEBOX_SONGS;
    
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
    
    // Reset timer module before loading scripts to ensure fresh state
    if (window.mathPupTimer && typeof window.mathPupTimer.resetTimer === 'function') {
      window.mathPupTimer.resetTimer();
    }
    // Reset game cleanup flag
    window.__MathPupCleanupDone = false;

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

    // Load scripts using Vite-resolved URLs
    loadScript(mathScript, 'mathjs', { async: false }).then(() => {
      if (cancelled) return null;
      // Load timer script first (non-module), then load game script (module)
      return loadScript(timerScript, 'mathpup-timer', { async: false, type: 'module' }).then(() => {
        if (cancelled) return null;
        return loadScript(gameScript, 'mathpup', { type: 'module' });
      });
    });

    return () => {
      cancelled = true;
      // Mark cleanup as done to prevent re-execution
      window.__MathPupCleanupDone = true;
      
      // Unlock orientation when leaving the game
      if (window.screen && window.screen.orientation) {
        try {
          window.screen.orientation.unlock();
        } catch (e) {
          // Ignore
        }
      }
      const mathScriptEl = document.querySelector('script[data-script-key="mathjs"]');
      if (mathScriptEl && mathScriptEl.parentNode) mathScriptEl.parentNode.removeChild(mathScriptEl);
      const timerScriptEl = document.querySelector('script[data-script-key="mathpup-timer"]');
      if (timerScriptEl && timerScriptEl.parentNode) timerScriptEl.parentNode.removeChild(timerScriptEl);
      const gameScriptEl = document.querySelector('script[data-script-key="mathpup"]');
      if (gameScriptEl && gameScriptEl.parentNode) gameScriptEl.parentNode.removeChild(gameScriptEl);
      
      // Force reset timer module
      if (window.mathPupTimer && typeof window.mathPupTimer.resetTimer === 'function') {
        window.mathPupTimer.resetTimer();
      }
      
      // Execute cleanup if defined
      if (window.__MathPupCleanup) {
        window.__MathPupCleanup();
        window.__MathPupCleanup = null;
      }
      
      // Clear any MathPup global references
      window.MathPup = null;
      window.__MathPopJukeboxSongs = null;
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
          <label htmlFor="musicToggle" className="music-toggle">
            <input id="musicToggle" type="checkbox" />
            Music
          </label>
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
            while Mr Boooiii is at work benny is at home working on his math pup
            game can you help him get rid of the bugs??? Benny is 54 in human
            years but he still has alot of pep in his steps. Solve math problems
            to unlock mini game.
          </p>
          <div id="bennyUnlockInfo" style={{ marginTop: 8 }} />
          <div id="bennyPalette" className="benny-palette" />
          <div className="mobile-controls" id="mobileControls" aria-hidden="true">
            <div className="joystick" id="mobileJoystick">
              <div className="stick" id="mobileStick" />
            </div>
            <button className="shoot-btn" id="mobileShoot" type="button">
              Benny, Go Play!
            </button>
          </div>
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
      <div id="musicNowPlaying" className="music-now-playing" aria-live="polite" />
    </main>
  );
}
