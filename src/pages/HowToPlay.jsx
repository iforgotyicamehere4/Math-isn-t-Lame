import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/howtoplay.css';

export default function HowToPlay() {
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initHowToPlay = async () => {
      try {
        if (!window.__HowToPlayInit) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (err) {
        if (mounted) {
          setError(`Failed to load HowToPlay: ${err.message}`);
        }
        return;
      }

      if (mounted) {
        setIsInitialized(true);
        console.log('[HowToPlay] Page initialized');
      }
    };

    initHowToPlay();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let rafId = null;
    let opened = false;
    const tick = () => {
      const door = document.querySelector('.exit-door');
      const bennyHead = document.querySelector('.howto-benny .head');
      if (!door || !bennyHead) return;
      const doorRect = door.getBoundingClientRect();
      const headRect = bennyHead.getBoundingClientRect();
      if (!opened && headRect.right >= doorRect.left - 4 && headRect.left < doorRect.right) {
        door.classList.add('is-open');
        opened = true;
      }
      if (opened && headRect.left > doorRect.right + 4) {
        door.classList.add('is-close');
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (window.__HowToPlayCleanup) {
        console.log('[HowToPlay] Running cleanup');
        window.__HowToPlayCleanup();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="background error-page">
        <header className="howto-header">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="background howto-page">
      <header className="howto-header">
        <div className="hero-card small">
          <h1>Few Rules from the dev</h1>
          <p className="tagline">
            Play fair, avoid calculators, and have fun learning. This world is
            about steady progress, not rushing the answer.
          </p>
        </div>
      </header>

      <main className="campfire-scene" aria-label="Campfire scene">
        <section className="campfire-stage" aria-label="Campfire characters">
          <div className="exit-door" aria-hidden="true">
            <div className="door-frame" />
            <div className="door-panel" />
            <div className="door-knob" />
            <div className="door-blackhole" aria-hidden="true">
              <div className="blackhole-core" />
              <div className="blackhole-ring" />
              <div className="blackhole-ring" />
              <div className="blackhole-ring" />
              <div className="blackhole-particles" />
            </div>
          </div>
          <div className="booiiii-duo" aria-label="Mr. Boooiiii walking Benny">
            <div className="leash" aria-hidden="true" />
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
          </div>
        </section>

        <section className="instructions" aria-label="Quick tips">
          <h2>Quick Tips</h2>
          <ol>
            <li>Math Pup: Answer math Problems to unlock fun mini game and other unlockable features</li>
            <li>Capture: solve the fraction prompt and pop the right bubble. Pop enough bubbles and unlock a fun mini game.</li>
            <li>Deci-What?: Identify spelled out numbers with decimals. type in numeric value. Complete puzzle to unlock fun mini game </li>
            <li>Ma+h 5yn+h3: Solve algebra problems to unlock mini game.</li>
            <li>Benny Dash: Make progress in games listed above to unlock fun platformer game. </li>
          </ol>
          <Link id="backLink" to="/" className="back-link">Back Home</Link>
        </section>
      </main>
      <div id="nightOverlay" />
    </div>
  );
}
