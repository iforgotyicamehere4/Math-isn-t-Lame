import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/lists.css';

export default function List() {
  return (
    <div className="list-page">
      <div className="list-bar">
        <Link className="back-link" to="/">← Home</Link>
        <h1>Available Games</h1>
      </div>

      <main className="main-content">
        <p>Select a game to play:</p>
        <ul className="game-list">
          <li><Link to="/game">Math Pup</Link></li>
          <li><Link to="/capture">Capture The Fraction</Link></li>
          <li><Link to="/decimal">Deci-What?</Link></li>
          <li><Link to="/mathsynth">Ma+h5Yn+h3 (MathSynth)</Link></li>
          <li><Link to="/bennyworld">Benny World (Zone 1)</Link></li>
        </ul>
      </main>
    </div>
  );
}
