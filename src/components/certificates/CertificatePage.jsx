import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { gsap } from "gsap";
import "../../styles/global.css";

const certificates = [
  {
    id: 1,
    Image: "/img/stellar.jpg",
    title: "stellar builderchallenge",
  },
  {
    id: 2,
    Image: "/img/java.jpg",
    title: "java",
  },
  {
    id: 3,
    Image: "/img/udemy.png",
    title: "fullstack web Development bootcamp",
  },
];

// Compute the visual target for a card based on its distance from the active index
function getCardTarget(offset) {
  const absOffset = Math.abs(offset);
  return {
    x: offset * (window.innerWidth < 768 ? 130 : 220), // px shift
    z: absOffset * -160,
    rotationY: offset * -35,
    scale: 1 - absOffset * 0.12,
    opacity: absOffset <= 3 ? 1 : 0,
    filter: `brightness(${1 - absOffset * 0.15})`,
    zIndex: certificates.length - absOffset,
  };
}

export default function CertificatePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef([]);
  const sectionRef = useRef(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const hasMounted = useRef(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const previewRef = useRef(null);
  const overlayRef = useRef(null);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(certificates.length - 1, index));
    setActiveIndex(clamped);
  }, []);

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext]);

  // Touch / swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current > 50) goPrev();
    else if (touchDeltaX.current < -50) goNext();
    touchDeltaX.current = 0;
  };

  // Entrance animation on mount
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".certificate-heading", {
        y: -30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(cardRefs.current, {
        opacity: 0,
        y: 60,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.15,
        onComplete: () => {
          hasMounted.current = true;
          // Snap to correct resting position after entrance
          updateCardPositions(activeIndex, false);
        },
      });

      gsap.from(".coverflow-dot", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.6,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const openPreview = (e, certificate) => {
    setSelectedCertificate(certificate);

    requestAnimationFrame(() => {
      const img = previewRef.current;
      const overlay = overlayRef.current;

      if (!img || !overlay) return;

      const rect = e.target.getBoundingClientRect();

      gsap.set(overlay, {
        display: "flex",
        opacity: 0,
      });

      gsap.set(img, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 20,
      });

      gsap.to(overlay, {
        opacity: 1,
        duration: 0.35,
      });

      gsap.to(img, {
        top: "20vh",
        left: "20vw",
        width: "60vw",
        height: "60vh",
        duration: 0.7,
        ease: "power3.inOut",
      });
    });
  };

  const closePreview = () => {
    const img = previewRef.current;
    const overlay = overlayRef.current;

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.35,
      onComplete: () => {
        setSelectedCertificate(null);
      },
    });
  };
  // Animate cards whenever activeIndex changes
  function updateCardPositions(index, animate = true) {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const offset = i - index;
      const target = getCardTarget(offset);

      gsap.to(card, {
        x: target.x,
        z: target.z,
        rotationY: target.rotationY,
        scale: target.scale,
        opacity: target.opacity,
        filter: target.filter,
        zIndex: target.zIndex,
        duration: animate ? 0.7 : 0,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  }

  useEffect(() => {
    if (!hasMounted.current) return;
    updateCardPositions(activeIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Recalculate on resize (px-based offsets depend on viewport width)
  useEffect(() => {
    const handleResize = () => updateCardPositions(activeIndex, false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleCardHover = (card, isActive, entering) => {
    if (isActive) return; // active card handled separately
    gsap.to(card, {
      y: entering ? -12 : 0,
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
      { scale: 1, duration: 0.35, ease: "back.out(3)" },
    );
    direction === "prev" ? goPrev() : goNext();
  };

  useEffect(() => {
    const handleKey = (e) => {
        if (e.key === "Escape") {
            closePreview();
        }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
}, []);

  return (
    <section className="certificate-section" ref={sectionRef}>
            <video
    className="background-video"
    autoPlay
    muted
    loop
    playsInline
  >
    <source
      src="/videos/14114346_1920_1080_30fps.mp4"
      type="video/mp4"
    />
  </video>
      <h1 className="certificate-heading">My Certificates</h1>

      <div
        className="coverflow"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="coverflow-nav coverflow-nav-prev"
          onClick={() => handleNavClick("prev")}
          disabled={activeIndex === 0}
          aria-label="Previous certificate"
        ></button>

        <div className="coverflow-track">
          {certificates.map((certificate, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={certificate.id}
                ref={(el) => (cardRefs.current[index] = el)}
                className={`certificate-card ${isActive ? "is-active" : ""}`}
                onClick={() => goTo(index)}
                onMouseEnter={(e) =>
                  handleCardHover(e.currentTarget, isActive, true)
                }
                onMouseLeave={(e) =>
                  handleCardHover(e.currentTarget, isActive, false)
                }
              >
                <div className="certificate-image">
                  <img
                    src={certificate.Image}
                    alt={certificate.title}
                    className="certificate-img"
                    onClick={(e) => openPreview(e, certificate)}
                  />
                </div>

                <h2>{certificate.title}</h2>
              </div>
            );
          })}
        </div>

        <button
          className="coverflow-nav coverflow-nav-next"
          onClick={() => handleNavClick("next")}
          disabled={activeIndex === certificates.length - 1}
          aria-label="Next certificate"
        ></button>
      </div>



      {selectedCertificate && (
    <div
        className="certificate-overlay"
        ref={overlayRef}
        onClick={closePreview}
    >
        <img
            ref={previewRef}
            src={selectedCertificate.Image}
            alt={selectedCertificate.title}
            className="certificate-preview"
            onClick={(e) => e.stopPropagation()}
        />
    </div>
)}

    <button
        className="contact-back-btn"
        onClick={() => window.history.back()}
      >
        ⬅ BACK
      </button>
    </section>
  );
}
