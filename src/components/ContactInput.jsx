import React, { useState } from "react";
import "../styles/global.css";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ContactInput = () => {
  // GSAP animations (unchanged)
  useGSAP(() => {
    gsap.from(".contact-left", {
      y: -700,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".contact-last", {
      y: -700,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".contact-right", {
      y: 700,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".h12", {
      x: -700,
      opacity: 0,
      duration: 1,
      delay: 0.9,
      ease: "power3.out",
    });

    gsap.from(".h11", {
      x: 700,
      opacity: 0,
      duration: 1,
      delay: 0.9,
      ease: "power3.out",
    });

    gsap.from(".contact-triangle", {
      y: 700,
      opacity: 0,
      duration: 2,
      delay: 0.2,
      ease: "power3.out",
    });
  });

  return (
    <div className="contact-page">
      <div className="contact-left">
        <h1 className="h12">Let's Connect</h1>

        <p className="contact-intro">
          I'm Sudhakar Sutar, a Full Stack & Blockchain Developer passionate
          about building scalable web applications, decentralized platforms, and
          AI-powered solutions.
        </p>

        <p className="contact-subtitle">
          Have an internship, job opportunity, freelance project, or just want
          to discuss Web3? Send me a message.
        </p>
      </div>

      <div className="contact-right">
        <div className="contact-triangle"></div>
      </div>

      <div className="contact-last">
        <form action="https://api.web3forms.com/submit" method="POST" className="contact-form">
          <input type="hidden" name="access_key" value="d699f907-66db-4058-b319-7e1511dd5d4d" />

          <input type="text" name="name" placeholder="Your Name" required />

          <input type="email" name="email" placeholder="Your Email" required />

          <input type="text" name="subject" placeholder="Subject" required />

          <textarea
            name="message"
            placeholder="Write your message..."
            required
          ></textarea>

          <button type="submit">Send Message</button>
        </form>
      </div>

      <button
        className="contact-back-btn"
        onClick={() => window.history.back()}
      >
        ⬅ BACK
      </button>
    </div>
  );
};

export default ContactInput;
