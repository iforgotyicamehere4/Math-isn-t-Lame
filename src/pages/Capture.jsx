import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/capture.css';
import useScriptOnce from '../hooks/useScriptOnce';

const BASE_PATH = import.meta.env.BASE_URL || '/Math-isn-t-Lame/';

export default function Capture() {
  const { loadScript, isLoaded } = useScriptOnce(`${BASE_PATH}js/capture.js`, 'capture');
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

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
    };
  }, [loadScript]);

  useEffect(() => {
    return () => {
      if (window.__CaptureCleanup) {
        console.log('[Capture] Running cleanup');
        window.__CaptureCleanup();
      }
    };
  }, []);

  if (error) {
    return (
      <main className="game-shell game-page--capture error-page">
        <header className="game-shell__header">
          <Link to="/list" className="back-link" id="backBtn">Back</Link>
          <h1>Capture</h1>
        </header>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </main>
    );
  }

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
