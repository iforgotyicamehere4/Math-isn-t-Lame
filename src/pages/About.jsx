import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="about-page">
      <Link to="/" className="back-link">Back</Link>
      <header className="about-hero">
        <h1>About</h1>
        <p className="about-subtitle">Bark Bark<br/> Welcome to a platform for anyone. <br />
         No matter where your from you can practice math and maybe have some fun <br />
        Play with numbers and words that confuse the soul, <br />
         fractions and decimals even santa doesn&apos;t know <br />
        can you take your self serious and reach the goal?
        become a math wiz and maybe just maybe Mathanomical! 
        </p>
      </header>

      <section className="about-section">
        <h2>Mission</h2>
        <p>Get better at basic and somewhat complex math. <br/>
         We want to make math fun and accessible for everyone, especially those who may have struggled with it in traditional settings. <br />
         Our games are designed to be engaging and rewarding, helping you build confidence and skills in a playful way.</p>
      </section> 
   

      
    
    </main>
  );
}
