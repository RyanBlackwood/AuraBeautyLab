import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Camera, RotateCcw, Save, Wand2, Hand, SlidersHorizontal, X, FlipHorizontal2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Designer } from './components/Designer.jsx';
import './styles/app.css';

function App() {
  return (
    <main className="abl-page">
      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">A</div>
          <div>
            <h1>Aura Beauty Lab</h1>
            <p>Luxury Nail Technology</p>
          </div>
        </div>
        <nav className="desktop-nav">
          <a href="#designer">Designer</a>
          <a href="#try-on">AR Try-On</a>
          <a href="#booking">Booking</a>
        </nav>
        <button className="menu-button">Menu</button>
      </header>

      <section className="hero">
        <motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="eyebrow">
          Interactive Nail Design Studio
        </motion.p>
        <motion.h2 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.05}}>
          Design the exact set before the appointment.
        </motion.h2>
        <motion.p initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="hero-copy">
          A polished client-facing builder with a live realistic preview, saved look summary, and browser-based AR try-on with hand tracking fallback controls.
        </motion.p>
      </section>

      <Designer />

      <section id="booking" className="booking-card">
        <div>
          <p className="eyebrow small">Ready for launch prep</p>
          <h3>Every saved look becomes a clean tech brief.</h3>
          <p>Shape, length, finish, color, and client notes are stored locally now. Hook this into your booking form or backend when you are ready.</p>
        </div>
        <button className="primary-action">Book Consultation</button>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
