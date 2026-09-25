import React, { useEffect, useRef, useState } from 'react';
import { CharacterTrackerEngine } from './CharacterTrackerEngine.js';
import './CharacterTracker.css';

export const CharacterTracker = ({ onLoaded }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Check accessibility & device capabilities
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchOnly = window.matchMedia('(pointer: coarse)').matches;

    // If reduced motion or touch device, we can initialize and display neutral frame
    const engine = new CharacterTrackerEngine({
      canvas: canvasRef.current,
      container: containerRef.current,
      totalDirectionalFrames: 164,
      deadzoneRadiusRatio: 0.12,
      lerpFactor: prefersReducedMotion || isTouchOnly ? 0 : 0.25,
      onProgress: (p) => {
        setLoadProgress(Math.round(p * 100));
      },
      onReady: () => {
        setIsLoading(false);
        if (onLoaded) {
          onLoaded();
        }
      }
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [onLoaded]);

  return (
    <div className="character-tracker-wrapper" ref={containerRef}>
      {/* Sleek loading state */}
      {isLoading && (
        <div className="character-loading-overlay">
          <div className="character-loading-spinner" />
          <div className="character-loading-bar-wrap">
            <div
              className="character-loading-bar-fill"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="character-loading-text">
            Initializing Studio Experience &bull; {loadProgress}%
          </span>
        </div>
      )}

      {/* Zero-ghosting single-frame Canvas */}
      <canvas
        ref={canvasRef}
        className={`character-canvas ${isLoading ? 'character-canvas-hidden' : 'character-canvas-visible'}`}
      />
    </div>
  );
};

export default CharacterTracker;