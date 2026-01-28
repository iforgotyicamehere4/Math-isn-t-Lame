import React from 'react';
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
    </>
  );
}
