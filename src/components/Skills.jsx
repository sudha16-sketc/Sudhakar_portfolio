import "../styles/global.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TechIcon from "../components/models/techlogos/TechIcon";

gsap.registerPlugin(ScrollTrigger);

function Skills() {
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const sectionRef = useRef(null);

  const skills = [
    {
      title: "Languages",
      icon: {
        modelPath: "/models/python_programming_language.glb",
        scale: 1,
        rotation: [0, 0, 0],
      },
      items: ["JavaScript", "Solidity", "Python"],
    },
    {
      title: "Frontend",
      icon: {
        modelPath: "/models/react_logo.glb",
        scale: 1,
        rotation: [0, 0, 0],
      },
      items: ["React", "HTML5", "CSS3", "Tailwind CSS", "GSAP"],
    },
    {
      title: "Backend",
      icon: {
        modelPath: "/models/node.js_logo__3d_model.glb",
        scale: 50,
        rotation: [0, -Math.PI / 2, 0],
      },
      items: ["Node.js", "Express", "PostgreSQL"],
    },
    {
      title: "Blockchain",
      icon: {
        modelPath: "/models/bitcoin.glb",
        scale: 0.9,
        rotation: [0, 0, 0],
      },
      items: ["Ethereum", "Solidity", "Hardhat", "Stellar"],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
  }, []);

  useGSAP(
    () => {
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
        },
      );
    },
    { scope: sectionRef },
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
              <TechIcon model={skill.icon} />
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
