import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">

      <section className="hero-section">
        <div className="hero-content">
          <span className="badge">🚀 AI Powered Recruitment Platform</span>

          <h1>
            Hire Smarter with <span>SmartHire AI</span>
          </h1>

          <p>
            Upload resumes, analyze ATS compatibility, generate interview
            questions, and streamline recruitment using AI.
          </p>

          <div className="hero-buttons">
          <Link to="/upload-resume">
            <button className="primary-btn">
              Start Analysis
            </button>
          </Link>

          <Link to="/dashboard">
            <button className="secondary-btn">
              View Dashboard
            </button>
          </Link>
        </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Powerful Features</h2>

        <div className="features-grid">

          <div className="feature-card">
            <div className="icon">📄</div>
            <h3>Resume Analysis</h3>
            <p>
              Get detailed ATS compatibility reports using AI.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">🎯</div>
            <h3>Interview Questions</h3>
            <p>
              Generate technical and HR interview questions instantly.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>ATS Insights</h3>
            <p>
              Visualize candidate performance and screening metrics.
            </p>
          </div>

        </div>
      </section>

      <section className="workflow-section">
        <h2>How It Works</h2>

        <div className="workflow">

          <div className="step">
            <span>1</span>
            <h4>Upload Resume</h4>
          </div>

          <div className="arrow">→</div>

          <div className="step">
            <span>2</span>
            <h4>AI Analysis</h4>
          </div>

          <div className="arrow">→</div>

          <div className="step">
            <span>3</span>
            <h4>ATS Score</h4>
          </div>

          <div className="arrow">→</div>

          <div className="step">
            <span>4</span>
            <h4>Interview Questions</h4>
          </div>

        </div>
      </section>

      <section className="footer-banner">
        <h2>Ready to transform recruitment?</h2>
        <p>
          Powered by React, Node.js, MongoDB and Gemini AI.
        </p>
      </section>

    </div>
  );
}

export default Home;