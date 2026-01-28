import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/decimal.css';
import initDecimal from '../decimal/decimal.js';

export default function Decimal() {
  useEffect(() => {
    initDecimal();
    return () => {
      if (window.__DecimalCleanup) window.__DecimalCleanup();
    };
  }, []);

  return (
    <main className="game-shell app decimal-page game-page--decimal">
      <header className="game-shell__header">
        <Link to="/list" className="back-link" id="backBtn">Back</Link>
        <h1>Deci-What?</h1>
        <div className="game-shell__controls controls">
          <label htmlFor="level">Level</label>
          <select id="level" defaultValue="easy20">
            <option value="easy20">Easy .20 — words to number</option>
            <option value="easy25">Easy .25 — words to number</option>
            <option value="easy30">Easy .30 — words to number</option>
            <option value="medium">Medium — add/subtract decimals</option>
            <option value="mathamatical">Mathanomical — all ops</option>
          </select>

          <button
            id="start"
            onClick={() => window.DecimalTetris?.startGame?.()}
          >
            Start
          </button>
          <button
            id="pause"
            disabled
            onClick={() => window.DecimalTetris?.togglePause?.()}
          >
            Pause
          </button>
        </div>
      </header>
      <section className="settings-row">
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
            />
          </label>
          <button id="applyGridBtn">Apply Grid</button>
          <div className="grid-info">
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

      <section className="status-row">
        <div className="score">Score: <span id="score">0</span></div>
        <div className="timer">Time: <span id="timer">0.0</span>s</div>
        <div className="streak">Streak: x<span id="streak">0</span></div>
      </section>

      <section className="problem-area game-shell__body">
        <div className="side-panel game-shell__panel">
          <div className="game-controls">
            <div className="typed">
              <input
                id="answerInput"
                placeholder="Type numeric answer and press Enter"
              />
            </div>
            <div className="feedback" id="feedback" />
          </div>

          <div className="prompt" id="prompt">Press Start to begin.</div>
          <div className="hint" id="hint" />

          <div className="legend">
            Click a full row to solve. Type the numeric value of the
            word + decimal shown.
          </div>
        </div>

        <div className="board-panel game-shell__board">
          <div id="canvasAnchor" className="canvas-anchor" />
        </div>
      </section>
      <footer>
        <small>
          Designed for learning decimal reading and operations. Block color is selectable.
        </small>
      </footer>
    </main>
  );
}
