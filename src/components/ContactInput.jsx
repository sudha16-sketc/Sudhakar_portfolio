import React, { useState } from "react";
import "../styles/global.css";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";
const ACCESS_KEY = "d699f907-66db-4058-b319-7e1511dd5d4d";

const initialState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const ContactInput = () => {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    setErrorMsg("");
    setStatus("sending");
    try {
      const payload = { access_key: ACCESS_KEY, ...form };
      const res = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setForm(initialState);
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong — please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please check your connection and try again.");
    }
  };

  // GSAP animations (unchanged)
  useGSAP(() => {
    gsap.from(".contact-left", {
      y: -700,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".contact-last", {
      y: -700,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".contact-right", {
      y: 700,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".h12", {
      x: -700,
      opacity: 0,
      duration: 1,
      delay: 0.6,
      ease: "power3.out",
    });

    gsap.from(".contact-triangle", {
      y: 700,
      opacity: 0,
      duration: 1.2,
      delay: 0.2,
      ease: "power3.out",
    });
  });

  return (
    <div className="contact-page">
      <div className="contact-left">
        <h1 className="h12">Let's Connect</h1>

        <p className="contact-intro">
          I'm Sudhakar Sutar, a Full Stack & Blockchain Developer passionate
          about building scalable web applications, decentralized platforms, and
          AI-powered solutions.
        </p>

        <p className="contact-subtitle">
          Have an internship, job opportunity, freelance project, or just want
          to discuss Web3? Send me a message.
        </p>
      </div>

      <div className="contact-right">
        <div className="contact-triangle"></div>
      </div>

      <div className="contact-last">
        {status === "success" ? (
          <div className="contact-success" role="status">
            <span className="contact-success-icon" aria-hidden="true">
              ✓
            </span>
            <h1>Message Sent</h1>
            <p>Thanks for reaching out — I'll get back to you soon.</p>
            <button
              type="button"
              className="contact-back-btn contact-success-btn"
              onClick={() => setStatus("idle")}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form
            action={WEB3FORMS_URL}
            method="POST"
            className="contact-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <input type="hidden" name="access_key" value={ACCESS_KEY} />

            <label className="sr-only" htmlFor="cf-name">
              Your Name
            </label>
            <input
              id="cf-name"
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />

            <label className="sr-only" htmlFor="cf-email">
              Your Email
            </label>
            <input
              id="cf-email"
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <label className="sr-only" htmlFor="cf-subject">
              Subject
            </label>
            <input
              id="cf-subject"
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              required
            />

            <label className="sr-only" htmlFor="cf-message">
              Your Message
            </label>
            <textarea
              id="cf-message"
              name="message"
              placeholder="Write your message..."
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            {status === "error" && (
              <p className="contact-form-error" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>

      <button
        type="button"
        className="contact-back-btn"
        onClick={() => window.history.back()}
      >
        ⬅ BACK
      </button>
    </div>
  );
};

export default ContactInput;