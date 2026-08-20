const db = require("../config/database");
const { calculateMatch } = require("../services/matchingService");

const getSkillGap = (req, res) => {
  try {
    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          a.internship_id,
          a.match_score,
          c.skills AS candidate_skills,
          i.title AS internship_title,
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

    const suggestions = result.missingSkills.map(
      (skill) => `Improve ${skill} skills`
    );

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        candidateId: application.candidate_id,
        internshipId: application.internship_id,
        internshipTitle: application.internship_title,
        matchPercentage: result.matchPercentage,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        suggestions,
      },
    });
  } catch (error) {
    console.error("Skill gap error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate skill gap",
    });
  }
};

module.exports = {
  getSkillGap,
};