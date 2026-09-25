import "../../styles/global.css";
import { Link } from "react-router-dom";
export default function Certificate() {
  return (
    <section>
      <h1>
        <div className="contact-buttons">
        <Link to="/certificatePage" className="certificate-btn">
          See certificates
        </Link>
        </div>
      </h1>
    </section>
  );
}
