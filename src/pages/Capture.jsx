import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/capture.css';
import useScriptOnce from '../hooks/useScriptOnce';
import useGameMusic from '../hooks/useGameMusic';

const BASE_PATH = import.meta.env.BASE_URL || '/Math-isn-t-Lame/';

export default function Capture() {
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
            <option value="medium">Medium (denominators up to 9)</option>
            <option value="mathanomical">Mathanomical (mixed numbers)</option>
          </select>
          <button id="startBtn" className="btn btn--primary">Start</button>
          <button id="pauseBtn" className="btn btn--secondary" disabled>Pause</button>
          <label htmlFor="captureMusicToggle" className="game-music-toggle">
            <input id="captureMusicToggle" type="checkbox" defaultChecked />
            Music
          </label>
        </div>
      </header>

      <section className="game-stats">
        <div className="stat-badge stat-badge--score" id="scoreDisplay">Score: 0</div>
        <div className="stat-badge" id="streakDisplay">Streak: x0</div>
        <div className="stat-badge" id="targetFraction">Find: —</div>
      </section>

      <section className="game-body">
        <section className="game-panel" aria-live="polite">
          <p id="status">Press Start to begin.</p>
          
          <div className="hint" id="hint" style={{ marginTop: '12px' }} />

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
