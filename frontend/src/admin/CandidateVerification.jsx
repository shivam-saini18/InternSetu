import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = "http://localhost:5000/api";

function CandidateVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const candidateId = searchParams.get("id");

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * InternSetu authentication helper.
   *
   * Your backend protects candidate verification with:
   * authenticateToken + requireRole("admin")
   *
   * Therefore every protected request must send:
   * Authorization: Bearer <JWT>
   */
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      throw new Error("Authentication required");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const loadCandidate = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = getAuthHeaders();

      let response;

      if (candidateId) {
        response = await fetch(
          `${API}/candidates/${candidateId}`,
          {
            headers,
          }
        );
      } else {
        response = await fetch(`${API}/candidates`, {
          headers,
        });
      }

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        navigate("/login");
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have administrator permission to verify candidates."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load candidate"
        );
      }

      if (candidateId) {
        setCandidate(result.data);
      } else {
        const pending = (result.data || []).find(
          (item) =>
            String(item.verification_status).toLowerCase() ===
            "pending"
        );

        setCandidate(pending || null);
      }
    } catch (err) {
      console.error("Candidate verification load error:", err);

      setError(
        err.message ||
          "Unable to load candidate information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidate();
  }, [candidateId]);

  const updateStatus = async (status) => {
    if (!candidate || saving) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API}/candidates/${candidate.id}/verification`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        navigate("/login");
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "Administrator permission is required for candidate verification."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update candidate verification"
        );
      }

      setCandidate(result.data);
    } catch (err) {
      console.error("Candidate verification update error:", err);

      setError(
        err.message ||
          "Failed to update candidate verification."
      );
    } finally {
      setSaving(false);
    }
  };

  const skills = candidate?.skills
    ? candidate.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="admin-portal">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="admin-logo">IS</div>

            <div>
              <h2>InternSetu</h2>
              <span>Government Internship Portal</span>
            </div>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-empty">
            Loading candidate information...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-portal">
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
            className="admin-nav-item"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>▣</span>
            Dashboard
          </button>

          <button
            className="admin-nav-item active"
            onClick={() =>
              navigate("/admin/candidate-verification")
            }
          >
            <span>✓</span>
            Candidates
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/internships")}
          >
            <span>▤</span>
            Internships
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/applications")}
          >
            <span>▧</span>
            Applications
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/allocation")}
          >
            <span>⇄</span>
            Allocation
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button
            className="admin-logout"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">
              INTERNSETU / CANDIDATE MANAGEMENT
            </p>

            <h1>Candidate Verification</h1>

            <p>
              Review candidate credentials and update the
              official verification status.
            </p>
          </div>
        </header>

        {error && (
          <div className="admin-alert">
            <strong>Action required</strong>
            <span>{error}</span>
          </div>
        )}

        {!candidate ? (
          <section className="admin-panel">
            <div className="admin-empty">
              <strong>
                No candidate available for verification
              </strong>

              <span>
                There are currently no pending candidate
                records requiring verification.
              </span>
            </div>
          </section>
        ) : (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div className="candidate-cell">
                <div className="candidate-avatar">
                  {candidate.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>{candidate.name}</h2>
                  <p>{candidate.email}</p>
                </div>
              </div>

              <span
                className={`admin-status ${
                  String(candidate.verification_status)
                    .toLowerCase() === "verified"
                    ? "verified"
                    : String(candidate.verification_status)
                        .toLowerCase() === "rejected"
                    ? "rejected"
                    : "pending"
                }`}
              >
                {candidate.verification_status}
              </span>
            </div>

            <div style={verificationGrid}>
              <div className="details-box">
                <h3>Candidate Information</h3>

                <p>
                  <strong>Candidate ID:</strong>{" "}
                  {candidate.id}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {candidate.email}
                </p>

                <p>
                  <strong>Degree:</strong>{" "}
                  {candidate.degree}
                </p>

                <p>
                  <strong>College:</strong>{" "}
                  {candidate.college || "Not provided"}
                </p>
              </div>

              <div className="details-box">
                <h3>Registered Skills</h3>

                <div className="skill-list">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span key={index}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span>No skills provided</span>
                  )}
                </div>
              </div>
            </div>

            {candidate.verification_status === "Pending" && (
              <div className="verification-actions">
                <button
                  className="verify-button"
                  disabled={saving}
                  onClick={() =>
                    updateStatus("Verified")
                  }
                >
                  {saving
                    ? "Processing..."
                    : "✓ Verify Candidate"}
                </button>

                <button
                  className="reject-button"
                  disabled={saving}
                  onClick={() =>
                    updateStatus("Rejected")
                  }
                >
                  {saving
                    ? "Processing..."
                    : "Reject Candidate"}
                </button>
              </div>
            )}

            {candidate.verification_status === "Verified" && (
              <div className="verification-success">
                <strong>✓ Candidate Verified</strong>
                <span>
                  This candidate has been successfully
                  verified and can proceed through the
                  internship allocation workflow.
                </span>
              </div>
            )}

            {candidate.verification_status === "Rejected" && (
              <div className="verification-rejected">
                <strong>Candidate Verification Rejected</strong>
                <span>
                  This candidate is not currently eligible
                  for the verified candidate workflow.
                </span>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

const verificationGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  padding: "20px",
};

export default CandidateVerification;