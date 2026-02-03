import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/capture.css';
import useScriptOnce from '../hooks/useScriptOnce';
import '../capture/capture.js';

export default function Capture() {
  useScriptOnce('/js/capture.js', 'capture');
  useEffect(() => () => {
    if (window.__CaptureCleanup) window.__CaptureCleanup();
  }, []);

  return (
    <main className="game-shell game-page--capture">
      <header className="game-shell__header">
        <Link to="/list" className="back-link" id="backBtn">Back</Link>
        <h1>Capture</h1>
        <div className="game-shell__controls controls">
          <label htmlFor="levelSelect">Difficulty:</label>
          <select id="levelSelect" defaultValue="easy">
            <option value="easy">Easy (halves, thirds, quarters)</option>
            <option value="medium">Medium (denominators up to 9)</option>
            <option value="mathanomical">Mathanomical (mixed numbers)</option>
          </select>
          <button id="startBtn">Start</button>
          <button id="pauseBtn" disabled>Pause</button>
        </div>
      </header>
      <section className="game-shell__body">
        <section className="game-info game-shell__panel" aria-live="polite">
          <div id="scoreDisplay">Score: 0</div>
          <div id="streakDisplay">Streak: x0</div>
          <div id="targetFraction">Find: —</div>
          <div id="hint" style={{ marginTop: 6 }} />

          <div className="inputWrap">
            <label htmlFor="fractionInput">Type Answer:</label>
            <input
              type="text"
              id="fractionInput"
              placeholder="example: 3/6"
              autoComplete="off"
            />
          </div>

          <p id="status">Press Start to begin.</p>
        </section>

        <div className="game-shell__board">
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
    </main>
  );
}
