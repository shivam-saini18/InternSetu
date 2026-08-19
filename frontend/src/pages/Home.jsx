import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="portal-page">

      {/* =========================
          OFFICIAL HEADER
         ========================= */}
      <header className="portal-header">

        <div className="portal-brand">
          <div className="portal-logo">
            <span>IS</span>
          </div>

          <div className="portal-brand-text">
            <h2>InternSetu</h2>
            <p>Connecting Skills with Opportunities</p>
          </div>
        </div>

        <div className="portal-header-right">
          <span className="portal-status">
            Internship Allocation Portal
          </span>
        </div>

      </header>

      {/* =========================
          GOVERNMENT STYLE BAR
         ========================= */}
      <div className="portal-info-bar">

        <div className="portal-info-left">
          <strong>InternSetu</strong>
          <span className="info-divider">|</span>
          <span>Digital Internship Allocation Platform</span>
        </div>

        <div className="portal-info-note">
          Skill-based • Eligibility-aware • Transparent
        </div>

      </div>

      {/* =========================
          MAIN CONTENT
         ========================= */}
      <main className="portal-main">

        {/* =========================
            HERO
           ========================= */}
        <section className="portal-hero">

          {/* LEFT */}
          <div className="portal-hero-content">

            <div className="official-line">
              <span></span>
              <p>INSTITUTIONAL INTERNSHIP PORTAL</p>
            </div>

            <h1>
              Welcome to
              <strong> InternSetu</strong>
            </h1>

            <h2 className="portal-hero-title">
              Connecting eligible candidates with the right
              internship opportunities.
            </h2>

            <p className="portal-description">
              InternSetu is a structured digital platform for
              candidate verification, eligibility assessment,
              skill-based matching and transparent internship
              allocation.
            </p>

            <div className="portal-official-note">
              <div className="official-check">✓</div>

              <div>
                <strong>Simple. Transparent. Skill-based.</strong>
                <p>
                  One platform for candidates, institutions and
                  internship administrators.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT ACCESS CARD */}
          <div className="portal-access-card">

            <div className="access-card-top">
              <div className="access-icon">
                IS
              </div>

              <div>
                <span className="access-small-title">
                  PORTAL ACCESS
                </span>

                <h3>Login to InternSetu</h3>

                <p>
                  Select your portal to continue
                </p>
              </div>
            </div>

            <div className="access-divider"></div>

            {/* Candidate */}
            <button
              className="access-option access-candidate"
              onClick={() => navigate("/candidate/profile")}
            >
              <div className="access-option-icon">
                C
              </div>

              <div className="access-option-content">
                <strong>Candidate Portal</strong>

                <span>
                  Profile, verification, internships and allocation
                </span>
              </div>

              <div className="access-arrow">
                →
              </div>
            </button>

            {/* Admin */}
            <button
              className="access-option access-admin"
              onClick={() => navigate("/admin/dashboard")}
            >
              <div className="access-option-icon">
                A
              </div>

              <div className="access-option-content">
                <strong>Administrator Portal</strong>

                <span>
                  Candidates, applications and allocation management
                </span>
              </div>

              <div className="access-arrow">
                →
              </div>
            </button>

            <div className="access-security">
              <span className="security-dot"></span>

              <p>
                Secure institutional workflow
              </p>
            </div>

          </div>

        </section>

        {/* =========================
            PORTAL INFORMATION
           ========================= */}
        <section className="portal-overview">

          <div className="portal-section-heading">

            <span className="section-label">
              ABOUT THE PLATFORM
            </span>

            <h2>
              A structured internship allocation system
            </h2>

            <p>
              InternSetu brings candidate information,
              eligibility, skills and internship opportunities
              together in one transparent workflow.
            </p>

          </div>

          <div className="portal-workflow-grid">

            <div className="portal-workflow-card">

              <div className="workflow-number">
                01
              </div>

              <div>
                <h3>Candidate Profile</h3>

                <p>
                  Candidates provide their education,
                  college and relevant technical skills.
                </p>
              </div>

            </div>

            <div className="portal-workflow-card">

              <div className="workflow-number">
                02
              </div>

              <div>
                <h3>Verification</h3>

                <p>
                  Candidate information is checked before
                  participation in internship allocation.
                </p>
              </div>

            </div>

            <div className="portal-workflow-card">

              <div className="workflow-number">
                03
              </div>

              <div>
                <h3>Eligibility & Matching</h3>

                <p>
                  Skills and eligibility requirements are
                  compared with available internships.
                </p>
              </div>

            </div>

            <div className="portal-workflow-card">

              <div className="workflow-number">
                04
              </div>

              <div>
                <h3>Allocation</h3>

                <p>
                  Candidates receive a clear application
                  and allocation outcome.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            KEY FEATURES
           ========================= */}
        <section className="portal-features-section">

          <div className="portal-section-heading compact">

            <span className="section-label">
              KEY FEATURES
            </span>

            <h2>
              Designed for transparent internship management
            </h2>

          </div>

          <div className="portal-features">

            <div className="portal-feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <strong>Verified Candidates</strong>

                <p>
                  Candidate verification is considered
                  before internship decisions.
                </p>
              </div>

            </div>

            <div className="portal-feature">

              <div className="feature-icon">
                %
              </div>

              <div>
                <strong>Skill-Based Matching</strong>

                <p>
                  Candidate skills are compared with
                  internship requirements.
                </p>
              </div>

            </div>

            <div className="portal-feature">

              <div className="feature-icon">
                i
              </div>

              <div>
                <strong>Transparent Outcomes</strong>

                <p>
                  Candidates can view allocation results
                  and understand skill gaps.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            INFORMATION STRIP
           ========================= */}
        <section className="portal-information-strip">

          <div>
            <span className="section-label">
              INTERNSETU PORTAL
            </span>

            <h2>
              From registration to internship allocation,
              everything in one place.
            </h2>
          </div>

          <div className="portal-info-points">

            <div>
              <span>01</span>
              <p>Profile Management</p>
            </div>

            <div>
              <span>02</span>
              <p>Eligibility Assessment</p>
            </div>

            <div>
              <span>03</span>
              <p>Skill Matching</p>
            </div>

            <div>
              <span>04</span>
              <p>Allocation Result</p>
            </div>

          </div>

        </section>

      </main>

      {/* =========================
          FOOTER
         ========================= */}
      <footer className="portal-footer">

        <div className="footer-brand">

          <div className="footer-logo">
            IS
          </div>

          <div>
            <strong>InternSetu</strong>

            <span>
              Connecting Skills with Opportunities
            </span>
          </div>

        </div>

        <div className="footer-right">
          <span>Digital Internship Allocation Portal</span>
          <span>© InternSetu</span>
        </div>

      </footer>

    </div>
  );
}

export default Home;