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

      <section className="tutorial-banner" aria-label="Benny tutorial animation">
        <div className="tutorial-banner__arena">
          <div className="tutorial-banner__benny" aria-hidden="true">
            <div className="benny-base">
              <div className="benny-shape">
                <div className="back" />
                <div className="leg-left" />
                <div className="leg-right" />
                <div className="head" />
              </div>
            </div>
          </div>
          <div className="tutorial-banner__bug bug-1" aria-hidden="true">x÷?</div>
          <div className="tutorial-banner__bug bug-2" aria-hidden="true">2/?</div>
          <div className="tutorial-banner__bug bug-3" aria-hidden="true">??</div>
          <p className="tutorial-banner__caption">Benny is tracking Syntax Bugs...</p>
        </div>
      </section>

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

        <section className="instructions" aria-label="Benny tutorial">
          <h2>Benny&apos;s Tutorial</h2>
          <p className="tutorial-lead">
            Benny&apos;s Mathanomical Adventure is a basic math hangout for parents and kids. Team up,
            solve math, and help Benny clear out the dev&apos;s Syntax Bugs.
          </p>

          <div className="tutorial-block">
            <h3>How Benny&apos;s Mathanomical Adventure Works</h3>
            <ol>
              <li>Pick a game and choose a difficulty.</li>
              <li>Solve each problem before the bugs get away.</li>
              <li>Build points to trigger mini-games and clear more Syntax Bugs.</li>
              <li>Use retries and hints to learn the method, then keep moving.</li>
            </ol>
          </div>

          <div className="tutorial-block">
            <h3>Game Modes</h3>
            <ul>
              <li><strong>Math Pup:</strong> Core warm-up math and unlockable Benny upgrades.</li>
              <li><strong>Capture The Fraction:</strong> Pop the bubble with the correct fraction answer.</li>
              <li><strong>Deci-What?:</strong> Translate decimal words into number form.</li>
              <li><strong>Ma+h5Yn+h3:</strong> Algebra challenge mode with speed pressure.</li>
            </ul>
          </div>

          <div className="tutorial-block">
            <h3>How To Unlock Benny Dash</h3>
            <ol>
              <li>Play the math games above and stack points + completions.</li>
              <li>Keep unlocking features and mini-games as you progress.</li>
              <li>Once enough progress is saved, jump into <strong>Benny Dash</strong> from Games.</li>
            </ol>
          </div>

          <div className="tutorial-block">
            <h3>Profile Page</h3>
            <ul>
              <li>Check total points, accuracy, streaks, and best scores.</li>
              <li>Review each game&apos;s stats and your unlock progress.</li>
              <li>Manage Benny tiers, color unlocks, and jukebox settings.</li>
            </ul>
          </div>

          <blockquote className="queen-line">
            <p><strong>Syntax Bug Queen:</strong> &quot;Good luck silly goober...... nah nah boo boo.&quot;</p>
          </blockquote>

          <Link id="backLink" to="/" className="back-link">Back Home</Link>
        </section>
      </main>
      <div id="nightOverlay" />
    </div>
  );
}
