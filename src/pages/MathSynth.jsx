import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/mathsynth.css';
import useScriptOnce from '../hooks/useScriptOnce';

export default function MathSynth() {
  useScriptOnce('/js/mathsynth.js', 'mathsynth');
  useEffect(() => () => {
    if (window.__MathSynthCleanup) window.__MathSynthCleanup();
  }, []);

  return (
    <main className="game-shell app mathsynth game-page--mathsynth">
      <header className="game-shell__header">
        <Link to="/list" className="back-link" id="backBtn">Back</Link>
        <h1>Ma+h 5Yn+h3</h1>
        <div className="game-shell__controls controls">
          <label htmlFor="mathSynthLevel" className="sr-only">Level</label>
          <select id="mathSynthLevel" defaultValue="easy">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="mathanomical">Mathanomical</option>
          </select>
          <button
            id="startMathSynth"
            onClick={() => window.MathSynth?.start?.()}
          >
            Start
          </button>
          <button
            id="resetMathSynth"
            type="button"
            onClick={() => window.MathSynth?.reset?.()}
          >
            Reset
          </button>
          <div className="mathsynth-grid-note">
            Grid: <span id="mathSynthPreview"></span> &nbsp; Easy: 7×6, Medium: 8×6, Mathanomical: 10×6
          </div>
        </div>
      </header>
      <div className="mathsynth-board-name">MathSynth (algebra stuff)</div>

      <section className="status-row">
        <div className="score">Score: <span id="mathSynthScore">0</span></div>
        <div className="timer">Time left: <span id="mathSynthTimer">0</span>s</div>
        <div className="streak">Best: <span id="mathSynthBest">--</span></div>
      </section>

      <section className="problem-area game-shell__body">
        <div className="side-panel game-shell__panel">
          <div className="prompt" id="mathSynthPrompt">Press Start to begin.</div>
          <div className="hint" id="mathSynthFeedback" />
          <div className="mathsynth-hint">
            Solve each equation for x. Correct answers lock the cell and give -1 point.
            The best score is the lowest number with the most time left. Oh yea watch out for
            the others (Mr. Boooiiii&apos;s bill collectors)!
          </div>
          <div className="mathsynth-clues">
            <div className="mathsynth-label">Warm up problems</div>
            <div id="mathSynthEquations" className="mathsynth-equations" />
            <div className="mathsynth-quote">just ask yourself, &quot;What&apos;s the next right choice?&quot;<br />
              If x = your best self, then I believe in you. -Mr. Boooiiii-
            </div>
          </div>
        </div>

        <div className="board-panel game-shell__board">
          <div id="mathSynthOthers" className="mathsynth-others" aria-live="polite" />
          <div id="mathSynthBoard" className="mathsynth-board" />
          <div className="palette-controls">
            <div className="palette-title">Board colors</div>
            <div id="mathSynthPalette" className="palette" role="list" />
            <div className="selected-color">
              Selected:
              <span id="mathSynthColorPreview" className="color-swatch" />
            </div>
            <div className="grid-info">
              Colors unlocked: <span id="mathSynthColorInfo">0</span>/50
            </div>
          </div>
        </div>
      </section>
      <footer>
        <small>MathSynth blends algebra with a crossword-style grid.</small>
      </footer>
    </main>
  );
}
