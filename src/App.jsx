import React, { useEffect, useRef, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import List from './pages/List';
import Capture from './pages/Capture';
import Decimal from './pages/Decimal';
import HowToPlay from './pages/HowToPlay';
import About from './pages/About';
import MathSynth from './pages/MathSynth';
import Profile from './pages/Profile';
import BennyWorld from './pages/BennyWorld';

export default function App() {
 
  const location = useLocation();
  const showAppNav = location.pathname !== '/' && location.pathname !== '/mathsynth' && location.pathname !== '/about';
  const isGamePage = ['/game', '/capture', '/decimal', '/bennyworld'].includes(location.pathname);
  const isListPage = location.pathname === '/list';
  const isHowToPage = location.pathname === '/howto';
  const isProfilePage = location.pathname === '/profile';
  const hideGameLinks = isListPage || isGamePage || isHowToPage || isProfilePage;
  const [unifyNotice, setUnifyNotice] = useState({ open: false, text: '', topic: '' });
  const [unifyConfirm, setUnifyConfirm] = useState({
    open: false,
    text: '',
    topic: '',
    yesLabel: 'Yes',
    noLabel: 'No'
  });
  const unifyTimerRef = useRef(null);
  const unifyConfirmYesRef = useRef(null);
  const unifyConfirmNoRef = useRef(null);

  useEffect(() => {
    window.showUnifyMessage = (payload) => {
      const next = typeof payload === 'string' ? { text: payload } : (payload || {});
      const text = next.text || 'Congragulations Mr or Ms. Big Spendah';
      const topic = next.topic || '';
      setUnifyNotice({ open: true, text, topic });
      if (unifyTimerRef.current) clearTimeout(unifyTimerRef.current);
      unifyTimerRef.current = setTimeout(() => {
        setUnifyNotice((prev) => ({ ...prev, open: false }));
      }, 3600);
    };
    window.hideUnifyMessage = () => {
      if (unifyTimerRef.current) clearTimeout(unifyTimerRef.current);
      setUnifyNotice((prev) => ({ ...prev, open: false }));
    };
    window.showUnifyConfirm = (payload) => {
      const next = payload || {};
      const text = next.text || 'Use this power now?';
      const topic = next.topic || '';
      const yesLabel = next.yesLabel || 'Yes';
      const noLabel = next.noLabel || 'No';
      unifyConfirmYesRef.current = typeof next.onYes === 'function' ? next.onYes : null;
      unifyConfirmNoRef.current = typeof next.onNo === 'function' ? next.onNo : null;
      setUnifyConfirm({
        open: true,
        text,
        topic,
        yesLabel,
        noLabel
      });
    };
    window.hideUnifyConfirm = () => {
      setUnifyConfirm((prev) => ({ ...prev, open: false }));
    };
    return () => {
      if (unifyTimerRef.current) clearTimeout(unifyTimerRef.current);
      delete window.showUnifyMessage;
      delete window.hideUnifyMessage;
      delete window.showUnifyConfirm;
      delete window.hideUnifyConfirm;
    };
  }, []);

  return (
    <>
      {showAppNav && (
        <nav className="app-nav">
          {!isGamePage && (
            <Link to="/" className="app-logo" aria-label="Home">
              <span className="desk-logo">
                <span className="back" />
                <span className="seat" />
                <span className="leg-left" />
                <span className="leg-right" />
                <span className="desk" />
              </span>
            </Link>
          )}
          {!hideGameLinks && <Link to="/howto">How to Play</Link>}
          {!hideGameLinks && <button 
            className="nav-back"
            onClick={() => (history.length > 1 ? history.back() : (window.location.href = '/'))}
          >
            Back
          </button>}
          {!hideGameLinks && <Link to="/game">Math Pup</Link>}
          {!hideGameLinks && <Link to="/capture">Capture</Link>}
          {!hideGameLinks && <Link to="/decimal">Deci-What?</Link>}
          {!hideGameLinks && <Link to="/mathsynth">Ma+h5Yn+h3</Link>}
          {!hideGameLinks && <Link to="/about">About</Link>}
          {!hideGameLinks && <Link to="/list">Games</Link>}
          {!hideGameLinks && <Link to="/">Home</Link>}
        </nav>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/decimal" element={<Decimal />} />
          <Route path="/mathsynth" element={<MathSynth />} />
          <Route path="/bennyworld" element={<BennyWorld />} />
          <Route path="/list" element={<List />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/howto" element={<HowToPlay />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <div
        className={`unify-toast ${unifyNotice.open ? 'show' : ''}${unifyNotice.topic ? ` topic-${unifyNotice.topic}` : ''}`}
        role="status"
        aria-live="polite"
        aria-hidden={!unifyNotice.open}
      >
        <div className="unify-booiii" aria-hidden="true">
          <div className="unify-booiii__hat">
            <span className="unify-booiii__dot" />
            <span className="unify-booiii__hat-top" />
            <span className="unify-booiii__hat-brim" />
          </div>
          <div className="unify-booiii__head">
            <span className="unify-booiii__eye" />
            <span className="unify-booiii__eye" />
            <span className="unify-booiii__mouth" />
          </div>
          <div className="unify-booiii__torso" />
          <div className="unify-booiii__arms">
            <span className="unify-booiii__arm left" />
            <span className="unify-booiii__arm right" />
          </div>
          <div className="unify-booiii__legs">
            <span className="unify-booiii__leg left" />
            <span className="unify-booiii__leg right" />
          </div>
        </div>
        <div className="unify-bubble">
          {unifyNotice.text}
        </div>
      </div>
      <div
        className={`unify-confirm ${unifyConfirm.open ? 'show' : ''}${unifyConfirm.topic ? ` topic-${unifyConfirm.topic}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!unifyConfirm.open}
      >
        <div className="unify-confirm__backdrop" onClick={() => {
          if (unifyConfirmNoRef.current) unifyConfirmNoRef.current();
          setUnifyConfirm((prev) => ({ ...prev, open: false }));
        }} />
        <div className="unify-confirm__panel">
          <div className="unify-confirm__booiii" aria-hidden="true">
            <div className="unify-booiii">
              <div className="unify-booiii__hat">
                <span className="unify-booiii__dot" />
                <span className="unify-booiii__hat-top" />
                <span className="unify-booiii__hat-brim" />
              </div>
              <div className="unify-booiii__head">
                <span className="unify-booiii__eye" />
                <span className="unify-booiii__eye" />
                <span className="unify-booiii__mouth" />
              </div>
              <div className="unify-booiii__torso" />
              <div className="unify-booiii__arms">
                <span className="unify-booiii__arm left" />
                <span className="unify-booiii__arm right" />
              </div>
              <div className="unify-booiii__legs">
                <span className="unify-booiii__leg left" />
                <span className="unify-booiii__leg right" />
              </div>
            </div>
          </div>
          <div className="unify-confirm__bubble">
            {unifyConfirm.text}
          </div>
          <div className="unify-confirm__actions">
            <button
              type="button"
              className="unify-confirm__btn yes"
              onClick={() => {
                if (unifyConfirmYesRef.current) unifyConfirmYesRef.current();
                setUnifyConfirm((prev) => ({ ...prev, open: false }));
              }}
            >
              {unifyConfirm.yesLabel}
            </button>
            <button
              type="button"
              className="unify-confirm__btn no"
              onClick={() => {
                if (unifyConfirmNoRef.current) unifyConfirmNoRef.current();
                setUnifyConfirm((prev) => ({ ...prev, open: false }));
              }}
            >
              {unifyConfirm.noLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
