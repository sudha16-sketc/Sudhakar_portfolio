import "../styles/global.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

function About() {
  const blurRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    // Elegant reveals — skipped entirely when reduced motion is requested
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        blurRef.current,
        {
          opacity: 0,
          filter: "blur(40px)",
          y: 50,
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: blurRef.current,
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        imageRef.current,
        { scale: 0.9, y: 40, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 85%",
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="about-section" id="about">
      <p>About Me</p>

      <div ref={blurRef} className="autoBlur">
        <h1>BUILDING THE FUTURE WITH CODE</h1>
      </div>

      <div ref={imageRef} className="image-box">
        <img src="/img/about.webp" alt="Portrait of Sudhakar Sutar" decoding="async" />
      </div>

      <h4>
        I'm a Software Engineer and Blockchain Developer passionate about
        creating scalable web applications, decentralized platforms, and
        AI-powered solutions. My expertise includes React, Rust, Solidity,
        PostgreSQL, Ethereum, and modern backend technologies.
      </h4>
    </section>
  );
}

export default About;