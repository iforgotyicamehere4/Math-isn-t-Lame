import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/howtoplay.css';
import useScriptOnce from '../hooks/useScriptOnce';

export default function HowToPlay() {
  useScriptOnce('/js/howtoplay.js', 'howtoplay');
  useScriptOnce('/js/howto-benny.js', 'howto-benny');
  useEffect(() => () => {
    if (window.__HowToPlayCleanup) window.__HowToPlayCleanup();
  }, []);

  return (
    <div className="background">
      <header className="howto-header">
        <div className="hero-card small">
          <h1>Few Rules from the dev</h1>
          <p className="tagline">
            Play fair, avoid calculators, and have fun learning. This world is
            about steady progress, not rushing the answer.
          </p>
          <button id="throwBallBtn" className="throw-btn" type="button">
            Throw Benny&apos;s Ball
          </button>
        </div>
      </header>

      <main className="campfire-scene" aria-label="Campfire scene">
        <section className="campfire-stage" aria-label="Campfire characters">
          <div className="campfire">
            <canvas id="fireCanvas" width="420" height="260" />
          </div>

          <div className="booiiii" aria-label="Mr. Boooiiii">
            <div className="hat">
              <div className="hat-brim" />
              <span className="dot" />
             
              <div className="hat-top" />
            </div>
            <div className="head">
              <span className="eye" />
              <span className="eye" />
              <span className="mouth" />
            </div>
            <div className="collar">
              <span className="collar-left" />
              <span className="collar-right" />
            </div>
            <div className="torso">
              <span className="torso-left" />
              <span className="torso-right" />
            </div>
            <div className="arms">
              <span className="arm left" />
              <span className="arm right" />
              <span className="hand left" />
              <span className="hand right" />
            </div>
            <div className="lap-top">
              <span className="laptop-back" />
              <span className="laptop-seat" />
            </div>
            <div className="radius" />
            <span className="radius one" />
            <span className="radius two" />
           
            <div className="legs">
              <span className="leg left" />
              <span className="leg right" />
              <span className="foot left" />
              <span className="foot right" />
            </div>
          </div>

          <div className="howto-benny" aria-label="Benny">
            <div className="benny-base">
              <div className="benny-shape">
                <div className="back" />
                <div className="leg-left" />
                <div className="leg-right" />
                <div className="head" />
              </div>
            </div>
          </div>
        </section>

        <section className="instructions" aria-label="Quick tips">
          <h2>Quick Tips</h2>
          <ol>
            <li>Math Pup: click the correct zombie or type the answer.</li>
            <li>Capture: solve the fraction prompt and pop the right bubble.</li>
            <li>Deci-What?: fill a row and solve it to clear.</li>
          </ol>
          <Link id="backLink" to="/" className="back-link">Back Home</Link>
        </section>
      </main>
      <div id="nightOverlay" />
    </div>
  );
}
