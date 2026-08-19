import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Administrator login failed"
        );
      }

      const user = result.data?.user;
      const token = result.data?.token;

      if (!token || !user) {
        throw new Error(
          "Login succeeded but authentication data was not returned."
        );
      }

      if (user.role !== "admin") {
        throw new Error(
          "This account does not have administrator permission."
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.message || "Unable to login as administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Administration Portal</span>
      </nav>

      <main className="form-container">

        <div className="form-header">

          <p className="label">
            SECURE ADMINISTRATION
          </p>

          <h1>
            Administrator Sign In
          </h1>

          <p>
            Sign in with your authorized InternSetu
            administrator account to access the
            government internship administration portal.
          </p>

        </div>

        {error && (
          <div className="error-box">
            <strong>Sign-in failed</strong>
            <br />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>
            Administrator Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter administrator email"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter administrator password"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : "Sign In Securely"}
          </button>

        </form>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "10px",
            background: "#f4f7fb",
            border: "1px solid #dfe6ef",
            fontSize: "13px",
            color: "#526071",
            lineHeight: "1.6",
          }}
        >
          <strong>Authorized Access</strong>

          <br />

          This area is restricted to authorized
          administration personnel.
        </div>

        <button
          type="button"
          className="secondary-button"
          style={{ marginTop: "16px" }}
          onClick={() => navigate("/")}
        >
          ← Back to InternSetu
        </button>

      </main>
    </div>
  );
}

export default AdminLogin;