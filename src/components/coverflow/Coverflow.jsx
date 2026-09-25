import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { gsap } from "gsap";

// Compute the visual target for a card based on its distance from the active index
function getCardTarget(offset, count) {
  const absOffset = Math.abs(offset);
  const mobile = window.innerWidth < 768;
  return {
    x: offset * (mobile ? 120 : 220), // px shift
    z: absOffset * -160,
    rotationY: offset * -32,
    scale: 1 - absOffset * (mobile ? 0.1 : 0.12),
    opacity: absOffset <= 3 ? 1 : 0,
    filter: `brightness(${1 - absOffset * 0.16})`,
    zIndex: count - absOffset,
  };
}

const MOTION = {
  duration: 0.62,
  ease: "power3.out",
};

function DriveMedia({ item }) {
  if (item.mediaType === "video") {
    return (
      <video
        src={item.media}
        autoPlay
        muted
        loop
        playsInline
        className="certificate-img"
      />
    );
  }
  return (
    <img
      src={item.media}
      alt={item.title}
      className="certificate-img"
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Shared GSAP coverflow carousel used by the Certificates and All-Projects pages.
 * Features: keyboard + touch navigation with velocity inertia, focusable cards,
 * dots indicator, and an animated zoom-to-fill preview modal.
 */
export default function Coverflow({ items, headingRef = null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const cardRefs = useRef([]);
  const trackRef = useRef(null);
  const previewRef = useRef(null);
  const overlayRef = useRef(null);
  const hasMounted = useRef(false);
  const touchStartX = useRef(0);
  const touchLastX = useRef(0);
  const touchLastT = useRef(0);
  const touchVelocity = useRef(0);
  const lastFocused = useRef(null);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    setActiveIndex(clamped);
  }, [items.length]);

  const goPrev = useCallback(
    () => goTo(activeIndex - 1),
    [activeIndex, goTo]
  );
  const goNext = useCallback(
    () => goTo(activeIndex + 1),
    [activeIndex, goTo]
  );

  const updateCardPositions = useCallback(
    (index, animate = true) => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const offset = i - index;
        const target = getCardTarget(offset, items.length);

        gsap.to(card, {
          x: target.x,
          z: target.z,
          rotationY: target.rotationY,
          scale: target.scale,
          opacity: target.opacity,
          filter: target.filter,
          zIndex: target.zIndex,
          duration: animate ? MOTION.duration : 0,
          ease: MOTION.ease,
          overwrite: "auto",
        });
      });

      // Tactile momentum pop on the incoming active card
      if (animate && index >= 0 && cardRefs.current[index]) {
        gsap.fromTo(
          cardRefs.current[index],
          { y: -14 },
          {
            y: 0,
            duration: 0.6,
            ease: "back.out(1.6)",
            overwrite: "auto",
          }
        );
      }
    },
    [items.length]
  );

  // Keyboard navigation (ignored while the preview dialog is open)
  useEffect(() => {
    const handleKey = (e) => {
      if (selected) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext, selected]);

  // Touch swipe with velocity inertia
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchLastX.current = e.touches[0].clientX;
    touchLastT.current = performance.now();
    touchVelocity.current = 0;
  };

  const handleTouchMove = (e) => {
    const x = e.touches[0].clientX;
    const now = performance.now();
    const dt = now - touchLastT.current || 16;
    touchVelocity.current = (x - touchLastX.current) / dt; // px/ms
    touchLastX.current = x;
    touchLastT.current = now;
  };

  const handleTouchEnd = () => {
    const dx = touchLastX.current - touchStartX.current;
    const v = touchVelocity.current;
    // Fast flick or a long swipe advances an extra slide (inertia)
    let step = 1;
    if (Math.abs(dx) > 160 || Math.abs(v) > 0.45) step = 2;
    if (dx < -30) goTo(activeIndex + step);
    else if (dx > 30) goTo(activeIndex - step);
  };

  // Entrance animation
  useLayoutEffect(() => {
    // Skip entrance choreography entirely for reduced-motion users
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasMounted.current = true;
      updateCardPositions(activeIndex, false);
      return;
    }

    const ctx = gsap.context(() => {
      if (headingRef?.current) {
        gsap.from(headingRef.current, {
          y: -30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }

      gsap.from(cardRefs.current, {
        opacity: 0,
        y: 60,
        scale: 0.84,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.15,
        onComplete: () => {
          hasMounted.current = true;
          updateCardPositions(activeIndex, false);
        },
      });

      gsap.from(".coverflow-dots button", {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.55,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasMounted.current) return;
    updateCardPositions(activeIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Recalculate positions on resize
  useEffect(() => {
    const handleResize = () => updateCardPositions(activeIndex, false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleCardHover = (card, isActive, entering) => {
    if (isActive) return;
    gsap.to(card, {
      y: entering ? -14 : 0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleNavClick = (direction) => {
    const btnClass =
      direction === "prev" ? ".coverflow-nav-prev" : ".coverflow-nav-next";
    gsap.fromTo(
      btnClass,
      { scale: 0.85 },
      { scale: 1, duration: 0.35, ease: "back.out(3)" }
    );
    if (direction === "prev") goPrev();
    else goNext();
  };

  const openPreview = (e, item) => {
    setSelected(item);
    lastFocused.current = document.activeElement;

    requestAnimationFrame(() => {
      const img = previewRef.current;
      const overlay = overlayRef.current;
      if (!img || !overlay) return;

      const rect = e.target.getBoundingClientRect();
      gsap.set(overlay, { display: "flex", opacity: 0 });
      gsap.set(img, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 20,
      });

      gsap.to(overlay, { opacity: 1, duration: 0.35 });
      gsap.to(img, {
        top: "20vh",
        left: "20vw",
        width: "60vw",
        height: "60vh",
        duration: 0.7,
        ease: "power3.inOut",
        onStart: () => overlay.focus(),
      });
    });
  };

  const closePreview = () => {
    const overlay = overlayRef.current;

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.35,
      onComplete: () => {
        setSelected(null);
        lastFocused.current?.focus?.();
      },
    });
  };

  const handleCardKeyDown = (e, item, index, isActive) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isActive) openPreview(e, item);
      else goTo(index);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && selected) closePreview();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Trap focus inside the preview dialog while it is open
  useEffect(() => {
    if (!selected) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        overlay.querySelectorAll('[tabindex]:not([tabindex="-1"]), a[href], button')
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
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [selected]);

  return (
    <>
      <div
        className="coverflow"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          className="coverflow-nav coverflow-nav-prev"
          onClick={() => handleNavClick("prev")}
          disabled={activeIndex === 0}
          aria-label="Previous"
        ></button>

        <div className="coverflow-track" ref={trackRef}>
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={item.id}
                ref={(el) => (cardRefs.current[index] = el)}
                className={`certificate-card ${isActive ? "is-active" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`${item.title}${isActive ? " (active)" : ""}`}
                aria-pressed={isActive}
                onClick={(e) => {
                  if (e.target.closest(".certificate-image")) {
                    // Clicking the visual opens the full view (and centres it)
                    goTo(index);
                    openPreview(e, item);
                  } else {
                    goTo(index);
                  }
                }}
                onKeyDown={(e) => handleCardKeyDown(e, item, index, isActive)}
                onMouseEnter={(e) => handleCardHover(e.currentTarget, isActive, true)}
                onMouseLeave={(e) => handleCardHover(e.currentTarget, isActive, false)}
              >
                <div className="certificate-image">
                  <DriveMedia item={item} />
                </div>
                <div className="certificate-card-body">
                  <h2>{item.title}</h2>
                  {item.description && <p>{item.description}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="coverflow-nav coverflow-nav-next"
          onClick={() => handleNavClick("next")}
          disabled={activeIndex === items.length - 1}
          aria-label="Next"
        ></button>
      </div>

      <div className="coverflow-dots" role="tablist" aria-label="Slides">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`coverflow-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}: ${item.title}`}
            aria-selected={index === activeIndex}
          ></button>
        ))}
      </div>

      {selected && (
        <div
          ref={overlayRef}
          className="certificate-overlay"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${selected.title}`}
          tabIndex={-1}
        >
          {selected.mediaType === "video" ? (
            <video
              src={selected.media}
              autoPlay
              muted
              loop
              playsInline
              tabIndex={0}
              aria-label={selected.title}
              ref={previewRef}
              className="certificate-preview"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={selected.media}
              alt={selected.title}
              tabIndex={0}
              ref={previewRef}
              className="certificate-preview"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}