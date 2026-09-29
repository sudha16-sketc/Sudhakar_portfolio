import { useEffect, useRef, useState } from "react";

function ProjectCard({ title, description, video }) {
  const cardRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="card autoDisplay" ref={cardRef}>
      <h1>{title}</h1>

      <p>{description}</p>

      {shouldLoad && (
        <video src={video} autoPlay muted loop playsInline preload="metadata" />
      )}
    </div>
  );
}

export default ProjectCard;
