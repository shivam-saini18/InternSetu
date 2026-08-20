import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AllocationManagement() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [internships, setInternships] = useState([]);

  const [selectedInternships, setSelectedInternships] =
    useState({});

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  const getHeaders = () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Administrator session expired. Please login again."
      );
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const loadAllocationData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const headers = getHeaders();

      const [
        candidatesResponse,
        internshipsResponse,
      ] = await Promise.all([
        fetch(`${API}/allocation/candidates`, {
          headers,
        }),

        fetch(`${API}/allocation/internships`, {
          headers,
        }),
      ]);

      const candidatesResult =
        await candidatesResponse.json();

      const internshipsResult =
        await internshipsResponse.json();

      if (
        !candidatesResponse.ok ||
        !candidatesResult.success
      ) {
        throw new Error(
          candidatesResult.message ||
            "Failed to load verified candidates"
        );
      }

      if (
        !internshipsResponse.ok ||
        !internshipsResult.success
      ) {
        throw new Error(
          internshipsResult.message ||
            "Failed to load internships"
        );
      }

      setCandidates(
        candidatesResult.data || []
      );

      setInternships(
        internshipsResult.data || []
      );
    } catch (err) {
      console.error(
        "Allocation data error:",
        err
      );

      setError(
        err.message ||
          "Unable to load allocation data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllocationData();
  }, []);

  const handleInternshipChange = (
    candidateId,
    internshipId
  ) => {
    setSelectedInternships((previous) => ({
      ...previous,
      [candidateId]: internshipId,
    }));

    setError("");
    setMessage("");
  };

  /*
   * =====================================================
   * PROCESS ALLOCATION
   * =====================================================
   *
   * Backend already returns applicationId after
   * allocation processing.
   *
   * We use that applicationId directly and open the
   * Allocation Result page.
   */
  const processAllocation = async (
    candidate
  ) => {
    try {
      setProcessingId(candidate.id);
      setError("");
      setMessage("");

      const internshipId =
        selectedInternships[candidate.id];

      if (!internshipId) {
        throw new Error(
          "Please select an internship before processing allocation."
        );
      }

      const response = await fetch(
        `${API}/allocation/candidates/${candidate.id}`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            internship_id:
              Number(internshipId),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Allocation processing failed"
        );
      }

      const allocation = result.data;

      /*
       * =================================================
       * ALLOCATION SUCCESS
       * =================================================
       *
       * The backend gives us applicationId.
       * Do NOT call /api/applications here.
       *
       * The result page uses:
       * /api/allocation/applications/:id
       */
      if (
        allocation &&
        allocation.applicationId
      ) {
        navigate(
          `/candidate/allocation?applicationId=${allocation.applicationId}`
        );

        return;
      }

      /*
       * Fallback only if backend unexpectedly does not
       * return an application ID.
       */
      if (
        allocation &&
        allocation.status === "Allocated"
      ) {
        setMessage(
          `${candidate.name} has been allocated to ${allocation.internshipTitle}.`
        );
      } else {
        setMessage(
          `${candidate.name}: ${
            allocation?.decision ||
            "Allocation evaluation completed"
          }${
            allocation?.reason
              ? ` — ${allocation.reason}`
              : ""
          }`
        );
      }

      await loadAllocationData();
    } catch (err) {
      console.error(
        "Process allocation error:",
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

  const getMatchClass = () => {
    return "allocation-match";
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
            Allocate verified candidates to
            suitable internship opportunities
            using eligibility and skill matching.
          </p>

        </div>

        <div className="allocation-admin-badge">
          Administrator
        </div>

      </div>

      {/* WORKFLOW */}

      <div className="allocation-info">

        <div className="allocation-info-icon">
          IS
        </div>

        <div>

          <strong>
            Allocation workflow
          </strong>

          <p>
            Only candidates verified by the
            administrator can proceed to
            internship allocation.
          </p>

        </div>

      </div>

      {/* SUCCESS */}

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
            Unable to process allocation
          </strong>

          <p>{error}</p>

          <button
            className="allocation-retry"
            onClick={loadAllocationData}
          >
            Retry
          </button>

        </div>
      )}

      {/* MAIN */}

      <section className="allocation-section">

        <div className="allocation-section-header">

          <div>

            <h2>
              Verified Candidates
            </h2>

            <p>
              Verified candidates available
              for administrative allocation.
            </p>

          </div>

          <button
            className="allocation-refresh"
            onClick={loadAllocationData}
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
              Loading verified candidates...
            </div>

          </div>

        ) : candidates.length === 0 ? (

          <div className="allocation-empty">

            <div className="allocation-empty-icon">
              ✓
            </div>

            <h3>
              No verified candidates available
            </h3>

            <p>
              Verify a candidate first. Verified
              candidates will automatically appear
              here for internship allocation.
            </p>

          </div>

        ) : (

          <div className="allocation-list">

            {candidates.map(
              (candidate) => {

                const selectedInternship =
                  selectedInternships[
                    candidate.id
                  ];

                return (
                  <article
                    className="allocation-card"
                    key={candidate.id}
                  >

                    <div className="allocation-card-main">

                      <div className="allocation-card-top">

                        <div>

                          <span className="allocation-id">
                            CANDIDATE #
                            {candidate.id}
                          </span>

                          <h3>
                            {candidate.name}
                          </h3>

                        </div>

                        <span className="allocation-status allocated">
                          VERIFIED
                        </span>

                      </div>

                      <div className="allocation-details">

                        <div>

                          <span className="allocation-label">
                            Degree
                          </span>

                          <strong>
                            {candidate.degree}
                          </strong>

                        </div>

                        <div>

                          <span className="allocation-label">
                            College
                          </span>

                          <strong>
                            {candidate.college ||
                              "Not provided"}
                          </strong>

                        </div>

                        <div>

                          <span className="allocation-label">
                            Skills
                          </span>

                          <strong>
                            {candidate.skills}
                          </strong>

                        </div>

                        <div>

                          <span className="allocation-label">
                            Verification
                          </span>

                          <span
                            className={
                              getMatchClass()
                            }
                          >
                            Verified
                          </span>

                        </div>

                      </div>

                      {/* INTERNSHIP SELECTION */}

                      <div className="allocation-details">

                        <div
                          style={{
                            width: "100%",
                          }}
                        >

                          <span className="allocation-label">
                            Select Internship
                          </span>

                          <select
                            value={
                              selectedInternship ||
                              ""
                            }
                            onChange={(event) =>
                              handleInternshipChange(
                                candidate.id,
                                event.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              marginTop: "8px",
                              borderRadius: "8px",
                              border:
                                "1px solid #d1d5db",
                              background:
                                "#ffffff",
                              fontSize: "14px",
                            }}
                          >

                            <option value="">
                              Select an active internship
                            </option>

                            {internships.map(
                              (internship) => (
                                <option
                                  key={
                                    internship.id
                                  }
                                  value={
                                    internship.id
                                  }
                                >
                                  {
                                    internship.title
                                  }{" "}
                                  —{" "}
                                  {
                                    internship.company
                                  }{" "}
                                  (
                                  {
                                    internship.seats
                                  }{" "}
                                  seats)
                                </option>
                              )
                            )}

                          </select>

                        </div>

                      </div>

                    </div>

                    <div className="allocation-card-action">

                      <button
                        type="button"
                        className="allocation-button"
                        disabled={
                          processingId ===
                            candidate.id ||
                          !selectedInternship
                        }
                        onClick={() =>
                          processAllocation(
                            candidate
                          )
                        }
                      >

                        {processingId ===
                        candidate.id
                          ? "Processing..."
                          : "Process Allocation"}

                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}

export default AllocationManagement;