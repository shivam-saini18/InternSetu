const db = require("../config/database");
const { checkEligibility } = require("../services/eligibilityService");

const getEligibility = (req, res) => {
  try {
    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          a.internship_id,
          c.name AS candidate_name,
          c.degree,
          c.skills,
          c.verification_status,
          i.title AS internship_title,
          i.required_skills,
          i.status AS internship_status
        FROM applications a
        JOIN candidates c ON c.id = a.candidate_id
        JOIN internships i ON i.id = a.internship_id
        WHERE a.id = ?
      `)
      .get(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const result = checkEligibility(
      {
        degree: application.degree,
        skills: application.skills,
        verification_status: application.verification_status,
      },
      {
        required_skills: application.required_skills,
        required_degree: "",
      }
    );

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        candidateId: application.candidate_id,
        internshipId: application.internship_id,
        candidateName: application.candidate_name,
        internshipTitle: application.internship_title,
        internshipStatus: application.internship_status,
        eligible: result.eligible,
        verificationPassed: result.verificationPassed,
        degreePassed: result.degreePassed,
        skillsPassed: result.skillsPassed,
        missingSkills: result.missingSkills,
        reasons: result.reasons,
      },
    });
  } catch (error) {
    console.error("Eligibility error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
    });
  }
};

module.exports = {
  getEligibility,
};