import { useState } from "react";

function Verification() {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(true);
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

        {submitted ? (
          <div className="success-box">
            <h3>Verification submitted</h3>

            <p>
              Your verification request has been submitted for review.
            </p>

            <span className="status">
              Pending Verification
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
                <option value="government-id">Government ID</option>
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

            <button type="submit">
              Submit for Verification
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default Verification;