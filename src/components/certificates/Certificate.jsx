import "../../styles/global.css";
import { Link } from "react-router-dom";

export default function Certificate() {
  return (
    <section className="certificate-banner" aria-label="Certificates">
      <p>Credentials</p>
      <h2>Certifications &amp; Achievements</h2>
      <Link to="/certificatePage" className="certificate-btn">
        See certificates
      </Link>
    </section>
  );
}