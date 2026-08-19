import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function AllocationManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken")
    );
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Administrator session expired. Please login again."
        );
      }

      const response = await fetch(
        `${API}/applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load applications"
        );
      }

      setApplications(result.data || []);
    } catch (err) {
      console.error(
        "Allocation applications error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to the InternSetu backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const calculateAndAllocate = async (
    application
  ) => {
    try {
      setProcessingId(application.id);
      setMessage("");
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Administrator session expired. Please login again."
        );
      }

      /*
       * STEP 1
       * Ask the existing backend allocation
       * engine to evaluate the application.
       */
      const allocationResponse = await fetch(
        `${API}/allocation/applications/${application.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allocationResult =
        await allocationResponse.json();

      if (
        !allocationResponse.ok ||
        !allocationResult.success
      ) {
        throw new Error(
          allocationResult.message ||
            "Allocation calculation failed"
        );
      }

      const allocation =
        allocationResult.data;

      /*
       * STEP 2
       * Preserve the existing backend
       * recommendation rule.
       */
      if (
        allocation.decision !==
        "Recommended"
      ) {
        setMessage(
          `${application.candidate_name}: ${allocation.decision}${
            allocation.reason
              ? ` — ${allocation.reason}`
              : ""
          }`
        );

        await loadApplications();
        return;
      }

      /*
       * STEP 3
       * Persist allocation using the
       * existing application status API.
       */
      const updateResponse = await fetch(
        `${API}/applications/${application.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Allocated",
          }),
        }
      );

      const updateResult =
        await updateResponse.json();

      if (
        !updateResponse.ok ||
        !updateResult.success
      ) {
        throw new Error(
          updateResult.message ||
            "Failed to save allocation"
        );
      }

      setMessage(
        `${application.candidate_name} has been allocated to ${application.internship_title}.`
      );

      await loadApplications();
    } catch (err) {
      console.error(
        "Allocation error:",
        err
      );

      setError(
        err.message ||
          "Failed to process allocation."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const viewAllocationResult = (
    application
  ) => {
    window.location.href =
      `/candidate/allocation?applicationId=${application.id}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Allocated":
        return "allocation-status allocated";

      case "Shortlisted":
        return "allocation-status shortlisted";

      case "Under Review":
        return "allocation-status review";

      case "Rejected":
        return "allocation-status rejected";

      case "Pending":
      default:
        return "allocation-status pending";
    }
  };

  const getMatchClass = (score) => {
    if (score >= 80) {
      return "allocation-match high";
    }

    if (score >= 60) {
      return "allocation-match medium";
    }

    return "allocation-match low";
  };

  return (
    <div className="allocation-page">

      {/* HEADER */}

      <div className="allocation-header">
        <div>
          <div className="allocation-kicker">
            INTERNSETU ADMINISTRATION
          </div>

          <h1>
            Allocation Management
          </h1>

          <p>
            Review applications and allocate
            internship opportunities using
            eligibility, verification and
            skill-match results.
          </p>
        </div>

        <div className="allocation-admin-badge">
          Administrator
        </div>
      </div>

      {/* WORKFLOW INFORMATION */}

      <div className="allocation-info">
        <div className="allocation-info-icon">
          IS
        </div>

        <div>
          <strong>
            Allocation workflow
          </strong>

          <p>
            Only verified and eligible
            candidates with a suitable skill
            match are recommended for
            allocation.
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="allocation-message">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="allocation-error">
          <strong>
            Unable to load allocation data
          </strong>

          <p>{error}</p>

          <button
            className="allocation-retry"
            onClick={loadApplications}
          >
            Retry
          </button>
        </div>
      )}

      {/* APPLICATIONS */}

      <section className="allocation-section">

        <div className="allocation-section-header">

          <div>
            <h2>
              Candidate Applications
            </h2>

            <p>
              Live applications received from
              the InternSetu backend.
            </p>
          </div>

          <button
            className="allocation-refresh"
            onClick={loadApplications}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

        {loading ? (
          <div className="allocation-empty">

            <div className="allocation-loader">
              Loading applications...
            </div>

          </div>
        ) : applications.length === 0 ? (
          <div className="allocation-empty">

            <div className="allocation-empty-icon">
              ✓
            </div>

            <h3>
              No applications available
            </h3>

            <p>
              Applications created by
              candidates will appear here
              automatically.
            </p>

          </div>
        ) : (
          <div className="allocation-list">

            {applications.map(
              (application) => (

                <article
                  className="allocation-card"
                  key={application.id}
                >

                  {/* CARD CONTENT */}

                  <div className="allocation-card-main">

                    <div className="allocation-card-top">

                      <div>

                        <span className="allocation-id">
                          APPLICATION #
                          {application.id}
                        </span>

                        <h3>
                          {
                            application.candidate_name
                          }
                        </h3>

                      </div>

                      <span
                        className={getStatusClass(
                          application.status
                        )}
                      >
                        {application.status}
                      </span>

                    </div>

                    <div className="allocation-details">

                      <div>

                        <span className="allocation-label">
                          Internship
                        </span>

                        <strong>
                          {
                            application.internship_title
                          }
                        </strong>

                      </div>

                      <div>

                        <span className="allocation-label">
                          Organization
                        </span>

                        <strong>
                          {application.company}
                        </strong>

                      </div>

                      <div>

                        <span className="allocation-label">
                          Skill Match
                        </span>

                        <span
                          className={getMatchClass(
                            application.match_score
                          )}
                        >
                          {application.match_score ||
                            0}
                          %
                        </span>

                      </div>

                      <div>

                        <span className="allocation-label">
                          Application ID
                        </span>

                        <strong>
                          #{application.id}
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* CARD ACTION */}

                  <div className="allocation-card-action">

                    {application.status ===
                    "Allocated" ? (

                      <div className="allocation-result-actions">

                        <div className="allocation-complete">
                          <span>✓</span>
                          Allocated
                        </div>

                        <button
                          type="button"
                          className="allocation-view-button"
                          onClick={() =>
                            viewAllocationResult(
                              application
                            )
                          }
                        >
                          View Allocation Result
                        </button>

                      </div>

                    ) : (

                      <button
                        type="button"
                        className="allocation-button"
                        disabled={
                          processingId ===
                          application.id
                        }
                        onClick={() =>
                          calculateAndAllocate(
                            application
                          )
                        }
                      >
                        {processingId ===
                        application.id
                          ? "Processing..."
                          : "Process Allocation"}
                      </button>

                    )}

                  </div>

                </article>

              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default AllocationManagement;