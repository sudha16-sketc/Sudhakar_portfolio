import React from 'react';
import { Hero as HeroMain } from './Hero/Hero.jsx';
import { Cursor } from './Hero/Cursor.jsx';

export const Hero = () => {
  return (
    <div className="portfolio-app">
      {/* Custom Desktop Interactive Cursor */}
      <Cursor />

      {/* Main Interactive Hero Section */}
      <main>
        <HeroMain />
      </main>
    </div>
  );
};

export default Hero;
