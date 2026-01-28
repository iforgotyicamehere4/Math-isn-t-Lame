import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Home page (React)
 * - Contrast toggle persisted to localStorage
 * - Modal auth that persists profiles to localStorage
 * - Displays current user and high score
 */
export default function Home() {
  const wordRef = useRef(null);
  const navigate = useNavigate?.() || (() => { window.location.href = '/game'; });
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  const [showModal, setShowModal] = useState(false);

  // Signup modal state
  const [suUsername, setSuUsername] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [dataAccept, setDataAccept] = useState(false);

  const [currentUser, setCurrentUserState] = useState(() => localStorage.getItem('mathpop_current_user') || null);
  const [homeHighScore, setHomeHighScore] = useState(0);

  // Keep body class in sync with app state
  useEffect(() => {
    document.body.classList.toggle('high-contrast', !!highContrast);
    localStorage.setItem('highContrast', highContrast ? 'true' : 'false');
  }, [highContrast]);

  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => el.classList.add('animate'));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const hs = parseInt(localStorage.getItem('mathpop_highscore_' + currentUser) || '0', 10);
      setHomeHighScore(Number.isNaN(hs) ? 0 : hs);
    } else {
      setHomeHighScore(0);
    }
  }, [currentUser]);

  // Profile helpers
  function saveProfile(profile) {
    if (!profile || !profile.username) return;
    localStorage.setItem('mathpop_profile_' + profile.username, JSON.stringify(profile));
    setCurrentUser(profile.username);
  }
  function loadProfileFor(username) {
    if (!username) return null;
    const s = localStorage.getItem('mathpop_profile_' + username);
    return s ? JSON.parse(s) : null;
  }
  function setCurrentUser(username) {
    if (username) {
      localStorage.setItem('mathpop_current_user', username);
      setCurrentUserState(username);
    } else {
      localStorage.removeItem('mathpop_current_user');
      setCurrentUserState(null);
    }
  }
  function saveEmailToList(email) {
    if (!email) return;
    try {
      const key = 'mathpop_emails';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      if (!arr.includes(email)) arr.push(email);
      localStorage.setItem(key, JSON.stringify(arr));
      localStorage.setItem('mathpop_email_compilation', arr.join(','));
    } catch { /* ignore */ }
  }

  function navigateToGame() {
    // prefer SPA navigation if useNavigate is available
    try {
      if (typeof navigate === 'function') {
        navigate('/game');
        return;
      }
    } catch { /* fallback */ }
    // fallback to legacy game.html
    window.location.href = '/game';
  }

  // Modal signup
  function handleSignup() {
    if (!suUsername.trim() || !suEmail.trim() || !suPassword) {
      alert('Please fill all fields');
      return;
    }
    if (!dataAccept) {
      alert('You must accept the disclaimer');
      return;
    }
    const profile = { username: suUsername.trim(), email: suEmail.trim(), created: Performance.now() };
    saveProfile(profile);
    localStorage.setItem('mathpop_highscore_' + profile.username, localStorage.getItem('mathpop_highscore_' + profile.username) || '0');
    saveEmailToList(profile.email);
    setShowModal(false);
    alert('Profile created — starting game');
    setTimeout(navigateToGame, 200);
  }

  function handleSignin() {
    if (!suUsername.trim() || !suEmail.trim()) {
      alert('Please fill both fields');
      return;
    }
    const stored = loadProfileFor(suUsername.trim());
    if (!stored || stored.email !== suEmail.trim()) { alert('No matching profile found'); return; }
    setCurrentUser(suUsername.trim());
    setShowModal(false);
    alert('Signed in — starting game');
    setTimeout(navigateToGame, 200);
  }

  function handleLogout() {
    setCurrentUser(null);
    // quick reload to refresh UI
    window.location.reload();
  }


  return (
    <div className="background">
    <nav>
      <div className="logo">
        <span className="desk-logo">
          <span className="back" />
          <span className="seat" />
          <span className="leg-left" />
          <span className="leg-right" />
          <span className="desk" />
        </span>
      </div>

        <div id="userArea" className="user-area" style={{ marginLeft: 12 }}>
          <span id="usernameDisplay" style={{ display: currentUser ? 'inline' : 'none' }}>{currentUser}</span>
          <button id="logoutBtn" style={{ display: currentUser ? 'inline-block' : 'none' }} onClick={handleLogout}>Logout</button>
        </div>

        <ul className="nav" style={{ listStyle: 'none', display: 'flex', gap: 8, padding: 0 }}>
          <li><Link to="/howto">How to Play</Link></li>
          <li><Link to="/list">Games</Link></li>
          <li><Link to="/about">About</Link></li>
          {currentUser && <li><Link to="/profile">Profile</Link></li>}
        </ul>
    </nav>

    <button
      className="home-benny"
      type="button"
      aria-pressed={highContrast ? 'true' : 'false'}
      title="Toggle high contrast"
      onClick={() => setHighContrast((v) => !v)}
    >
      <span className="benny-base">
        <span className="benny-shape">
          <span className="back" />
          <span className="leg-left" />
          <span className="leg-right" />
          <span className="head" />
        </span>
      </span>
    </button>

      <header>
        <div className="hero-card">
         
          <p className="tagline">Math isn&apos;t lame — it&apos;s an adventure!</p>
          <p className="description">
            "Bark Bark" "My homework is gone...... I didn't eat it...... Can you help me?" 
          </p>

          <div className="hero-actions" id="heroActions">
            <button className="start-btn" id="createProfile" onClick={() => setShowModal(true)}>Sign Up / Sign In</button>
            {currentUser && (
              <Link className="start-btn" style={{ marginLeft: 8, textDecoration: 'none' }} to="/profile">
                View Profile
              </Link>
            )}
            <div id="homeHighScore" style={{ marginTop: 10, color: '#e9e2e2', fontWeight: 700 }}>
              {currentUser ? `${currentUser} — High Score: ${homeHighScore}` : 'Not signed in'}
            </div>
          </div>
        </div>
      </header>

      {/* classroom grid (kept simple) */}
    <section
      ref={wordRef}
      className="classroom classroom-word"
      aria-label="Classroom seating"
    >
      {(() => {
        const letters = {
          M: ['101','111','101','101','101'],
          A: ['010','101','111','101','101'],
          T: ['111','010','010','010','010'],
          H: ['101','101','111','101','101'],
          I: ['1','1','1','1','1'],
          S: ['111','100','111','001','111'],
          L: ['100','100','100','100','111']
        };
        const rows = 5;
        const letterGap = '0';
        const wordGap = '00';
        const buildWord = (chars) => {
          const out = Array.from({ length: rows }, () => '');
          chars.forEach((ch, idx) => {
            const pattern = letters[ch];
            for (let r = 0; r < rows; r++) out[r] += pattern[r];
            if (idx < chars.length - 1) {
              for (let r = 0; r < rows; r++) out[r] += letterGap;
            }
          });
          return out;
        };
        const math = buildWord(['M','A','T','H']);
        const isWord = buildWord(['I','S']);
        const lit = buildWord(['L','I','T']);
        const merged = math.map((row, idx) => `${row}${wordGap}${isWord[idx]}${wordGap}${lit[idx]}`);
        const targets = [];
        merged.forEach((row, r) => {
          row.split('').forEach((cell, c) => {
            if (cell === '1') targets.push({ r, c });
          });
        });
        const cellSize = 26;
        const scatterWidth = merged[0].length * cellSize;
        const scatterHeight = rows * cellSize;
        return (
          <div
            className="chair-field"
            style={{
              '--cell': `${cellSize}px`,
              width: `${merged[0].length * cellSize}px`,
              height: `${rows * cellSize}px`
            }}
          >
            {targets.map((t) => {
              const startX = Math.floor(Math.random() * scatterWidth);
              const startY = Math.floor(Math.random() * scatterHeight);
              return (
                <div
                  key={`${t.r}-${t.c}`}
                  className="chair"
                  style={{
                    '--start-x': `${startX}px`,
                    '--start-y': `${startY}px`,
                    '--end-x': `${t.c * cellSize}px`,
                    '--end-y': `${t.r * cellSize}px`
                  }}
                >
                  <div className="back" />
                  <div className="seat" />
                  <div className="leg-left" />
                  <div className="leg-right" />
                  <div className="desk" />
                </div>
              );
            })}
          </div>
        );
      })()}
    </section>

      {/* Modal */}
      <div id="authModal" className="modal" aria-hidden={showModal ? 'false' : 'true'} style={{ display: showModal ? 'flex' : 'none' }}>
        <div className="modal-content" role="dialog" aria-modal="true">
          <button className="modal-close" id="authClose" onClick={() => setShowModal(false)}>✕</button>
          <h2 id="modalTitle">Sign Up / Sign In</h2>
          <div className="auth-tabs">
            <button className={showModal ? 'active' : ''} style={{ marginRight: 8 }} onClick={() => { /* stay on signup */ }}>Sign Up</button>
            <button onClick={() => { /* switch to sign in visually by toggling forms, but kept simple here */ }}>Sign In</button>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
            <label>Username<input id="suUsername" required value={suUsername} onChange={(e) => setSuUsername(e.target.value)} /></label>
            <label>Email<input id="suEmail" type="email" required value={suEmail} onChange={(e) => setSuEmail(e.target.value)} /></label>
            <label>Password<input id="suPassword" type="password" required value={suPassword} onChange={(e) => setSuPassword(e.target.value)} /></label>
            <label className="disclaimer"><input id="dataAccept" type="checkbox" checked={dataAccept} onChange={(e) => setDataAccept(e.target.checked)} /> I accept the <strong>disclaimer</strong> below</label>
            <div className="disclaimer-box">
              By signing up you agree that we may sell emails and data to fund the
              website and game development. An ad-free experience is available for
              $15/year.
            </div>
            <div className="auth-actions">
              <button type="button" id="doSignUp" onClick={handleSignup}>Create Profile/Sign in</button>
              <button type="button" id="doSignIn" onClick={handleSignin} style={{ marginLeft: 8 }}>Sign In</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
