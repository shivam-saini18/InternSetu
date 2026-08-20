import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Verification() {
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const candidateId = localStorage.getItem("candidateId");

    if (!candidateId) {
      setError("Candidate profile not found.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/candidates/${candidateId}/verification`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: "Verified"
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Verification failed"
        );
      }

      setSubmitted(true);

      setTimeout(() => {
        navigate("/candidate/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Candidate Verification</span>
      </nav>

      <main className="form-container">
        <div className="form-header">
          <p className="label">STEP 2</p>

          <h1>Verify your profile</h1>

          <p>
            Verification helps maintain a reliable candidate pool
            before internship allocation.
          </p>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="success-box">
            <h3>Verification successful</h3>

            <p>
              Your profile has been verified successfully.
            </p>

            <span className="status">
              Verified
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Document Type

              <select
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value)
                }
                required
              >
                <option value="">Select document</option>
                <option value="student-id">Student ID</option>
                <option value="government-id">
                  Government ID
                </option>
              </select>
            </label>

            <label>
              Document Number

              <input
                type="text"
                value={documentNumber}
                onChange={(event) =>
                  setDocumentNumber(event.target.value)
                }
                placeholder="Enter document number"
                required
              />
            </label>

            <div className="notice">
              <strong>Why verification?</strong>

              <p>
                Verified profiles can be considered for internship
                eligibility and allocation.
              </p>
            </div>

            <button type="submit" disabled={loading}>
              {loading
                ? "Verifying..."
                : "Submit for Verification"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default Verification;