import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function SkillGap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("applicationId");

  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSkillGap = async () => {
      if (!applicationId) {
        setError("Application ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/skill-gap/applications/${applicationId}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load skill gap");
        }

        setSkillGap(result.data);
      } catch (err) {
        console.error("Skill gap error:", err);
        setError("Unable to load skill improvement data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkillGap();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Skill Improvement</span>
        </nav>

        <main className="dashboard">
          <h1>Loading your skill analysis...</h1>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Skill Improvement</span>
        </nav>

        <main className="dashboard">
          <h1>{error}</h1>

          <button onClick={() => navigate("/candidate/dashboard")}>
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const missingSkills = skillGap?.missingSkills || [];
  const suggestions = skillGap?.suggestions || [];

  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Skill Improvement</span>
      </nav>

      <main className="dashboard">
        <p className="label">PERSONALIZED FEEDBACK</p>

        <h1>What is missing from your profile?</h1>

        <p className="hero-text">
          InternSetu explains the skill mismatch and shows areas
          that can improve your future opportunities.
        </p>

        <section className="skill-gap-card">
          <h2>Skill mismatch</h2>

          <p>
            Your profile currently matches{" "}
            <strong>{skillGap.matchPercentage}%</strong> of the
            internship requirements.
          </p>

          <div className="missing-skills">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))
            ) : (
              <span>No major skill gaps found</span>
            )}
          </div>
        </section>

        <section className="improvement-card">
          <h2>Suggested next step</h2>

          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p>
              Your current skills are well aligned with this
              opportunity.
            </p>
          )}

          <button onClick={() => navigate("/candidate/dashboard")}>
            Back to Dashboard
          </button>
        </section>
      </main>
    </div>
  );
}

export default SkillGap;