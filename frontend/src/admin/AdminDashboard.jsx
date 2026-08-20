import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API}/candidates`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        throw new Error(
          "Your administrator session has expired or is not authorized. Please sign in again."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load candidate data"
        );
      }

      setCandidates(result.data || []);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(
        err.message ||
          "Unable to load candidate data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const totalCandidates = candidates.length;

  const pendingCandidates = candidates.filter(
    (candidate) =>
      String(candidate.verification_status).toLowerCase() ===
      "pending"
  );

  const verifiedCandidates = candidates.filter(
    (candidate) =>
      String(candidate.verification_status).toLowerCase() ===
      "verified"
  );

  const rejectedCandidates = candidates.filter(
    (candidate) =>
      String(candidate.verification_status).toLowerCase() ===
      "rejected"
  );

  const statusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "verified") {
      return "admin-status verified";
    }

    if (value === "rejected") {
      return "admin-status rejected";
    }

    return "admin-status pending";
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <div className="admin-portal">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div className="admin-logo">IS</div>

          <div>
            <h2>InternSetu</h2>
            <span>Government Internship Portal</span>
          </div>
        </div>

        <div className="admin-menu-label">
          ADMINISTRATION
        </div>

        <nav className="admin-nav">

          <button
            className="admin-nav-item active"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>▣</span>
            Dashboard
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/candidate-verification")
            }
          >
            <span>✓</span>
            Candidates
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/internships")
            }
          >
            <span>▤</span>
            Internships
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/applications")
            }
          >
            <span>▧</span>
            Applications
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/allocation")
            }
          >
            <span>⇄</span>
            Allocation
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <div className="admin-secure">
            <span>●</span>

            <div>
              <strong>Secure Portal</strong>
              <small>Administrator access</small>
            </div>
          </div>

          <button
            className="admin-logout"
            onClick={logout}
          >
            ⇥ Sign Out
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="admin-main">

        <header className="admin-topbar">

          <div>
            <p className="admin-breadcrumb">
              INTERNSETU / ADMINISTRATION
            </p>

            <h1>Administration Dashboard</h1>

            <p>
              Monitor candidate verification and manage
              the internship allocation process.
            </p>
          </div>

          <div className="admin-user">

            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Administrator</strong>
              <span>Authorized Portal User</span>
            </div>

          </div>

        </header>

        {/* STATISTICS */}
        <section className="admin-stat-grid">

          <div className="admin-stat-card">
            <div className="admin-stat-icon blue">
              C
            </div>

            <div>
              <span>Total Candidates</span>

              <strong>
                {loading ? "—" : totalCandidates}
              </strong>

              <small>
                Registered candidates
              </small>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon orange">
              !
            </div>

            <div>
              <span>Pending Verification</span>

              <strong>
                {loading
                  ? "—"
                  : pendingCandidates.length}
              </strong>

              <small>
                Awaiting administrator review
              </small>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon green">
              ✓
            </div>

            <div>
              <span>Verified Candidates</span>

              <strong>
                {loading
                  ? "—"
                  : verifiedCandidates.length}
              </strong>

              <small>
                Successfully verified
              </small>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon red">
              ×
            </div>

            <div>
              <span>Rejected Candidates</span>

              <strong>
                {loading
                  ? "—"
                  : rejectedCandidates.length}
              </strong>

              <small>
                Verification rejected
              </small>
            </div>
          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="admin-alert">

            <div>
              <strong>
                Unable to load administration data
              </strong>

              <span>{error}</span>
            </div>

            <button onClick={loadCandidates}>
              Retry
            </button>

          </div>
        )}

        {/* PENDING CANDIDATES */}
        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <p className="admin-panel-label">
                CANDIDATE MANAGEMENT
              </p>

              <h2>Pending Verification</h2>

              <p>
                Review candidate profiles awaiting
                administrator verification.
              </p>
            </div>

            <button
              className="admin-outline-button"
              onClick={() =>
                navigate(
                  "/admin/candidate-verification"
                )
              }
            >
              View All Candidates
            </button>

          </div>

          <div className="admin-table-wrapper">

            {loading ? (
              <div className="admin-empty">
                <strong>
                  Loading candidate records...
                </strong>

                <span>
                  Connecting to the InternSetu
                  administration service.
                </span>
              </div>
            ) : pendingCandidates.length === 0 ? (
              <div className="admin-empty">

                <strong>
                  No pending candidates
                </strong>

                <span>
                  All registered candidates have
                  been processed.
                </span>

              </div>
            ) : (
              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Degree</th>
                    <th>College</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {pendingCandidates.map(
                    (candidate) => (

                      <tr key={candidate.id}>

                        <td>
                          <div className="candidate-cell">

                            <div className="candidate-avatar">
                              {candidate.name
                                ? candidate.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "C"}
                            </div>

                            <div>
                              <strong>
                                {candidate.name}
                              </strong>

                              <span>
                                {candidate.email}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          {candidate.degree ||
                            "Not provided"}
                        </td>

                        <td>
                          {candidate.college ||
                            "Not provided"}
                        </td>

                        <td>
                          <span
                            className={statusClass(
                              candidate.verification_status
                            )}
                          >
                            {candidate.verification_status ||
                              "Pending"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="admin-review-button"
                            onClick={() =>
                              navigate(
                                `/admin/candidate-verification?id=${candidate.id}`
                              )
                            }
                          >
                            Review
                          </button>
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>
            )}

          </div>

        </section>

        {/* QUICK ACCESS */}
        <section className="admin-quick-actions">

          <div>
            <p className="admin-panel-label">
              QUICK ACCESS
            </p>

            <h2>
              Portal Management
            </h2>

            <p>
              Access the core administration modules.
            </p>
          </div>

          <div className="admin-action-grid">

            <button
              className="admin-action-card"
              onClick={() =>
                navigate("/admin/internships")
              }
            >
              <span className="quick-icon">
                ▤
              </span>

              <div>
                <strong>
                  Manage Internships
                </strong>

                <small>
                  Create and manage internship
                  opportunities
                </small>
              </div>

              <span className="arrow">
                →
              </span>
            </button>

            <button
              className="admin-action-card"
              onClick={() =>
                navigate("/admin/applications")
              }
            >
              <span className="quick-icon">
                ▧
              </span>

              <div>
                <strong>
                  View Applications
                </strong>

                <small>
                  Review candidate internship
                  applications
                </small>
              </div>

              <span className="arrow">
                →
              </span>
            </button>

            <button
              className="admin-action-card"
              onClick={() =>
                navigate("/admin/allocation")
              }
            >
              <span className="quick-icon">
                ⇄
              </span>

              <div>
                <strong>
                  Manage Allocations
                </strong>

                <small>
                  Process internship allocation
                  decisions
                </small>
              </div>

              <span className="arrow">
                →
              </span>
            </button>

          </div>

        </section>

        <footer className="admin-footer">
          <strong>InternSetu</strong>

          <span>
            Government Internship Allocation Portal
          </span>

          <span>
            • Secure Administration
          </span>
        </footer>

      </main>

    </div>
  );
}

export default AdminDashboard;