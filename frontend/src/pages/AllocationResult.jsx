import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getStoredToken() {
  const keys = [
    "token",
    "authToken",
    "accessToken",
    "adminToken",
  ];

  for (const key of keys) {
    const localValue = localStorage.getItem(key);

    if (localValue && localValue.trim()) {
      return localValue.replace(/^Bearer\s+/i, "").trim();
    }

    const sessionValue = sessionStorage.getItem(key);

    if (sessionValue && sessionValue.trim()) {
      return sessionValue.replace(/^Bearer\s+/i, "").trim();
    }
  }

  return null;
}

function getStoredUser() {
  const possibleKeys = [
    "user",
    "currentUser",
    "adminUser",
    "candidateUser",
  ];

  for (const key of possibleKeys) {
    const localValue = localStorage.getItem(key);

    if (localValue) {
      try {
        return JSON.parse(localValue);
      } catch {
        // Ignore invalid JSON and continue.
      }
    }
  }

  return null;
}

function isAdminSession() {
  const user = getStoredUser();

  if (!user) {
    return false;
  }

  const role = String(
    user.role ||
      user.userRole ||
      user.accountRole ||
      ""
  ).toLowerCase();

  return role === "admin" || role === "administrator";
}

function AllocationResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("applicationId");

  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminSession = isAdminSession();

  useEffect(() => {
    let cancelled = false;

    const fetchAllocation = async () => {
      if (!applicationId) {
        if (!cancelled) {
          setError("Application ID is missing.");
          setLoading(false);
        }
        return;
      }

      const token = getStoredToken();

      if (!token) {
        if (!cancelled) {
          setError(
            "Authentication required. Please login again."
          );
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/allocation/applications/${applicationId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let result = {};

        const contentType =
          response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();

          result = {
            success: false,
            message:
              text ||
              "Server returned an unexpected response.",
          };
        }

        if (response.status === 401) {
          throw new Error(
            "Authentication required. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view this allocation result."
          );
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              `Request failed with status ${response.status}.`
          );
        }

        if (!result.success) {
          throw new Error(
            result.message ||
              "Failed to load allocation result."
          );
        }

        if (!cancelled) {
          setAllocation(result.data);
          setError("");
        }
      } catch (err) {
        console.error(
          "Allocation result error:",
          err
        );

        if (!cancelled) {
          if (err instanceof TypeError) {
            setError(
              "Unable to connect to the server. Please make sure the InternSetu backend is running."
            );
          } else {
            setError(
              err.message ||
                "Failed to load allocation result."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllocation();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const handleBackToDashboard = () => {
    /*
      IMPORTANT:

      If the current session belongs to an administrator,
      return to the administrator dashboard.

      If the current session belongs to a candidate,
      return to the candidate dashboard.
    */

    if (adminSession) {
      navigate("/admin/dashboard");
      return;
    }

    const candidateId =
      localStorage.getItem("candidateId");

    if (candidateId) {
      navigate(
        `/candidate/dashboard/${candidateId}`
      );
    } else {
      navigate("/candidate/dashboard");
    }
  };

  const handleSkillGap = () => {
    navigate(
      `/candidate/skill-gap?applicationId=${applicationId}`
    );
  };

  if (loading) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Allocation Result</span>
        </nav>

        <main className="result-container">
          <h1>Loading allocation decision...</h1>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Allocation Result</span>
        </nav>

        <main className="result-container">
          <h1>{error}</h1>

          <button
            type="button"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="page">
        <nav className="navbar">
          <h2>InternSetu</h2>
          <span>Allocation Result</span>
        </nav>

        <main className="result-container">
          <h1>
            Allocation result is not available.
          </h1>

          <button
            type="button"
            onClick={handleBackToDashboard}
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
        <span>Allocation Result</span>
      </nav>

      <main className="result-container">
        <p className="label">
          ALLOCATION RESULT
        </p>

        <div className="result-card">

          <span className="result-status">
            {allocation.decision
              ? String(
                  allocation.decision
                ).toUpperCase()
              : "RESULT"}
          </span>

          <h1>Allocation decision</h1>

          <p>
            {allocation.reason ||
              "Your application has been evaluated using verification, eligibility and skill matching criteria."}
          </p>

          <div className="result-row">
            <span>Verification</span>

            <strong>
              {allocation.verificationPassed
                ? "Verified"
                : "Pending"}
            </strong>
          </div>

          <div className="result-row">
            <span>Eligibility</span>

            <strong>
              {allocation.eligible
                ? "Eligible"
                : "Not Eligible"}
            </strong>
          </div>

          <div className="result-row">
            <span>Skill Match</span>

            <strong>
              {allocation.matchScore !==
                undefined &&
              allocation.matchScore !== null
                ? `${allocation.matchScore}%`
                : "--"}
            </strong>
          </div>

          {!adminSession && (
            <button
              type="button"
              onClick={handleSkillGap}
            >
              See What I Can Improve
            </button>
          )}

          <button
            type="button"
            className="secondary-button"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>

        </div>
      </main>
    </div>
  );
}

export default AllocationResult;