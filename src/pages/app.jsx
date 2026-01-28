import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// direct imports — these must match filenames exactly (case-sensitive)
import Home from './Home';
import Game from './pages/Game';
import HowToPlay from './pages/HowToPlay';
import List from './pages/List';
import Capture from './pages/Capture';
import Decimal from './pages/Decimal';

export default function App() {
  return (
    <>
      <nav style={{ padding: 12 }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/game" style={{ marginRight: 12 }}>Game</Link>
        <Link to="/howto" style={{ marginRight: 12 }}>How to Play</Link>
        <Link to="/list" style={{ marginRight: 12 }}>Games</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/howto" element={<HowToPlay />} />
          <Route path="/list" element={<List />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/decimal" element={<Decimal />} />
        </Routes>
      </main>
    </>
  );
}