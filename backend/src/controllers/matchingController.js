const db = require("../config/database");
const { calculateMatch } = require("../services/matchingService");

const getApplicationMatch = (req, res) => {
  try {
    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          a.internship_id,
          c.skills AS candidate_skills,
          i.required_skills
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

    const result = calculateMatch(
      application.candidate_skills,
      application.required_skills
    );

    db.prepare(`
      UPDATE applications
      SET match_score = ?
      WHERE id = ?
    `).run(result.matchPercentage, req.params.id);

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        candidateId: application.candidate_id,
        internshipId: application.internship_id,
        matchPercentage: result.matchPercentage,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate skill match",
    });
  }
};

module.exports = {
  getApplicationMatch,
};