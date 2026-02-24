import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/mathsynth.css';
import useScriptOnce from '../hooks/useScriptOnce';
import useGameMusic from '../hooks/useGameMusic';
import { attachContinueTracker } from '../utils/continueProgress';
import { getDailyChallengeStatus } from '../utils/dailyChallenge';

const BASE_PATH = import.meta.env.BASE_URL || '/Math-isn-t-Lame/';

export default function MathSynth() {
  const location = useLocation();
  const { loadScript } = useScriptOnce(`${BASE_PATH}js/mathsynth.js`, 'mathsynth');
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  useGameMusic({
    toggleId: 'mathSynthMusicToggle',
    popupId: 'mathSynthNowPlaying',
    statusId: 'mathSynthFeedback',
    playOnIds: ['startMathSynth'],
    pauseOnIds: ['resetMathSynth']
  });

  useEffect(() => {
    let mounted = true;
    const currentUser = localStorage.getItem('mathpop_current_user');
    const isDailyMode = new URLSearchParams(location.search).get('daily') === '1';
    if (isDailyMode && currentUser) {
      const dailyStatus = getDailyChallengeStatus(currentUser, new Date());
      if (dailyStatus.challenge.gameId === 'mathsynth') {
        window.__MathSynthDailyChallenge = {
          enabled: true,
          ...dailyStatus.challenge,
          dateKey: dailyStatus.dateKey,
          claimed: dailyStatus.claimed,
          progress: dailyStatus.progress
        };
      } else {
        window.__MathSynthDailyChallenge = null;
      }
    } else {
      window.__MathSynthDailyChallenge = null;
    }

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
      window.__MathSynthDailyChallenge = null;
    };
  }, [loadScript, location.search]);

  useEffect(() => {
    return () => {
      if (window.__MathSynthCleanup) {
        console.log('[MathSynth] Running cleanup');
        window.__MathSynthCleanup();
      }
      window.__MathSynthCleanup = null;
      window.MathSynth = null;
      const synthScript = document.querySelector('script[data-script-key="mathsynth"]');
      if (synthScript && synthScript.parentNode) {
        synthScript.parentNode.removeChild(synthScript);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return () => {};
    const cleanup = attachContinueTracker({
      route: '/mathsynth',
      isReady: () => Boolean(document.getElementById('mathSynthLevel') && document.getElementById('startMathSynth')),
      readState: () => {
        const level = document.getElementById('mathSynthLevel')?.value || 'easy';
        const score = document.getElementById('mathSynthScore')?.textContent || '0';
        const timer = document.getElementById('mathSynthTimer')?.textContent || '0';
        const prompt = document.getElementById('mathSynthPrompt')?.textContent || '';
        const answer = document.getElementById('mathSynthAnswer')?.value || '';
        const isRunning = Number(timer) > 0 || /solve|puzzle/i.test(prompt);
        return {
          level,
          score,
          timer,
          prompt,
          answer,
          wasRunning: isRunning
        };
      },
      applyState: (saved) => {
        const levelEl = document.getElementById('mathSynthLevel');
        const startBtn = document.getElementById('startMathSynth');
        const answer = document.getElementById('mathSynthAnswer');
        if (!levelEl || !startBtn) return false;
        if (saved?.level) {
          levelEl.value = saved.level;
          levelEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (saved?.wasRunning) {
          window.setTimeout(() => startBtn.click(), 120);
        }
        if (answer && typeof saved?.answer === 'string') {
          window.setTimeout(() => {
            answer.value = saved.answer;
          }, 250);
        }
        return true;
      }
    });
    return cleanup;
  }, [isInitialized]);

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
          <label htmlFor="mathSynthMusicToggle" className="game-music-toggle">
            <input id="mathSynthMusicToggle" type="checkbox" />
            Music
          </label>
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
        <div className="press-start">Press Start</div>
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
          <div className="palette-instructions">
            Solve for x. Correct locks the cell (-1). Best = lowest score + time left. Watch the Others.
          </div>
        </div>
      </section>

      <section className="problem-area game-shell__body">
        <div className="side-panel game-shell__panel">
          <div className="prompt" id="mathSynthPrompt" />
          <div className="hint" id="mathSynthFeedback" />
          <div className="hint" id="mathSynthDailyHint" />
          
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
                inputMode="text"
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
          
        </div>

        <div className="board-panel game-shell__board">
          <div id="mathSynthOthers" className="mathsynth-others" aria-live="polite" />
          <div id="mathSynthBoard" className="mathsynth-board" />
        </div>
      </section>
      <div id="mathSynthNowPlaying" className="game-music-popup" aria-live="polite" />
    </main>
  );
}
