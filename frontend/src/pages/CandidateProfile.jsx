import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function CandidateProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    degree: "",
    college: "",
    skills: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          degree: form.degree.trim(),
          college: form.college.trim(),
          skills: form.skills.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Candidate registration failed"
        );
      }

      /*
       * The authentication service returns:
       *
       * data: {
       *   userId,
       *   candidateId
       * }
       *
       * Registration itself currently does NOT return a JWT.
       * Therefore immediately log the candidate in.
       */

      const loginResponse = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (!loginResponse.ok || !loginResult.success) {
        throw new Error(
          loginResult.message ||
            "Registration succeeded, but automatic login failed"
        );
      }

      const loginData = loginResult.data;

      if (!loginData?.token) {
        throw new Error(
          "Registration succeeded, but authentication token was not received"
        );
      }

      /*
       * Store authentication state.
       */
      localStorage.setItem(
        "token",
        loginData.token
      );

      localStorage.setItem(
        "authToken",
        loginData.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(loginData.user)
      );

      localStorage.setItem(
        "candidateId",
        String(
          loginData.user?.candidateId ||
            result.data?.candidateId
        )
      );

      localStorage.setItem(
        "candidateProfile",
        JSON.stringify({
          name: form.name,
          email: form.email,
          degree: form.degree,
          college: form.college,
          skills: form.skills,
        })
      );

      const candidateId =
        loginData.user?.candidateId ||
        result.data?.candidateId;

      if (!candidateId) {
        throw new Error(
          "Candidate was registered, but candidate ID was not returned"
        );
      }

      navigate(`/candidate/dashboard/${candidateId}`);
    } catch (err) {
      console.error(
        "Candidate registration error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete candidate registration"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Candidate Registration</span>
      </nav>

      <main className="form-container">

        <div className="form-header">
          <p className="label">CANDIDATE REGISTRATION</p>

          <h1>Create your InternSetu account</h1>

          <p>
            Register your profile to check eligibility,
            discover suitable internships, submit applications
            and track allocation status.
          </p>
        </div>

        {error && (
          <div className="error-box">
            <strong>Registration failed</strong>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>
            Full Name

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Email Address

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Create Password

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <label>
            Degree / Qualification

            <input
              type="text"
              name="degree"
              value={form.degree}
              onChange={handleChange}
              placeholder="Example: B.Tech Computer Science"
              required
            />
          </label>

          <label>
            College / Institution

            <input
              type="text"
              name="college"
              value={form.college}
              onChange={handleChange}
              placeholder="Enter your college or institution"
            />
          </label>

          <label>
            Skills

            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Example: Java, Python, SQL, React"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating secure account..."
              : "Register & Continue"}
          </button>

        </form>

        <div
          style={{
            marginTop: "20px",
            padding: "14px 16px",
            borderRadius: "8px",
            background: "#f4f7fb",
            border: "1px solid #dce3ec",
            fontSize: "13px",
            color: "#52606d",
            lineHeight: "1.6",
          }}
        >
          Your account is securely authenticated before
          accessing your candidate dashboard.
        </div>

      </main>
    </div>
  );
}

export default CandidateProfile;