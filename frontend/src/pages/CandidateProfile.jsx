import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    education: "",
    skills: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    localStorage.setItem("candidateProfile", JSON.stringify(form));

    navigate("/candidate/verification");
  }

  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Candidate Profile</span>
      </nav>

      <main className="form-container">
        <div className="form-header">
          <p className="label">STEP 1</p>

          <h1>Create your profile</h1>

          <p>
            Add your basic information so InternSetu can check
            eligibility and match you with suitable opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Education
            <input
              type="text"
              name="education"
              value={form.education}
              onChange={handleChange}
              placeholder="Example: B.Tech Computer Science"
              required
            />
          </label>

          <label>
            Skills
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Example: Java, Python, SQL"
              required
            />
          </label>

          <button type="submit">
            Continue to Verification
          </button>
        </form>
      </main>
    </div>
  );
}

export default CandidateProfile;