import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects/Projects";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import "./styles/global.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContactInput from "./components/ContactInput";
import Certificate from "./components/certificates/Certificate"
import CertificatePage from "./components/certificates/CertificatePage"
import AllProjects from "./components/Projects/AllProjects";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Hero />
      <About />
      <Certificate />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contactinput" element={<ContactInput />} />
        <Route path="/certificatePage" element={<CertificatePage />} />
        <Route path="/allprojects" element={<AllProjects />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;