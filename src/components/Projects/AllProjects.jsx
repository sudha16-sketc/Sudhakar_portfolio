import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { gsap } from "gsap";
import "../../styles/global.css";

const projects = [
  {
    title: "BuildVerse",
    description:
      "Gamified Web3 builder platform with wallet authentication, reputation system, community posts, bounty management and blockchain rewards.",
    video: "/videos/blockVerse.mp4",
    veiw: "",
    github: "",
    documentation: "",
  },
  {
    title: "FinWise AI",
    description:
      "AI-powered financial advisor integrating Gemini AI and Stellar blockchain reward mechanisms for budgeting and savings.",
    video: "/videos/finwise.mp4",
    veiw: "",
    github: "",
    documentation: "",
  },
  {
    title: "CodeCraft",
    description:
      "Gamified blockchain learning platform using Ethereum, Solidity, ERC-20 rewards and NFT achievement certificates.",
    video: "/videos/codecarft.mp4",
    veiw: "",
    github: "",
    documentation: "",
  },
  {
    title: "Shadow AI",
    description:
      "AI security assistant that prevents accidental sharing of credentials, API keys and confidential information with public AI tools.",
    video: "/videos/shadow.mp4",
    veiw: "",
    github: "",
    documentation: "",
  },
  {
    title: "PlantCare AI",
    description:
      "AI-powered smart gardening assistant providing personalized plant care recommendations using Gemini AI and intelligent visual guides.",
    video: "/videos/plantcare.mp4",
    veiw: "",
    github: "",
    documentation: "",
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
    zIndex: projects.length - absOffset,
  };
}

export default function AllProjects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef([]);
  const sectionRef = useRef(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const hasMounted = useRef(false);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const previewRef = useRef(null);
  const overlayRef = useRef(null);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, index));
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
  const openPreview = (e, projects) => {
    setSelectedProjects(projects);

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
        setSelectedProjects(null);
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
      <h1 className="certificate-heading">My Projects</h1>

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
          aria-label="Previous Project"
        ></button>

        <div className="coverflow-track">
          {projects.map((projects, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={index}
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
                  <video
                    src={projects.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="certificate-img"
                    onClick={(e) => openPreview(e, projects)}
                  />
                </div>

                <h2>{projects.title}</h2>
                <p>{projects.description}</p>
                {/* <div className="project-info">
                  <button>
                    <a href={projects.veiw}>Veiw Project</a>
                  </button>
                  <button>
                    <a href={projects.github}>Github Repo</a>
                  </button>
                  <button>
                    <a href={projects.documentation}>Veiw Documentation</a>
                  </button>
                </div> */}
              </div>
            );
          })}
        </div>

        <button
          className="coverflow-nav coverflow-nav-next"
          onClick={() => handleNavClick("next")}
          disabled={activeIndex === projects.length - 1}
          aria-label="Next certificate"
        ></button>
      </div>

      {selectedProjects && (
        <div
          className="certificate-overlay"
          ref={overlayRef}
          onClick={closePreview}
        >
          <video
            src={projects.video}
            autoPlay
            muted
            loop
            playsInline
            ref={previewRef}
            src={selectedProjects.video}
            alt={selectedProjects.title}
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
