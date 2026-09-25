import "../styles/global.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Experience() {
  const titleRef = useRef(null);
  const itemsRef = useRef([]);
  const lineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section title
      gsap.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: window.innerWidth <=768
        ? "top 95%"
        : "top 80%",
        },
      });

      // Timeline items
      itemsRef.current.forEach((item, index) => {
        gsap.from(item, {
          opacity: 0,
          x: window.innerWidth > 768 ? (index % 2 === 0 ? -100 : 100) : 0,

          y: window.innerWidth <= 768 ? 60 : 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: window.innerWidth <=768
        ? "top 95%"
        : "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.to(lineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline",
          start: window.innerWidth <=768
        ? "top 95%"
        : "top 80%",
          end: "bottom 80%",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="experience">
      <div className="section-title" ref={titleRef}>
        <p>Professional Journey</p>
        <h2>Experience</h2>
      </div>

      <div className="timeline">
        <div className="timeline-line" ref={lineRef}></div>
        <div className="timeline-item" ref={(el) => (itemsRef.current[0] = el)}>
          <h3>Blockchain Development Intern</h3>
          <h4>Stellar • 2026 - Present</h4>
          <p>
            Building decentralized applications, integrating blockchain
            technologies, and working on real-world Web3 solutions.
          </p>
        </div>

        <div className="timeline-item" ref={(el) => (itemsRef.current[1] = el)}>
          <h3>Blockchain Development Intern</h3>
          <h4>Code Alpha • 2025</h4>
          <p>
            Developed smart contracts, Solidity applications, and
            blockchain-based projects.
          </p>
        </div>

        <div className="timeline-item" ref={(el) => (itemsRef.current[2] = el)}>
          <h3>Blockchain Development Intern</h3>
          <h4>Future Intern • 2025</h4>
          <p>
            Worked on Web3 development, frontend integration, and decentralized
            application architecture.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Experience;
