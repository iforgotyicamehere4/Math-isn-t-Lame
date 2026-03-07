import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/howtoplay.css';

export default function HowToPlay() {
  const [error, setError] = useState(null);

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
        console.log('[HowToPlay] Page initialized');
      }
    };

    initHowToPlay();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => () => {
    if (window.__HowToPlayCleanup) {
      console.log('[HowToPlay] Running cleanup');
      window.__HowToPlayCleanup();
    }
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
      <main className="campfire-scene" aria-label="Campfire scene">
        <section className="instructions" aria-label="How to Play">
          <h2>How to Play</h2>
          <p className="tutorial-lead">
            Start here if you&apos;re new. This quick guide explains setup, what each game does, and how to unlock
            Benny&apos;s powers, music, and stats.
          </p>

          <div className="tutorial-block tutorial-block--important">
            <h3>Step 1: Create Your Profile First</h3>
            <p className="tutorial-text">
              Go to Home and tap <strong>Sign Up</strong>. Your profile is required to save progress and unlock core features.
            </p>
            <ul>
              <li><strong>Benny Powers:</strong> Buy and activate unlocked tiers.</li>
              <li><strong>Benny Jukebox:</strong> Unlock and toggle music tracks.</li>
              <li><strong>Stats Dashboard:</strong> Track points, accuracy, streaks, and best scores by game.</li>
            </ul>
          </div>

          <div className="tutorial-block">
            <h3>First 5 Minutes (Recommended Path)</h3>
            <ol>
              <li>Create profile on Home.</li>
              <li>Play <strong>Math Pup</strong> first to learn the core pace.</li>
              <li>Try <strong>Capture</strong> and <strong>Deci-What?</strong> for fractions and decimals.</li>
              <li>Play <strong>Ma+h5Yn+h3</strong> when ready for algebra speed rounds.</li>
              <li>Open <strong>Profile</strong> to spend points on powers/music and review your stats.</li>
            </ol>
          </div>

          <div className="tutorial-block">
            <h3>Game Walkthrough</h3>
            <div className="tutorial-game-grid">
              <article className="tutorial-game-card">
                <h4>Math Pup</h4>
                <p><strong>Goal:</strong> Build fundamentals and points fast.</p>
                <p><strong>How it works:</strong> Pick a difficulty, solve quickly, and maintain streaks.</p>
                <p><strong>Why it matters:</strong> Main path for Benny upgrades and early unlocks.</p>
              </article>
              <article className="tutorial-game-card">
                <h4>Capture The Fraction</h4>
                <p><strong>Goal:</strong> Match fraction answers correctly.</p>
                <p><strong>How it works:</strong> Read prompt, select correct fraction bubble, keep your streak alive.</p>
                <p><strong>Why it matters:</strong> Adds profile points and improves fraction fluency.</p>
              </article>
              <article className="tutorial-game-card">
                <h4>Deci-What?</h4>
                <p><strong>Goal:</strong> Convert decimal words into number form.</p>
                <p><strong>How it works:</strong> Read carefully, enter the decimal value, and stay accurate.</p>
                <p><strong>Why it matters:</strong> Strengthens decimal fluency and feeds unlock progress.</p>
              </article>
              <article className="tutorial-game-card">
                <h4>Ma+h5Yn+h3 (MathSynth)</h4>
                <p><strong>Goal:</strong> Solve algebra-style prompts under pressure.</p>
                <p><strong>How it works:</strong> Move quickly, avoid mistakes, and push high scores.</p>
                <p><strong>Why it matters:</strong> High-skill mode that boosts points and color unlocks.</p>
              </article>
            </div>
          </div>

          <div className="tutorial-block">
            <h3>Unlocking Benny Dash</h3>
            <ol>
              <li>Build progress across Math Pup, Capture, Deci-What?, and Ma+h5Yn+h3.</li>
              <li>Keep increasing points and completions in your profile.</li>
              <li>When unlocked, launch <strong>Benny Dash (Zone 1)</strong> from the Games page.</li>
            </ol>
          </div>

          <blockquote className="queen-line">
            <p><strong>Reminder:</strong> No profile = no saved unlocks, powers, jukebox, or long-term stats.</p>
          </blockquote>

          <div className="tutorial-links">
            <Link to="/" className="back-link">Home</Link>
            <Link to="/list" className="back-link">Games</Link>
            <Link to="/profile" className="back-link">Profile</Link>
          </div>
        </section>
      </main>
      <div id="nightOverlay" />
    </div>
  );
}
