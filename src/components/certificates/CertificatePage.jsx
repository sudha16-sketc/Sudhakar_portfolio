import { useRef } from "react";
import Coverflow from "../coverflow/Coverflow.jsx";
import "../../styles/global.css";

const certificates = [
  {
    id: 1,
    media: "/img/stellar.jpg",
    mediaType: "img",
    title: "Stellar Builder Challenge",
  },
  {
    id: 2,
    media: "/img/java.jpg",
    mediaType: "img",
    title: "Java",
  },
  {
    id: 3,
    media: "/img/udemy.png",
    mediaType: "img",
    title: "Fullstack Web Development Bootcamp",
  },
];

export default function CertificatePage() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  return (
    <section className="certificate-section" ref={sectionRef}>
      <video
        className="background-video"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/videos/14114346_1920_1080_30fps.mp4" type="video/mp4" />
      </video>

      <h1 className="certificate-heading" ref={headingRef}>
        My Certificates
      </h1>

      <Coverflow items={certificates} headingRef={headingRef} />

      <button
        type="button"
        className="contact-back-btn"
        onClick={() => window.history.back()}
      >
        ⬅ BACK
      </button>
    </section>
  );
}