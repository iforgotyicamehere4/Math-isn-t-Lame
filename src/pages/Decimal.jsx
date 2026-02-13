import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/decimal.css';
import initDecimal from '../decimal/decimal.js';
import useGameMusic from '../hooks/useGameMusic';

export default function Decimal() {
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
    initDecimal();
    return () => {
      if (window.__DecimalCleanup) window.__DecimalCleanup();
    };
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
