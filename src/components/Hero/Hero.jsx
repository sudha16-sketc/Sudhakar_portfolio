import React, { useEffect, useState } from 'react';
import { CharacterTracker } from './CharacterTracker.jsx';
import { ArrowUpRight, Sparkles, Mail } from 'lucide-react';
import './Hero.css';

const navItems = [
  { label: 'WORK', target: 'projects' },
  { label: 'ABOUT', target: 'about' },
  { label: 'CONTACT', target: 'contact' },
  { label: 'EXPERIENCE', target: 'experience' },
  { label: 'TECH STACK', target: 'skills' },
];

export const Hero = () => {
  const [activeNav, setActiveNav] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (e, target) => {
    e.preventDefault();
    if (menuOpen) {
      setMenuOpen(false);
      // Return focus to the toggle after the drawer closes
      if (window.matchMedia('(max-width: 1024px)').matches) {
        document.querySelector('.nav-toggle')?.focus();
      }
    }
    const el = document.getElementById(target);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Lock body scroll while the mobile menu is open + close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const nav = document.getElementById('primary-nav');
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        document.querySelector('.nav-toggle')?.focus();
        return;
      }
      if (e.key === 'Tab' && nav) {
        const focusables = Array.from(
          nav.querySelectorAll('a[href], button:not([disabled])')
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    // Move focus into the drawer on open
    nav?.querySelector('a[href]')?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => {
      const offset = window.innerHeight * 0.4;
      let current = '';
      navItems.forEach((item) => {
        const el = document.getElementById(item.target);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = item.label;
        }
      });
      setActiveNav(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero-container" id="hero" aria-label="Hero Section">

      {/* ── Full-screen Character Canvas (centrepiece, sits behind everything) ── */}
      <div className="hero-character-section" aria-label="Interactive character">
        <CharacterTracker />
      </div>

      {/* ── Fixed Top Navigation (the site navbar) ──────────────────────── */}
      <header className="hero-header">
        <div className="hero-brand" aria-label="Logo">
          <span className="brand-dot" />
          <span className="brand-title">SUDHAKAR</span>
          <span className="brand-tag">DEV &bull; 2026</span>
        </div>

        <nav
          id="primary-nav"
          className={`nav-pill ${menuOpen ? 'open' : ''}`}
          aria-label="Primary Navigation"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`#${item.target}`}
              className={`nav-pill-item ${activeNav === item.label ? 'active' : ''}`}
              aria-current={activeNav === item.label ? 'true' : undefined}
              onClick={(e) => handleNavClick(e, item.target)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <div className="hero-header-badge">
          <Sparkles className="badge-icon" size={13} />
          <span>AVAILABLE FOR PROJECTS</span>
        </div>
      </header>

      {/* Keeps hero flex layout intact under the fixed navbar */}
      <div className="hero-header-spacer" aria-hidden="true" />

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
              href="/Resume.pdf"
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
              onClick={(e) => handleNavClick(e, 'contact')}
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