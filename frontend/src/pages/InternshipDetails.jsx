import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function InternshipDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [internship, setInternship] = useState(null);
  const [match, setMatch] = useState({
    matchPercentage: 0,
    matchedSkills: [],
    missingSkills: [],
  });

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [error, setError] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    loadInternship();
  }, [id]);

  async function loadInternship() {
    try {
      setLoading(true);
      setError("");
      setAlreadyApplied(false);

      const candidateId = localStorage.getItem("candidateId");

      if (!candidateId) {
        throw new Error(
          "Candidate profile not found. Please create your profile again."
        );
      }

      /*
       * Load internship
       */
      const internshipResponse = await fetch(
        `http://localhost:5000/api/internships/${id}`
      );

      const internshipResult = await internshipResponse.json();

      if (!internshipResponse.ok || !internshipResult.success) {
        throw new Error(
          internshipResult.message ||
            "Failed to load internship details"
        );
      }

      const internshipData = internshipResult.data;

      setInternship(internshipData);

      /*
       * Load candidate
       */
      const candidateResponse = await fetch(
        `http://localhost:5000/api/candidates/${candidateId}`
      );

      const candidateResult = await candidateResponse.json();

      if (!candidateResponse.ok || !candidateResult.success) {
        throw new Error(
          candidateResult.message ||
            "Failed to load candidate profile"
        );
      }

      const candidateSkills = String(
        candidateResult.data.skills || ""
      )
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);

      const requiredSkills = String(
        internshipData.required_skills || ""
      )
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);

      const uniqueRequiredSkills = [
        ...new Set(requiredSkills),
      ];

      const matchedSkills = uniqueRequiredSkills.filter(
        (skill) => candidateSkills.includes(skill)
      );

      const missingSkills = uniqueRequiredSkills.filter(
        (skill) => !candidateSkills.includes(skill)
      );

      const matchPercentage =
        uniqueRequiredSkills.length === 0
          ? 0
          : Math.round(
              (matchedSkills.length /
                uniqueRequiredSkills.length) *
                100
            );

      setMatch({
        matchPercentage,
        matchedSkills,
        missingSkills,
      });
    } catch (err) {
      console.error("Internship details error:", err);

      setError(
        err.message ||
          "Unable to load internship details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    const candidateId = localStorage.getItem("candidateId");
    const internshipId = Number(id);

    setError("");
    setAlreadyApplied(false);

    if (!candidateId) {
      setError(
        "Candidate profile not found. Please create your profile again."
      );
      return;
    }

    if (!Number.isInteger(internshipId)) {
      setError("Invalid internship.");
      return;
    }

    setApplying(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_id: Number(candidateId),
            internship_id: internshipId,
          }),
        }
      );

      /*
       * IMPORTANT:
       * Read the backend response before doing anything else.
       */
      const result = await response.json();

      console.log(
        "Application response:",
        response.status,
        result
      );

      /*
       * DUPLICATE APPLICATION
       */
      if (response.status === 409) {
        setAlreadyApplied(true);
        setError("");
        setApplying(false);
        return;
      }

      /*
       * Other backend errors
       */
      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to create application"
        );
      }

      /*
       * Successful application
       */
      const applicationId = result.data?.id;

      if (!applicationId) {
        throw new Error(
          "Application was created but no application ID was returned."
        );
      }

      console.log(
        "Application created successfully:",
        applicationId
      );

      navigate(
        `/candidate/allocation?applicationId=${applicationId}`
      );
    } catch (err) {
      console.error(
        "Application creation error:",
        err
      );

      setError(
        err.message ||
          "Unable to create application."
      );
    } finally {
      setApplying(false);
    }
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Internship Details</span>
        </nav>

        <main className="details-container">
          <p>Loading internship details...</p>
        </main>
      </div>
    );
  }

  /*
   * COMPLETE LOAD FAILURE
   */
  if (!internship) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Internship Details</span>
        </nav>

        <main className="details-container">
          <div className="error-box">
            {error || "Unable to load internship."}
          </div>

          <button
            onClick={() =>
              navigate("/candidate/internships")
            }
          >
            Back to Opportunities
          </button>
        </main>
      </div>
    );
  }

  /*
   * NORMAL PAGE
   */
  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Internship Details</span>
      </nav>

      <main className="details-container">
        <p className="label">
          INTERNSHIP #{internship.id}
        </p>

        <h1>{internship.title}</h1>

        <p className="details-subtitle">
          {internship.company}
        </p>

        {/*
         * DUPLICATE APPLICATION MESSAGE
         */}
        {alreadyApplied && (
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              padding: "18px",
              borderRadius: "10px",
              background: "#fff3cd",
              border: "1px solid #ffe69c",
              color: "#664d03",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Already Applied
            </h3>

            <p
              style={{
                marginBottom: "15px",
              }}
            >
              You have already applied for this
              internship.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/candidate/dashboard")
              }
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/*
         * NORMAL ERROR
         */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "8px",
              background: "#f8d7da",
              border: "1px solid #f5c2c7",
              color: "#842029",
            }}
          >
            {error}
          </div>
        )}

        <div className="details-grid">
          <div className="details-box">
            <h3>About the role</h3>

            <p>
              Work on practical projects and contribute
              to technology-driven solutions through the
              InternSetu internship allocation process.
            </p>
          </div>

          <div className="details-box">
            <h3>Required skills</h3>

            <ul>
              {String(
                internship.required_skills || ""
              )
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
                .map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
            </ul>
          </div>

          <div className="details-box">
            <h3>Eligibility</h3>

            <ul>
              <li>Verified candidate profile</li>
              <li>Required skills</li>

              {internship.required_degree && (
                <li>
                  Required degree:{" "}
                  {internship.required_degree}
                </li>
              )}
            </ul>
          </div>

          <div className="details-box highlight-box">
            <h3>Your current match</h3>

            <strong>
              {match.matchPercentage}%
            </strong>

            <p>
              Based on the skills currently present in
              your candidate profile.
            </p>

            {match.missingSkills.length > 0 && (
              <p>
                Missing skills:{" "}
                {match.missingSkills.join(", ")}
              </p>
            )}
          </div>
        </div>

        {!alreadyApplied && (
          <button
            type="button"
            onClick={handleContinue}
            disabled={applying}
          >
            {applying
              ? "Applying..."
              : "Continue"}
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            navigate("/candidate/internships")
          }
          style={{
            marginLeft: "10px",
          }}
        >
          Back to Opportunities
        </button>
      </main>
    </div>
  );
}

export default InternshipDetails;