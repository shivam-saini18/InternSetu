const db = require("../config/database");
const { checkEligibility } = require("../services/eligibilityService");
const { calculateAllocation } = require("../services/allocationService");

const getAllocation = (req, res) => {
  try {
    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          a.internship_id,
          a.match_score,
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

    const eligibility = checkEligibility(
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

    const allocation = calculateAllocation({
      verificationPassed: eligibility.verificationPassed,
      eligible: eligibility.eligible,
      matchScore: application.match_score || 0,
    });

    let applicationStatus = "Pending";

    if (allocation.decision === "Recommended") {
      applicationStatus = "Shortlisted";
    } else if (allocation.decision === "Skill Gap") {
      applicationStatus = "Under Review";
    } else if (
      allocation.decision === "Not Eligible" ||
      allocation.decision === "Not Recommended"
    ) {
      applicationStatus = "Rejected";
    } else if (
      allocation.decision === "Pending Verification"
    ) {
      applicationStatus = "Pending";
    }

    db.prepare(`
      UPDATE applications
      SET status = ?
      WHERE id = ?
    `).run(applicationStatus, application.id);

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        candidateId: application.candidate_id,
        internshipId: application.internship_id,
        candidateName: application.candidate_name,
        internshipTitle: application.internship_title,
        internshipStatus: application.internship_status,
        verificationPassed: eligibility.verificationPassed,
        eligible: eligibility.eligible,
        matchScore: application.match_score || 0,
        decision: allocation.decision,
        reason: allocation.reason,
        missingSkills: eligibility.missingSkills,
      },
    });
  } catch (error) {
    console.error("Allocation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate allocation",
    });
  }
};

module.exports = {
  getAllocation,
};