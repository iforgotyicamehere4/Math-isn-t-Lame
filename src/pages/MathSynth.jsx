 import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/mathsynth.css';
import useScriptOnce from '../hooks/useScriptOnce';

const BASE_PATH = import.meta.env.BASE_URL || '/Math-isn-t-Lame/';

export default function MathSynth() {
  const { loadScript, isLoaded } = useScriptOnce(`${BASE_PATH}js/mathsynth.js`, 'mathsynth');
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initMathSynth = async () => {
      if (!window.MathSynth) {
        try {
          await loadScript();
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          if (mounted) {
            setError(`Failed to load MathSynth: ${err.message}`);
          }
          return;
        }
      }

      if (mounted) {
        setIsInitialized(true);
        console.log('[MathSynth] Game initialized');
      }
    };

    initMathSynth();

    return () => {
      mounted = false;
    };
  }, [loadScript]);

  useEffect(() => {
    return () => {
      if (window.__MathSynthCleanup) {
        console.log('[MathSynth] Running cleanup');
        window.__MathSynthCleanup();
      }
    };
  }, []);

  if (error) {
    return (
      <main className="game-shell app mathsynth game-page--mathsynth error-page">
        <header className="game-shell__header">
          <Link to="/list" className="back-link" id="backBtn">Back</Link>
          <h1>Ma+h 5Yn+h3</h1>
        </header>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </main>
    );
  }

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
            Grid: <span id="mathSynthPreview"></span> &nbsp; Easy: 7x6, Medium: 8x6, Mathanomical: 10x6
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
          
          {/* Answer Section - shows when a cell is selected */}
          <div className="answer-section" id="mathSynthAnswerSection" style={{ display: 'none' }}>
            <div className="selected-problem" id="mathSynthSelectedProblem">
              <span className="problem-label">Problem:</span>
              <span className="problem-value" id="mathSynthProblemValue"></span>
            </div>
            <div className="answer-input-group">
              <input 
                type="text" 
                id="mathSynthAnswer" 
                className="answer-input" 
                placeholder="x = ?" 
                enterKeyHint="enter"
                autoComplete="off"
              />
              <button 
                type="button" 
                id="mathSynthSubmit" 
                className="answer-submit"
              >
                Answer
              </button>
            </div>
          </div>
          
          <div className="mathsynth-hint">
            Solve each equation for x. Correct answers lock the cell and give -1 point.
            The best score is the lowest number with the most time left. Oh yea watch out for
            the others (Mr. Boooiiii&apos;s bill collectors)!
          </div>
          <div className="mathsynth-clues">
            <div className="mathsynth-label">Warm up problems</div>
            <div id="mathSynthEquations" className="mathsynth-equations" />
            <div className="mathsynth-quote">just ask yourself, "What&apos;s the next right choice?"<br />
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

