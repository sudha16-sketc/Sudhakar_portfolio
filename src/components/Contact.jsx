import "../styles/global.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <p>Let's Build Something Amazing</p>

      <h1>GET IN TOUCH</h1>

      <div className="contact-description">
        I'm always open to internships, full-time opportunities,
        freelance projects, and collaborations in Full Stack,
        Blockchain, and AI development.
      </div>

      <div className="contact-buttons">
        <Link to="/contactinput" className="contact-btn">
          Contact Me
        </Link>
        <a href="/Resume.pdf" download>
          Download Resume
        </a>
      </div>

      <div className="social-links">
        <a
          href="https://github.com/sudha16-sketc"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
          <span>GitHub</span>
        </a>

        <a
          href="https://www.linkedin.com/in/sudhakar-sutar-801354321?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin />
          <span>LinkedIn</span>
        </a>
      </div>

      <img
        src="/img/contact-1.webp"
        alt=""
        aria-hidden="true"
        className="img1"
        loading="lazy"
        decoding="async"
      />

      <img
        src="/img/contact-2.webp"
        alt=""
        aria-hidden="true"
        className="img2"
        loading="lazy"
        decoding="async"
      />

      <img
        src="/img/swordman.webp"
        alt=""
        aria-hidden="true"
        className="img3"
        loading="lazy"
        decoding="async"
      />
    </section>
  );
}

export default Contact;