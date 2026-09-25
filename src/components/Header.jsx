import "../styles/global.css";

function Header() {
  return (
    <header>
      <div className="head-left">
        <img
          src="/img/logo.png"
          alt="Logo"
          className="logo"
        />

      </div>

      <div className="head-right">
        <p>
          <a href="#about">About</a>
        </p>

        <p>
          <a href="#projects">Projects</a>
        </p>

        <p>
          <a href="#experience">Experience</a>
        </p>

        <p>
          <a href="#skills">Skills</a>
        </p>

        <p>
          <a href="#contact">Contact</a>
        </p>
      </div>
    </header>
  );
}

export default Header;