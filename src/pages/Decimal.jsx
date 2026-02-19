import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/decimal.css';
import initDecimal from '../decimal/decimal.js';
import useGameMusic from '../hooks/useGameMusic';
import { attachContinueTracker } from '../utils/continueProgress';
import { getDailyChallengeStatus } from '../utils/dailyChallenge';

export default function Decimal() {
  const location = useLocation();
  useGameMusic({
    toggleId: 'decimalMusicToggle',
    popupId: 'decimalNowPlaying',
    statusId: 'prompt',
    playOnIds: ['start'],
    togglePauseIds: ['pause']
  });

  // Sync high contrast mode from localStorage on mount
  useEffect(() => {
    const highContrast = localStorage.getItem('highContrast') === 'true';
    document.body.classList.toggle('high-contrast', highContrast);
  }, []);

  useEffect(() => {
    const currentUser = localStorage.getItem('mathpop_current_user');
    const isDailyMode = new URLSearchParams(location.search).get('daily') === '1';
    if (isDailyMode && currentUser) {
      const dailyStatus = getDailyChallengeStatus(currentUser, new Date());
      if (dailyStatus.challenge.gameId === 'decimal') {
        window.__DecimalDailyChallenge = {
          enabled: true,
          ...dailyStatus.challenge,
          dateKey: dailyStatus.dateKey,
          claimed: dailyStatus.claimed,
          progress: dailyStatus.progress
        };
      } else {
        window.__DecimalDailyChallenge = null;
      }
    } else {
      window.__DecimalDailyChallenge = null;
    }
    initDecimal();
    return () => {
      if (window.__DecimalCleanup) window.__DecimalCleanup();
      window.__DecimalDailyChallenge = null;
    };
  }, [location.search]);

  useEffect(() => {
    const cleanup = attachContinueTracker({
      route: '/decimal',
      isReady: () => Boolean(document.getElementById('level') && document.getElementById('start')),
      readState: () => {
        const level = document.getElementById('level')?.value || 'easy20';
        const pauseBtn = document.getElementById('pause');
        const score = document.getElementById('score')?.textContent || '0';
        const streak = document.getElementById('streak')?.textContent || '0';
        const timer = document.getElementById('timer')?.textContent || '0.0';
        const prompt = document.getElementById('prompt')?.textContent || '';
        const answerInput = document.getElementById('answerInput')?.value || '';
        return {
          level,
          score,
          streak,
          timer,
          prompt,
          answerInput,
          wasRunning: Boolean(pauseBtn && !pauseBtn.disabled),
          wasPaused: String(pauseBtn?.textContent || '').trim().toLowerCase() === 'resume'
        };
      },
      applyState: (saved) => {
        const levelEl = document.getElementById('level');
        const startBtn = document.getElementById('start');
        const pauseBtn = document.getElementById('pause');
        const answerInput = document.getElementById('answerInput');
        if (!levelEl || !startBtn) return false;
        if (saved?.level) {
          levelEl.value = saved.level;
          levelEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (answerInput && typeof saved?.answerInput === 'string') answerInput.value = saved.answerInput;
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
  }, []);

  return (
    <main className="app-page decimal-page">
      <header className="app-header">
        <Link to="/list" className="back-link" id="backBtn">Back</Link>
        <h1>Deci-What?</h1>
        <div className="game-controls">
          <label htmlFor="level">Level</label>
          <select id="level" className="select" defaultValue="easy20">
            <option value="easy20">Easy .20 — words to number</option>
            <option value="easy25">Easy .25 — words to number</option>
            <option value="easy30">Easy .30 — words to number</option>
            <option value="medium">Medium — add/subtract decimals</option>
            <option value="mathamatical">Mathanomical — all ops</option>
          </select>

          <button
            id="start"
            className="btn btn--primary"
            onClick={() => window.DecimalTetris?.startGame?.()}
          >
            Start
          </button>
          <button
            id="pause"
            className="btn btn--secondary"
            disabled
            onClick={() => window.DecimalTetris?.togglePause?.()}
          >
            Pause
          </button>
          <label htmlFor="decimalMusicToggle" className="game-music-toggle">
            <input id="decimalMusicToggle" type="checkbox" />
            Music
          </label>
        </div>
      </header>

      <section className="game-stats">
        <div className="stat-badge stat-badge--score">Score: <span id="score">0</span></div>
        <div className="stat-badge stat-badge--timer">Time: <span id="timer">0.0</span>s</div>
        <div className="stat-badge">Streak: x<span id="streak">0</span></div>
      </section>

      <section className="game-body">
        <section className="game-panel">
          <div className="prompt-row">
            <div className="prompt" id="prompt">Press Start to begin.</div>
            <div className="typed">
              <input
                id="answerInput"
                placeholder="Type answer"
                className="input"
              />
            </div>
          </div>
          <div className="hint" id="hint" />
          <div className="hint" id="decimalDailyHint" />
          
          <div className="feedback" id="feedback" style={{ marginTop: '12px' }} />

          <div className="legend" style={{ marginTop: '12px' }}>
            Click a full row to solve. Type the numeric value of the word + decimal shown.
          </div>
        </section>

        <div className="game-board">
          <div id="canvasAnchor" className="canvas-anchor" />
        </div>
      </section>

      <section className="settings-row" style={{ marginTop: '16px' }}>
        <div className="grid-controls">
          <label>
            Columns
            <input
              id="colsInput"
              type="number"
              min="8"
              max="24"
              step="1"
              defaultValue="15"
              className="input"
              style={{ width: '64px', marginLeft: '8px' }}
            />
          </label>
          <label>
            Rows
            <input
              id="rowsInput"
              type="number"
              min="10"
              max="30"
              step="1"
              defaultValue="15"
              className="input"
              style={{ width: '64px', marginLeft: '8px' }}
            />
          </label>
          <label>
            Cell size
            <input
              id="cellSizeInput"
              type="range"
              min="20"
              max="48"
              step="1"
              defaultValue="28"
              style={{ marginLeft: '8px', verticalAlign: 'middle' }}
            />
          </label>
          <button id="applyGridBtn" className="btn btn--secondary">Apply Grid</button>
          <div className="grid-info" style={{ marginLeft: '8px' }}>
            Grid: <span id="gridPreview">15×18 @28px</span>
          </div>
        </div>

        <div className="palette-controls">
          <div className="palette-title">
            Block color (choose one of 50 acrylics)
          </div>
          <div id="palette" className="palette" role="list" />
          <div className="selected-color">
            Selected:
            <span id="selectedColorPreview" className="color-swatch" />
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '16px' }}>
        <small>
          Designed for learning decimal reading and operations. Block color is selectable.
        </small>
      </footer>
      <div id="decimalNowPlaying" className="game-music-popup" aria-live="polite" />
    </main>
  );
}
