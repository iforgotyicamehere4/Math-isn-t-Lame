import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/bennyworld.css';
import useScriptOnce from '../hooks/useScriptOnce';

const BASE_PATH = import.meta.env.BASE_URL || '/Math-isn-t-Lame/';

export default function BennyWorld() {
  useScriptOnce('https://cdn.babylonjs.com/babylon.js', 'babylon');
  // bennyworld.js already contains the Babylon 3D placeholder code
  useScriptOnce(`${BASE_PATH}js/bennyworld.js`, 'bennyworld');

  useEffect(() => () => {
    if (window.__BennyWorldCleanup) window.__BennyWorldCleanup();
    if (window.__BennyWorldBabylonCleanup) window.__BennyWorldBabylonCleanup();
  }, []);

  return (
    <main className="benny-world" id="bennyWorldRoot">
      <header className="bw-header">
        <Link className="back-link" to="/list">Back</Link>
        <h1>Benny Dash</h1>
        <div className="bw-level" id="bwLevelLabel">Level 1</div>
      </header>

      <section className="bw-hud">
        <div className="bw-stat" id="bwPoints">Points: 0</div>
        <div className="bw-stat" id="bwDash">Dash: 0m</div>
        <div className="bw-stat" id="bwStatus">Run to the star!</div>
        <label className="bw-difficulty" htmlFor="bwDifficulty">
          Difficulty
          <select id="bwDifficulty" defaultValue="mathanomical">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="mathanomical">Mathanomical</option>
          </select>
        </label>
      </section>

      <section className="bw-stage">
        <div id="bennyWorldArea" className="bw-area" aria-label="Benny Dash playfield">
          <canvas id="bwBabylon" className="bw-babylon" aria-hidden="true" />
        </div>
        <div id="bwGameOver" className="bw-gameover" aria-live="polite" />
        <div id="bwMessage" className="bw-message" aria-live="polite" />
      </section>

      <div className="bw-controls" id="bwControls">
        {/* Joystick for mobile - left side */}
        <div className="bw-joystick-container" id="bwJoystickContainer">
          <div className="bw-joystick" id="bwJoystick">
            <div className="bw-joystick-knob" id="bwJoystickKnob" />
          </div>
        </div>
        
        {/* Action buttons - right side */}
        <div className="bw-actions">
          <button className="bw-move bw-action-btn" id="bwJump" type="button" aria-label="Jump">Jump</button>
          <button className="bw-move bw-action-btn" id="bwGlide" type="button" aria-label="Glide">Glide</button>
        </div>
      </div>

    </main>
  );
}
