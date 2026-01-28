import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="about-page">
      <Link to="/" className="back-link">Back</Link>
      <header className="about-hero">
        <h1>About</h1>
        <p className="about-subtitle">Welcome to a platform for anyone. <br />
         No matter where your from you can practice math and maybe have some fun <br />
        Play with numbers and words that confuse the soul, <br />
         fractions and decimals even santa doesn&apos;t know <br />
        can you take your self serious and reach the goal?
        become a math wiz and maybe just maybe Mathanomical! 
        </p>
      </header>

      <section className="about-section">
        <h2>Mission</h2>
        <p>Get better at basic and somewhat complex math. 2 sides here. One side a game.
           the other side a tool for parents and teachers. 
           <br /><mark> have fun.... duh!</mark>
          
        </p>
      </section>

      
      <section className="about-section">
        <h2>Team</h2>
        <p> I would really like to get a team of like minded people to work on this project with me.
          If you&apos;re interested in building this with me email me daquota92@gmail.com </p>
    
      </section>
    </main>
  );
}
