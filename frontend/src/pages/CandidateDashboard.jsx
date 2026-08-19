import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000/api";

function CandidateDashboard() {
  const navigate = useNavigate();
  const { candidateId: routeCandidateId } = useParams();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedCandidateId =
      localStorage.getItem("candidateId");

    const candidateId =
      routeCandidateId || storedCandidateId;

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!candidateId) {
      setError(
        "Candidate profile not found. Please register again."
      );
      setLoading(false);
      return;
    }

    if (!token) {
      setError(
        "Authentication required. Please login again."
      );
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "candidateId",
      String(candidateId)
    );

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API}/dashboard/candidate/${candidateId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");

            throw new Error(
              "Your session has expired. Please login again."
            );
          }

          throw new Error(
            result.message ||
              "Failed to load candidate dashboard"
          );
        }

        setDashboard(result.data);
      } catch (err) {
        console.error(
          "Candidate dashboard error:",
          err
        );

        setError(
          err.message ||
            "Unable to load candidate dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [routeCandidateId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("candidateId");
    localStorage.removeItem("candidateProfile");

    navigate("/");
  };

  if (loading) {
    return (
      <div className="candidate-portal">
        <header className="candidate-topbar">
          <div className="candidate-brand">
            <div className="candidate-emblem">
              IS
            </div>

            <div>
              <strong>InternSetu</strong>
              <span>
                Government Internship Portal
              </span>
            </div>
          </div>

          <div className="candidate-topbar-right">
            <span>Candidate Portal</span>
          </div>
        </header>

        <main className="candidate-main">
          <div className="candidate-loading">
            <div className="candidate-loading-mark">
              IS
            </div>

            <h1>
              Loading your dashboard
            </h1>

            <p>
              Please wait while we securely retrieve
              your internship information.
            </p>

            <div className="candidate-loading-line" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-portal">
        <header className="candidate-topbar">
          <div className="candidate-brand">
            <div className="candidate-emblem">
              IS
            </div>

            <div>
              <strong>InternSetu</strong>
              <span>
                Government Internship Portal
              </span>
            </div>
          </div>

          <span className="candidate-topbar-label">
            Candidate Portal
          </span>
        </header>

        <main className="candidate-main">
          <section className="candidate-error-panel">
            <div className="candidate-error-icon">
              !
            </div>

            <div>
              <p className="candidate-eyebrow">
                CANDIDATE PORTAL
              </p>

              <h1>
                Unable to load dashboard
              </h1>

              <p>{error}</p>

              <div className="candidate-button-row">
                <button
                  type="button"
                  className="candidate-primary-button"
                  onClick={() =>
                    navigate("/candidate/profile")
                  }
                >
                  Register Again
                </button>

                <button
                  type="button"
                  className="candidate-secondary-button"
                  onClick={() => navigate("/")}
                >
                  Return Home
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const candidate = dashboard?.candidate;
  const applications = dashboard?.applications || [];
  const application = applications[0];

  const verification =
    String(
      candidate?.verification_status || ""
    ).toLowerCase() === "verified";

  const eligibility = application?.eligibility;

  const matchScore =
    application?.match_score !== undefined &&
    application?.match_score !== null
      ? application.match_score
      : null;

  const applicationStatus =
    application?.status || "Not Applied";

  const normalizedStatus =
    String(applicationStatus).toLowerCase();

  const isAllocated =
    normalizedStatus === "allocated";

  const isRejected =
    normalizedStatus === "rejected";

  const isShortlisted =
    normalizedStatus === "shortlisted";

  const getInitials = (name) => {
    if (!name) return "C";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const getStatusClass = () => {
    if (isAllocated) {
      return "candidate-status allocated";
    }

    if (isRejected) {
      return "candidate-status rejected";
    }

    if (isShortlisted) {
      return "candidate-status shortlisted";
    }

    return "candidate-status pending";
  };

  return (
    <div className="candidate-portal">

      {/* OFFICIAL TOP HEADER */}
      <header className="candidate-topbar">

        <div className="candidate-brand">
          <div className="candidate-emblem">
            IS
          </div>

          <div>
            <strong>InternSetu</strong>
            <span>
              Government Internship Portal
            </span>
          </div>
        </div>

        <div className="candidate-topbar-right">

          <span className="candidate-secure-label">
            Secure Candidate Area
          </span>

          <div className="candidate-profile-mini">
            <div className="candidate-mini-avatar">
              {getInitials(candidate?.name)}
            </div>

            <div>
              <strong>
                {candidate?.name || "Candidate"}
              </strong>

              <span>
                Candidate
              </span>
            </div>
          </div>

          <button
            type="button"
            className="candidate-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* OFFICIAL NAVIGATION STRIP */}
      <nav className="candidate-nav">

        <div className="candidate-nav-inner">

          <button
            type="button"
            className="candidate-nav-link active"
            onClick={() =>
              navigate("/candidate/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            className="candidate-nav-link"
            onClick={() =>
              navigate("/candidate/internships")
            }
          >
            Internships
          </button>

          <button
            type="button"
            className="candidate-nav-link"
            onClick={() =>
              navigate("/candidate/verification")
            }
          >
            Verification
          </button>

          <button
            type="button"
            className="candidate-nav-link"
            onClick={() =>
              navigate("/candidate/skill-gap")
            }
          >
            Skill Gap
          </button>

        </div>

      </nav>

      <main className="candidate-main">

        {/* BREADCRUMB */}
        <div className="candidate-breadcrumb">
          Home
          <span>/</span>
          Candidate
          <span>/</span>
          <strong>Dashboard</strong>
        </div>

        {/* WELCOME HEADER */}
        <section className="candidate-welcome">

          <div>
            <p className="candidate-eyebrow">
              CANDIDATE DASHBOARD
            </p>

            <h1>
              Welcome, {candidate?.name}
            </h1>

            <p className="candidate-welcome-text">
              Manage your InternSetu profile, track
              verification, view internship applications
              and monitor your allocation status.
            </p>
          </div>

          <div className="candidate-id-card">

            <span>Candidate ID</span>

            <strong>
              #{candidate?.id || routeCandidateId}
            </strong>

            <small>
              Registered InternSetu candidate
            </small>

          </div>

        </section>

        {/* IMPORTANT STATUS BAR */}
        <section className="candidate-security-bar">

          <div className="candidate-security-icon">
            ✓
          </div>

          <div>
            <strong>
              Secure candidate account
            </strong>

            <span>
              Your authenticated session protects access
              to your internship information.
            </span>
          </div>

          <span className="candidate-secure-badge">
            AUTHENTICATED
          </span>

        </section>

        {/* STATUS CARDS */}
        <section className="candidate-status-grid">

          <article className="candidate-status-card">

            <div className="candidate-card-top">
              <span>
                PROFILE VERIFICATION
              </span>

              <div className="candidate-card-icon">
                ✓
              </div>
            </div>

            <h2>
              {verification
                ? "Verified"
                : String(
                    candidate?.verification_status ||
                      "Pending"
                  )}
            </h2>

            <p>
              {verification
                ? "Your candidate profile has been verified by the administration."
                : "Your profile is awaiting administrative verification."}
            </p>

          </article>

          <article className="candidate-status-card">

            <div className="candidate-card-top">
              <span>
                ELIGIBILITY
              </span>

              <div className="candidate-card-icon">
                ✓
              </div>
            </div>

            <h2>
              {!application
                ? "Not Applied"
                : eligibility?.eligible
                ? "Eligible"
                : "Not Eligible"}
            </h2>

            <p>
              {!application
                ? "Apply for an internship to receive an eligibility assessment."
                : eligibility?.eligible
                ? "You satisfy the current internship eligibility requirements."
                : "Some eligibility requirements are currently not satisfied."}
            </p>

          </article>

          <article className="candidate-status-card">

            <div className="candidate-card-top">
              <span>
                SKILL MATCH
              </span>

              <div className="candidate-card-icon">
                %
              </div>
            </div>

            <h2>
              {matchScore !== null
                ? `${matchScore}%`
                : "--"}
            </h2>

            <p>
              {matchScore !== null
                ? "Skill compatibility for your latest internship application."
                : "Apply for an internship to calculate your skill match."}
            </p>

          </article>

          <article className="candidate-status-card">

            <div className="candidate-card-top">
              <span>
                APPLICATION STATUS
              </span>

              <div className="candidate-card-icon">
                #
              </div>
            </div>

            <h2>
              {applicationStatus}
            </h2>

            <p>
              {application
                ? "Current status of your latest internship application."
                : "You have not submitted an internship application yet."}
            </p>

          </article>

        </section>

        {/* ALLOCATION RESULT — MOST IMPORTANT */}
        {application && (
          <section
            className={
              isAllocated
                ? "candidate-allocation-panel allocated"
                : "candidate-allocation-panel"
            }
          >

            <div className="candidate-allocation-heading">

              <div>
                <p className="candidate-eyebrow">
                  INTERNSHIP ALLOCATION
                </p>

                <h2>
                  {isAllocated
                    ? "Internship Allocated"
                    : "Application Progress"}
                </h2>

                <p>
                  {isAllocated
                    ? "Your internship allocation has been successfully processed by the InternSetu administration."
                    : "Your application is currently being processed through the InternSetu allocation workflow."}
                </p>
              </div>

              <div
                className={
                  isAllocated
                    ? "candidate-allocation-badge success"
                    : getStatusClass()
                }
              >
                {isAllocated
                  ? "ALLOCATED"
                  : applicationStatus.toUpperCase()}
              </div>

            </div>

            <div className="candidate-allocation-content">

              <div className="candidate-internship-summary">

                <span>
                  INTERNSHIP OPPORTUNITY
                </span>

                <h3>
                  {application.internship_title}
                </h3>

                {application.company && (
                  <p>
                    {application.company}
                  </p>
                )}

              </div>

              <div className="candidate-allocation-details">

                <div>
                  <span>Application ID</span>
                  <strong>
                    #{application.application_id || application.id}
                  </strong>
                </div>

                <div>
                  <span>Skill Match</span>
                  <strong>
                    {matchScore !== null
                      ? `${matchScore}%`
                      : "--"}
                  </strong>
                </div>

                <div>
                  <span>Application Status</span>
                  <strong>
                    {applicationStatus}
                  </strong>
                </div>

              </div>

            </div>

            <div className="candidate-allocation-footer">

              <p>
                {isAllocated
                  ? "View the complete allocation information and result."
                  : "You can monitor your application and allocation status from this portal."}
              </p>

              <button
                type="button"
                className="candidate-primary-button"
                onClick={() =>
                  navigate(
                    `/candidate/allocation?applicationId=${
                      application.application_id ||
                      application.id
                    }`
                  )
                }
              >
                {isAllocated
                  ? "View Allocation Result"
                  : "View Application Status"}
              </button>

            </div>

          </section>
        )}

        {/* OPPORTUNITIES */}
        <section className="candidate-section">

          <div className="candidate-section-heading">

            <div>
              <p className="candidate-eyebrow">
                INTERNSHIP OPPORTUNITIES
              </p>

              <h2>
                Find suitable internships
              </h2>

              <p>
                Explore available government internship
                opportunities based on your education,
                skills and eligibility.
              </p>
            </div>

            <button
              type="button"
              className="candidate-primary-button"
              onClick={() =>
                navigate("/candidate/internships")
              }
            >
              View Internships
            </button>

          </div>

        </section>

        {/* VERIFICATION */}
        {!verification && (
          <section className="candidate-information-panel">

            <div className="candidate-information-icon">
              !
            </div>

            <div className="candidate-information-content">

              <p className="candidate-eyebrow">
                PROFILE VERIFICATION
              </p>

              <h2>
                Verification is in progress
              </h2>

              <p>
                Your profile must be verified by the
                InternSetu administration before final
                internship allocation.
              </p>

            </div>

            <button
              type="button"
              className="candidate-secondary-button"
              onClick={() =>
                navigate("/candidate/verification")
              }
            >
              View Verification
            </button>

          </section>
        )}

        {/* CAREER READINESS */}
        <section className="candidate-section candidate-career-section">

          <div>

            <p className="candidate-eyebrow">
              CAREER READINESS
            </p>

            <h2>
              Improve your internship readiness
            </h2>

            <p>
              Identify skill gaps and understand which
              areas can be improved to strengthen your
              internship opportunities.
            </p>

          </div>

          <button
            type="button"
            className="candidate-secondary-button"
            onClick={() =>
              navigate("/candidate/skill-gap")
            }
          >
            View Skill Gap
          </button>

        </section>

        {/* OFFICIAL FOOTER */}
        <footer className="candidate-footer">

          <div>
            <strong>
              InternSetu
            </strong>

            <span>
              Government Internship Allocation Portal
            </span>
          </div>

          <div>
            <span>
              Secure Candidate Portal
            </span>

            <span>
              © InternSetu
            </span>
          </div>

        </footer>

      </main>
    </div>
  );
}

export default CandidateDashboard;