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
import Certificate from "./components/certificates/Certificate"
import { lazy, Suspense, useEffect } from "react";

const ContactInput = lazy(() => import("./components/ContactInput"));
const CertificatePage = lazy(() => import("./components/certificates/CertificatePage"));
const AllProjects = lazy(() => import("./components/Projects/AllProjects"));

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
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contactinput" element={<ContactInput />} />
          <Route path="/certificatePage" element={<CertificatePage />} />
          <Route path="/allprojects" element={<AllProjects />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;