import { useRef } from "react";
import Coverflow from "../coverflow/Coverflow.jsx";
import "../../styles/global.css";

const projects = [
  {
    id: 1,
    title: "BuildVerse",
    description:
      "Gamified Web3 builder platform with wallet authentication, reputation system, community posts, bounty management and blockchain rewards.",
    media: "/videos/blockVerse.mp4",
    mediaType: "video",
  },
  {
    id: 2,
    title: "FinWise AI",
    description:
      "AI-powered financial advisor integrating Gemini AI and Stellar blockchain reward mechanisms for budgeting and savings.",
    media: "/videos/finwise.mp4",
    mediaType: "video",
  },
  {
    id: 3,
    title: "CodeCraft",
    description:
      "Gamified blockchain learning platform using Ethereum, Solidity, ERC-20 rewards and NFT achievement certificates.",
    media: "/videos/codecarft.mp4",
    mediaType: "video",
  },
  {
    id: 4,
    title: "Shadow AI",
    description:
      "AI security assistant that prevents accidental sharing of credentials, API keys and confidential information with public AI tools.",
    media: "/videos/shadow.mp4",
    mediaType: "video",
  },
  {
    id: 5,
    title: "PlantCare AI",
    description:
      "AI-powered smart gardening assistant providing personalized plant care recommendations using Gemini AI and intelligent visual guides.",
    media: "/videos/plantcare.mp4",
    mediaType: "video",
  },
];

export default function AllProjects() {
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
        My Projects
      </h1>

      <Coverflow items={projects} headingRef={headingRef} />

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