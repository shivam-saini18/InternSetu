import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeSkills(skills) {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => String(skill).trim().toLowerCase())
      .filter(Boolean);
  }

  return String(skills)
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}

function calculateMatch(candidateSkills, requiredSkills) {
  const candidate = new Set(normalizeSkills(candidateSkills));
  const required = [...new Set(normalizeSkills(requiredSkills))];

  if (required.length === 0) {
    return {
      percentage: 0,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const matchedSkills = required.filter((skill) =>
    candidate.has(skill)
  );

  const missingSkills = required.filter(
    (skill) => !candidate.has(skill)
  );

  return {
    percentage: Math.round(
      (matchedSkills.length / required.length) * 100
    ),
    matchedSkills,
    missingSkills,
  };
}

function Internships() {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInternships() {
      try {
        const candidateId = localStorage.getItem("candidateId");

        if (!candidateId) {
          throw new Error(
            "Candidate profile not found. Please create your profile first."
          );
        }

        const [internshipResponse, candidateResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/internships"),
            fetch(
              `http://localhost:5000/api/candidates/${candidateId}`
            ),
          ]);

        const internshipResult =
          await internshipResponse.json();

        const candidateResult =
          await candidateResponse.json();

        if (
          !internshipResponse.ok ||
          !internshipResult.success
        ) {
          throw new Error(
            internshipResult.message ||
              "Failed to load internships"
          );
        }

        if (
          !candidateResponse.ok ||
          !candidateResult.success
        ) {
          throw new Error(
            candidateResult.message ||
              "Failed to load candidate profile"
          );
        }

        const candidate = candidateResult.data;

        const activeInternships = (
          internshipResult.data || []
        )
          .filter(
            (internship) =>
              String(internship.status).toLowerCase() ===
              "active"
          )
          .map((internship) => {
            const match = calculateMatch(
              candidate.skills,
              internship.required_skills ||
                internship.skills
            );

            return {
              ...internship,
              match: match.percentage,
              matchedSkills: match.matchedSkills,
              missingSkills: match.missingSkills,
            };
          })
          .sort((a, b) => b.match - a.match);

        setInternships(activeInternships);
      } catch (err) {
        console.error("Internship loading error:", err);
        setError(
          err.message || "Unable to load internships."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInternships();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Internship Opportunities</span>
        </nav>

        <main className="dashboard">
          <div className="dashboard-header">
            <p className="label">OPPORTUNITIES</p>
            <h1>Loading opportunities...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Internship Opportunities</span>
        </nav>

        <main className="dashboard">
          <div className="error-box">
            {error}
          </div>

          <button
            onClick={() =>
              navigate("/candidate/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Internship Opportunities</span>
      </nav>

      <main className="dashboard">
        <div className="dashboard-header">
          <p className="label">OPPORTUNITIES</p>

          <h1>Internships for you</h1>

          <p>
            These opportunities are ranked using your current
            profile and skill information.
          </p>
        </div>

        {internships.length === 0 ? (
          <div className="error-box">
            No active internships are currently available.
          </div>
        ) : (
          <div className="internship-list">
            {internships.map((internship) => (
              <div
                className="internship-card"
                key={internship.id}
              >
                <div>
                  <span className="match">
                    {internship.match}% skill match
                  </span>

                  <h2>{internship.title}</h2>

                  <p>
                    {internship.company ||
                      internship.organization}
                  </p>

                  {internship.location && (
                    <p>{internship.location}</p>
                  )}

                  <div className="skill-list">
                    {normalizeSkills(
                      internship.required_skills ||
                        internship.skills
                    ).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/candidate/internship/${internship.id}`
                    )
                  }
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Internships;