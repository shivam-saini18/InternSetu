import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Administrator session expired. Please login again."
        );
      }

      const response = await fetch(`${API}/applications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load applications"
        );
      }

      setApplications(result.data || []);
    } catch (err) {
      console.error("Applications error:", err);
      setError(
        err.message || "Unable to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Administrator session expired. Please login again."
        );
      }

      const response = await fetch(
        `${API}/applications/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update application status"
        );
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === id
            ? {
                ...application,
                status: result.data.status,
              }
            : application
        )
      );
    } catch (err) {
      console.error("Update application status error:", err);
      alert(
        err.message ||
          "Unable to update application status"
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>
              INTERNSETU ADMINISTRATION
            </p>
            <h1 style={styles.headerTitle}>
              Applications
            </h1>
            <p style={styles.headerDescription}>
              Loading applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>
              INTERNSETU ADMINISTRATION
            </p>
            <h1 style={styles.headerTitle}>
              Applications
            </h1>

            <div style={styles.errorBox}>
              <strong>
                Unable to load applications
              </strong>
              <p>{error}</p>

              <button
                style={styles.retryButton}
                onClick={fetchApplications}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>
            INTERNSETU ADMINISTRATION
          </p>

          <h1 style={styles.headerTitle}>
            Applications
          </h1>

          <p style={styles.headerDescription}>
            Review candidate applications and shortlist
            suitable candidates.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={fetchApplications}
        >
          Refresh
        </button>
      </div>

      <div style={styles.summary}>
        <strong>{applications.length}</strong>
        <span>
          {applications.length === 1
            ? "Application"
            : "Applications"}{" "}
          received
        </span>
      </div>

      <div style={styles.list}>
        {applications.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✓</div>
            <h2>No applications found</h2>
            <p>
              Candidate applications will appear here
              automatically.
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <div
              style={styles.card}
              key={application.id}
            >
              <div style={styles.candidateHeader}>
                <div style={styles.avatar}>
                  {application.candidate_name
                    ? application.candidate_name
                        .charAt(0)
                        .toUpperCase()
                    : "C"}
                </div>

                <div>
                  <h2 style={styles.candidateName}>
                    {application.candidate_name}
                  </h2>

                  <span style={styles.applicationId}>
                    APPLICATION #{application.id}
                  </span>
                </div>
              </div>

              <div style={styles.details}>
                <div style={styles.detail}>
                  <span style={styles.label}>
                    Internship
                  </span>
                  <strong>
                    {application.internship_title ||
                      "Not provided"}
                  </strong>
                </div>

                <div style={styles.detail}>
                  <span style={styles.label}>
                    Organization
                  </span>
                  <strong>
                    {application.company ||
                      "Not provided"}
                  </strong>
                </div>

                <div style={styles.detail}>
                  <span style={styles.label}>
                    Skill Match
                  </span>
                  <strong>
                    {application.match_score || 0}%
                  </strong>
                </div>

                <div style={styles.detail}>
                  <span style={styles.label}>
                    Status
                  </span>

                  <span
                    style={getStatusStyle(
                      application.status
                    )}
                  >
                    {application.status || "Pending"}
                  </span>
                </div>
              </div>

              {(application.status === "Pending" ||
                application.status ===
                  "Under Review") && (
                <div style={styles.actions}>
                  <button
                    style={styles.shortlistButton}
                    onClick={() =>
                      updateStatus(
                        application.id,
                        "Shortlisted"
                      )
                    }
                  >
                    ✓ Shortlist
                  </button>

                  <button
                    style={styles.rejectButton}
                    onClick={() =>
                      updateStatus(
                        application.id,
                        "Rejected"
                      )
                    }
                  >
                    × Reject
                  </button>
                </div>
              )}

              {application.status ===
                "Shortlisted" && (
                <div style={styles.completed}>
                  ✓ Candidate shortlisted
                </div>
              )}

              {application.status ===
                "Rejected" && (
                <div style={styles.rejectedMessage}>
                  Candidate application rejected
                </div>
              )}

              {application.status ===
                "Allocated" && (
                <div style={styles.allocatedMessage}>
                  ✓ Internship allocated
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const getStatusStyle = (status) => {
  const base = {
    display: "inline-flex",
    width: "fit-content",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  };

  if (status === "Shortlisted") {
    return {
      ...base,
      background: "#e6f7ed",
      color: "#167347",
    };
  }

  if (status === "Rejected") {
    return {
      ...base,
      background: "#fdecec",
      color: "#b42318",
    };
  }

  if (status === "Allocated") {
    return {
      ...base,
      background: "#e9e7ff",
      color: "#5b4bb7",
    };
  }

  if (status === "Under Review") {
    return {
      ...base,
      background: "#e7f5ff",
      color: "#0969a8",
    };
  }

  return {
    ...base,
    background: "#fff4d6",
    color: "#9a6700",
  };
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f5f7fb",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },

  kicker: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.4px",
    color: "#2563eb",
  },

  headerTitle: {
    margin: "0",
    fontSize: "34px",
    color: "#172033",
  },

  headerDescription: {
    marginTop: "8px",
    color: "#667085",
  },

  refreshButton: {
    padding: "11px 18px",
    border: "1px solid #d7deea",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#24324a",
    fontWeight: "600",
    cursor: "pointer",
  },

  summary: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    padding: "18px 22px",
    background: "#ffffff",
    border: "1px solid #e3e8f0",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#667085",
  },

  list: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #e3e8f0",
    boxShadow:
      "0 4px 14px rgba(16, 24, 40, 0.05)",
  },

  candidateHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },

  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#eaf1ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
  },

  candidateName: {
    margin: "0 0 3px",
    fontSize: "19px",
    color: "#172033",
  },

  applicationId: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#8a94a6",
  },

  details: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
  },

  detail: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#8a94a6",
  },

  actions: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid #edf0f5",
    display: "flex",
    gap: "10px",
  },

  shortlistButton: {
    padding: "10px 17px",
    border: "none",
    borderRadius: "8px",
    background: "#198754",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  rejectButton: {
    padding: "10px 17px",
    border: "none",
    borderRadius: "8px",
    background: "#dc3545",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  completed: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #edf0f5",
    color: "#167347",
    fontWeight: "700",
  },

  rejectedMessage: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #edf0f5",
    color: "#b42318",
    fontWeight: "600",
  },

  allocatedMessage: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #edf0f5",
    color: "#5b4bb7",
    fontWeight: "700",
  },

  empty: {
    background: "#ffffff",
    border: "1px solid #e3e8f0",
    borderRadius: "14px",
    padding: "60px 30px",
    textAlign: "center",
  },

  emptyIcon: {
    margin: "0 auto 14px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#eaf7ef",
    color: "#198754",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
  },

  errorBox: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "10px",
    background: "#fff1f1",
    border: "1px solid #f4c7c7",
    color: "#9f1d1d",
  },

  retryButton: {
    marginTop: "10px",
    padding: "9px 15px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Applications;