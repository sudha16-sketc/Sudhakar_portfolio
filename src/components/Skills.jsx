import "../styles/global.css";
import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const TechIcon = lazy(() => import("../components/models/techlogos/TechIcon"));

class TechIconBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

gsap.registerPlugin(ScrollTrigger);

function Skills() {
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const sectionRef = useRef(null);
  const [showTechIcons, setShowTechIcons] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState(false);

  const skills = [
    {
      title: "Languages",
      icon: {
        modelPath: "/models/python_programming_language.glb",
        scale: 1,
        rotation: [0, 0, 0],
        fallback: "PY",
      },
      items: ["JavaScript", "Solidity", "Python"],
    },
    {
      title: "Frontend",
      icon: {
        modelPath: "/models/react_logo.glb",
        scale: 1,
        rotation: [0, 0, 0],
        fallback: "UI",
      },
      items: ["React", "HTML5", "CSS3", "Tailwind CSS", "GSAP"],
    },
    {
      title: "Backend",
      icon: {
        modelPath: "/models/node.js_logo__3d_model.glb",
        scale: 50,
        rotation: [0, -Math.PI / 2, 0],
        fallback: "API",
      },
      items: ["Node.js", "Express", "PostgreSQL"],
    },
    {
      title: "Blockchain",
      icon: {
        modelPath: "/models/bitcoin.glb",
        scale: 0.9,
        rotation: [0, 0, 0],
        fallback: "ETH",
      },
      items: ["Ethereum", "Solidity", "Hardhat", "Stellar"],
    },
  ];

  useEffect(() => {
    const target = sectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShowTechIcons(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowTechIcons(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mediaPrefersStatic =
      typeof window.matchMedia === "function" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(pointer: coarse)").matches);
    const isLowMemory =
      typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
    if (mediaPrefersStatic || isLowMemory || navigator.connection?.saveData) return;

    const canvas = document.createElement("canvas");
    try {
      const context =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      if (context) {
        context.getExtension("WEBGL_lose_context")?.loseContext();
        setWebGLAvailable(true);
      }
    } catch {
      setWebGLAvailable(false);
    }
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 70,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 90%",
        },
      });

      cardsRef.current.forEach((card) => {
        if (!card) return;

        gsap.from(card.querySelectorAll("li"), {
          opacity: 0,
          x: -20,
          stagger: 0.08,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = sectionRef.current.querySelectorAll(".skill-card");
      gsap.fromTo(
        cards,
        { y: window.innerWidth <= 768 ? 30 : 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: window.innerWidth <= 768 ? "top 90%" : "top center",
            toggleActions: "play none none reset",
          },
        }
      );
    },
    {
      scope: sectionRef,
      dependencies: [],
    }
  );

  return (
    <section id="skills">
      <div className="section-title" ref={titleRef}>
        <p>Technologies</p>
        <h2>Tech Stack</h2>
      </div>

      <div className="skills-grid" ref={sectionRef}>
        {skills.map((skill, index) => (
          <div
            key={skill.title}
            className="skill-card"
            ref={(el) => (cardsRef.current[index] = el)}
          >
            <div className="tech-icon-wrapper">
              {showTechIcons && webGLAvailable ? (
                <TechIconBoundary
                  fallback={
                    <span className="tech-icon-fallback" aria-hidden="true">
                      {skill.icon.fallback}
                    </span>
                  }
                >
                  <Suspense
                    fallback={
                      <span className="tech-icon-fallback" aria-hidden="true">
                        {skill.icon.fallback}
                      </span>
                    }
                  >
                    <TechIcon model={skill.icon} />
                  </Suspense>
                </TechIconBoundary>
              ) : (
                <span className="tech-icon-fallback" aria-hidden="true">
                  {skill.icon.fallback}
                </span>
              )}
            </div>

            <h3>{skill.title}</h3>

            <ul>
              {skill.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
