import "../styles/global.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

function About() {
  const blurRef = useRef(null);
  const imageRef = useRef(null);
  useEffect(() => {
  const ctx = gsap.context(() => {

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
        scrollTrigger: {
          trigger: blurRef.current,
          start: "top 80%",
          end: "top 30%",
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      imageRef.current,
      {
        width: 360,
        height: 510,
        borderRadius: 50,
      },
      {
        width: "100wh",
        height: "100vh",
        borderRadius: 0,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: imageRef.current,
             start:"top 80%",
            end:"+=1000",
          scrub: true,
        },
      }
    );

  });

  return () => ctx.revert();

}, []);
  return (
    <section className="about-section " id="about" >
      <p>About Me</p>

      <div  ref={blurRef} className="autoBlur">
        <h1>BUILDING THE FUTURE WITH CODE</h1>
      </div>

      <div ref={imageRef} className="image-box">
        <img src="/img/about.webp" alt="About Me" />
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
