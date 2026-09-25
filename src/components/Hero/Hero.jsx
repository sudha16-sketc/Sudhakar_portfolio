import React, { useState } from 'react';
import { CharacterTracker } from './CharacterTracker.jsx';
import { ArrowUpRight, Sparkles, Mail } from 'lucide-react';
import './Hero.css';

export const Hero = () => {
  const [activeNav, setActiveNav] = useState('WORK');

  const navItems = ['WORK', 'ABOUT', 'CONTACT'];

  return (
    <section className="hero-container" id="hero" aria-label="Hero Section">

      {/* ── Full-screen Character Canvas (centrepiece, sits behind everything) ── */}
      <div className="hero-character-section" aria-label="Interactive character">
        <CharacterTracker />
      </div>

      {/* ── Floating Top Navigation (z-index: 20, above character) ────────── */}
      <header className="hero-header">
        <div className="hero-brand" aria-label="Logo">
          <span className="brand-dot" />
          <span className="brand-title">SUDHAKAR</span>
          <span className="brand-tag">DEV &bull; 2026</span>
        </div>

        <nav className="nav-pill" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`nav-pill-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="hero-header-badge">
          <Sparkles className="badge-icon" size={13} />
          <span>AVAILABLE FOR PROJECTS</span>
        </div>
      </header>

      {/* ── Bottom Content Overlay (gradient + text + CTAs) ──────────────── */}
      <div className="hero-content">
        <div className="hero-text-block">
          <div className="hero-greeting">
            <span className="greeting-sub">Hi, I'm</span>
            <h1 className="hero-name">Sudhakar</h1>
          </div>

          <p className="hero-description">
            Full-Stack &amp; Blockchain Developer building intelligent products,
            secure systems and interactive web experiences.
          </p>

          <div className="hero-cta-group">
            <a
              href="#resume"
              className="hero-btn hero-btn-primary"
              aria-label="View Resume"
            >
              <span>Resume</span>
              <ArrowUpRight className="btn-arrow" size={16} />
            </a>

            <a
              href="#contact"
              className="hero-btn hero-btn-secondary"
              aria-label="Contact Sudhakar"
            >
              <Mail className="btn-icon" size={15} />
              <span>Let's Talk</span>
            </a>
          </div>
        </div>

        {/* Technical Capabilities Pill Matrix */}
        <div className="hero-footer-meta">
          <div className="meta-pill">
            <span className="meta-pulse" />
            <span>Smart Contracts &bull; Web3</span>
          </div>
          <div className="meta-pill">
            <span>High-Performance Frontends</span>
          </div>
          <div className="meta-pill">
            <span>Distributed Systems</span>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;