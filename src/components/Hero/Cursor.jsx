import React, { useEffect, useRef, useState } from 'react';
import './Cursor.css';

export const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  const posRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    // Check if device supports fine cursor and motion is not reduced
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    const handleMouseMove = (e) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target;
      if (target) {
        const interactive = target.closest('a, button, [role="button"], input, select, textarea, .nav-pill-item, .interactive-hover');
        setIsHovering(!!interactive);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const pos = posRef.current;
      // Smooth trailing interpolation
      pos.x += (pos.targetX - pos.x) * 0.22;
      pos.y += (pos.targetY - pos.y) * 0.22;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.targetX}px, ${pos.targetY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isVisible]);

  if (!isEnabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${isVisible ? 'visible' : ''} ${isHovering ? 'hovering' : ''}`}
      />
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isVisible ? 'visible' : ''} ${isHovering ? 'hovering' : ''}`}
      />
    </>
  );
};

export default Cursor;