import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/capture.css';
import useScriptOnce from '../hooks/useScriptOnce';
import useGameMusic from '../hooks/useGameMusic';
import { attachContinueTracker } from '../utils/continueProgress';
import { getDailyChallengeStatus } from '../utils/dailyChallenge';

const BASE_PATH = import.meta.env.BASE_URL || '/Math-isn-t-Lame/';

export default function Capture() {
  const location = useLocation();
  const { loadScript, isLoaded } = useScriptOnce(`${BASE_PATH}js/capture.js`, 'capture');
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  useGameMusic({
    toggleId: 'captureMusicToggle',
    popupId: 'captureNowPlaying',
    statusId: 'status',
    playOnIds: ['startBtn'],
    pauseOnIds: ['pauseBtn']
  });

  useEffect(() => {
    let mounted = true;
    const currentUser = localStorage.getItem('mathpop_current_user');
    const isDailyMode = new URLSearchParams(location.search).get('daily') === '1';
    if (isDailyMode && currentUser) {
      const dailyStatus = getDailyChallengeStatus(currentUser, new Date());
      if (dailyStatus.challenge.gameId === 'capture') {
        window.__CaptureDailyChallenge = {
          enabled: true,
          ...dailyStatus.challenge,
          dateKey: dailyStatus.dateKey,
          claimed: dailyStatus.claimed,
          progress: dailyStatus.progress
        };
      } else {
        window.__CaptureDailyChallenge = null;
      }
    } else {
      window.__CaptureDailyChallenge = null;
    }

    const initCapture = async () => {
      if (!window.__CaptureCleanup) {
        try {
          await loadScript();
          // Wait a bit for the script to execute
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          if (mounted) {
            setError(`Failed to load Capture game: ${err.message}`);
          }
          return;
        }
      }

      if (mounted) {
        setIsInitialized(true);
        console.log('[Capture] Game initialized');
      }
    };

    initCapture();

    return () => {
      mounted = false;
      window.__CaptureDailyChallenge = null;
    };
  }, [loadScript, location.search]);

  useEffect(() => {
    return () => {
      if (window.__CaptureCleanup) {
        console.log('[Capture] Running cleanup');
        window.__CaptureCleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return () => {};
    const cleanup = attachContinueTracker({
      route: '/capture',
      isReady: () => Boolean(document.getElementById('levelSelect') && document.getElementById('startBtn')),
      readState: () => {
        const level = document.getElementById('levelSelect')?.value || 'easy';
        const pauseBtn = document.getElementById('pauseBtn');
        const status = document.getElementById('status')?.textContent || '';
        const score = document.getElementById('scoreDisplay')?.textContent || 'Score: 0';
        const streak = document.getElementById('streakDisplay')?.textContent || 'Streak: x0';
        const inputValue = document.getElementById('fractionInput')?.value || '';
        return {
          level,
          status,
          score,
          streak,
          inputValue,
          wasRunning: Boolean(pauseBtn && !pauseBtn.disabled),
          wasPaused: String(pauseBtn?.textContent || '').trim().toLowerCase() === 'resume'
        };
      },
      applyState: (saved) => {
        const levelSelect = document.getElementById('levelSelect');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const inputEl = document.getElementById('fractionInput');
        if (!levelSelect || !startBtn) return false;
        if (saved?.level) {
          levelSelect.value = saved.level;
          levelSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (inputEl && typeof saved?.inputValue === 'string') inputEl.value = saved.inputValue;
        if (saved?.wasRunning || saved?.wasPaused) {
          window.setTimeout(() => {
            startBtn.click();
            if (saved?.wasPaused && pauseBtn && String(pauseBtn.textContent || '').trim().toLowerCase() === 'pause') {
              window.setTimeout(() => pauseBtn.click(), 220);
            }
          }, 120);
        }
        return true;
      }
    });
    return cleanup;
  }, [isInitialized]);

  if (error) {
    return (
      <main className="app-page error-page">
        <header className="app-header">
          <Link to="/list" className="back-link" id="backBtn">Back</Link>
          <h1>Capture</h1>
        </header>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn--primary">Reload</button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page game-page--capture">
      <header className="app-header">
        <Link to="/list" className="back-link" id="backBtn">Back</Link>
        <h1>Capture</h1>
        <div className="game-controls">
          <label htmlFor="levelSelect">Difficulty:</label>
          <select id="levelSelect" className="select" defaultValue="easy">
            <option value="easy">Easy (halves, thirds, quarters)</option>
            <option value="easy25">Easy .25 (improper to mixed, 90s)</option>
            <option value="medium">Medium (denominators up to 9)</option>
            <option value="medium25">Medium .25 (add/subtract improper)</option>
            <option value="mathanomical">Mathanomical (mixed numbers)</option>
          </select>
          <button id="startBtn" className="btn btn--primary">Start</button>
          <button id="pauseBtn" className="btn btn--secondary" disabled>Pause</button>
          <label htmlFor="captureMusicToggle" className="game-music-toggle">
            <input id="captureMusicToggle" type="checkbox" />
            Music
          </label>
        </div>
      </header>

      <section className="game-stats">
        <div className="stat-badge stat-badge--score" id="scoreDisplay">Score: 0</div>
        <div className="stat-badge" id="streakDisplay">Streak: x0</div>
        <div className="stat-badge" id="targetFraction">Find: —</div>
      </section>
      <div id="denominatorHelpPopup" className="capture-denominator-popup" aria-hidden="true">
        <div className="capture-denominator-popup__card" role="dialog" aria-modal="false" aria-label="Denominator help">
          <h3>Denominator</h3>
          <p id="denominatorHelpText">The denominator is the bottom number. It tells how many equal parts make one whole.</p>
          <button id="denominatorHelpClose" type="button" className="btn btn--secondary">Got it</button>
        </div>
      </div>

      <section className="game-body">
        <section className="game-panel" aria-live="polite">
          <p id="status">Press Start to begin.</p>
          
          <div className="hint" id="hint" style={{ marginTop: '12px' }} />
          <div className="hint" id="captureDailyHint" style={{ marginTop: '8px' }} />

          <div className="inputWrap" style={{ marginTop: '12px' }}>
            <label htmlFor="fractionInput" style={{ marginBottom: '6px' }}>Type Answer:</label>
            <input
              type="text"
              id="fractionInput"
              placeholder="example: 3/6"
              autoComplete="off"
              className="input"
            />
          </div>
        </section>

        <div className="game-board">
          <div className="canvas-anchor">
            <canvas
              id="gameCanvas"
              width="800"
              height="600"
              aria-label="Game canvas"
            />
          </div>
        </div>
      </section>
      <div id="captureNowPlaying" className="game-music-popup" aria-live="polite" />
    </main>
  );
}
