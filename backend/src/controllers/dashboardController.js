const db = require("../config/database");
const { checkEligibility } = require("../services/eligibilityService");

const getCandidateDashboard = (req, res) => {
  try {
    const requestedCandidateId = Number(req.params.candidateId);

    // Validate candidate ID
    if (
      !Number.isInteger(requestedCandidateId) ||
      requestedCandidateId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    // Candidate can access only their own dashboard.
    // Admin can access any candidate dashboard.
    if (
      req.user.role !== "admin" &&
      Number(req.user.candidateId) !== requestedCandidateId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own dashboard",
      });
    }

    const candidate = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          degree,
          college,
          skills,
          verification_status
        FROM candidates
        WHERE id = ?
      `)
      .get(requestedCandidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const applications = db
      .prepare(`
        SELECT
          a.id AS application_id,
          a.internship_id,
          a.match_score,
          a.status,
          i.title AS internship_title,
          i.status AS internship_status,
          i.required_skills
        FROM applications a
        JOIN internships i
          ON i.id = a.internship_id
        WHERE a.candidate_id = ?
        ORDER BY a.created_at DESC
      `)
      .all(requestedCandidateId);

    const dashboardApplications = applications.map(
      (application) => {
        const eligibility = checkEligibility(
          candidate,
          {
            required_skills: application.required_skills,
            required_degree: "",
          }
        );

        return {
          application_id: application.application_id,
          internship_id: application.internship_id,
          match_score: application.match_score,
          status: application.status,
          internship_title: application.internship_title,
          internship_status: application.internship_status,

          eligibility: {
            eligible: eligibility.eligible,
            verificationPassed:
              eligibility.verificationPassed,
            degreePassed:
              eligibility.degreePassed,
            skillsPassed:
              eligibility.skillsPassed,
            missingSkills:
              eligibility.missingSkills,
            reasons:
              eligibility.reasons,
          },
        };
      }
    );

    return res.json({
      success: true,
      data: {
        candidate,
        applications: dashboardApplications,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load candidate dashboard",
    });
  }
};

module.exports = {
  getCandidateDashboard,
};