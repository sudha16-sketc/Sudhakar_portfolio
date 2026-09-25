function ProjectCard({ title, description, video }) {
  return (
    <div className="card autoDisplay">
      <h1>{title}</h1>

      <p>{description}</p>

      <video src={video} autoPlay muted loop playsInline preload="metadata" />
    </div>
  );
}

export default ProjectCard;