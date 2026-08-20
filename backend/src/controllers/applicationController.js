const db = require("../config/database");
const { calculateMatch } = require("../services/matchingService");

const getApplications = (req, res) => {
  try {
    const applications = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          c.name AS candidate_name,
          a.internship_id,
          i.title AS internship_title,
          i.company,
          a.match_score,
          a.status,
          a.created_at
        FROM applications a
        JOIN candidates c ON c.id = a.candidate_id
        JOIN internships i ON i.id = a.internship_id
        ORDER BY a.id DESC
      `)
      .all();

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

const getApplicationById = (req, res) => {
  try {
    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          c.name AS candidate_name,
          a.internship_id,
          i.title AS internship_title,
          i.company,
          a.match_score,
          a.status,
          a.created_at
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

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Get application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

const createApplication = (req, res) => {
  try {
    const candidate_id = Number(req.user.candidateId);
    const internship_id = Number(req.body.internship_id);

    if (
      !Number.isInteger(candidate_id) ||
      candidate_id <= 0 ||
      !Number.isInteger(internship_id) ||
      internship_id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "internship_id must be a valid positive integer",
      });
    }

    const candidate = db
      .prepare(`
        SELECT
          id,
          name,
          degree,
          skills,
          verification_status
        FROM candidates
        WHERE id = ?
      `)
      .get(candidate_id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const internship = db
      .prepare(`
        SELECT
          id,
          title,
          company,
          required_degree,
          required_skills,
          seats,
          status
        FROM internships
        WHERE id = ?
      `)
      .get(internship_id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    if (internship.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Applications are closed for this internship",
      });
    }

    const existingApplication = db
      .prepare(`
        SELECT
          id,
          match_score,
          status
        FROM applications
        WHERE candidate_id = ?
          AND internship_id = ?
      `)
      .get(candidate_id, internship_id);

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message:
          "Candidate has already applied for this internship",
        data: existingApplication,
      });
    }

    const match = calculateMatch(
      candidate.skills || "",
      internship.required_skills || ""
    );

    const verificationPassed =
      String(candidate.verification_status || "")
        .trim()
        .toLowerCase() === "verified";

    const applicationStatus = verificationPassed
      ? "Under Review"
      : "Pending";

    const result = db
      .prepare(`
        INSERT INTO applications
        (
          candidate_id,
          internship_id,
          match_score,
          status
        )
        VALUES (?, ?, ?, ?)
      `)
      .run(
        candidate_id,
        internship_id,
        match.matchPercentage,
        applicationStatus
      );

    const applicationId = Number(result.lastInsertRowid);

    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          c.name AS candidate_name,
          a.internship_id,
          i.title AS internship_title,
          i.company,
          a.match_score,
          a.status,
          a.created_at
        FROM applications a
        JOIN candidates c ON c.id = a.candidate_id
        JOIN internships i ON i.id = a.internship_id
        WHERE a.id = ?
      `)
      .get(applicationId);

    if (!application) {
      return res.status(500).json({
        success: false,
        message:
          "Application was created but could not be retrieved",
      });
    }

    console.log(
      `Application created: ${applicationId} | Candidate: ${candidate_id} | Internship: ${internship_id}`
    );

    return res.status(201).json({
      success: true,
      message: "Application created successfully",
      data: {
        id: application.id,
        candidate_id: application.candidate_id,
        candidate_name: application.candidate_name,
        internship_id: application.internship_id,
        internship_title: application.internship_title,
        company: application.company,
        match_score: application.match_score,
        status: application.status,
        created_at: application.created_at,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      },
    });
  } catch (error) {
    console.error("Create application error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create application",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

const updateApplicationStatus = (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Allocated",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          a.internship_id,
          a.match_score,
          a.status,
          c.verification_status,
          i.title AS internship_title,
          i.seats,
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

    if (status === "Allocated") {
      if (
        String(application.verification_status || "")
          .trim()
          .toLowerCase() !== "verified"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Candidate must be verified before allocation",
        });
      }

      if (application.internship_status !== "Active") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot allocate a candidate to a closed internship",
        });
      }

      const allocatedCount = db
        .prepare(`
          SELECT COUNT(*) AS count
          FROM applications
          WHERE internship_id = ?
            AND status = 'Allocated'
            AND id != ?
        `)
        .get(
          application.internship_id,
          application.id
        );

      if (allocatedCount.count >= application.seats) {
        return res.status(409).json({
          success: false,
          message: "No internship seats are available",
        });
      }
    }

    const result = db
      .prepare(`
        UPDATE applications
        SET status = ?
        WHERE id = ?
      `)
      .run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const updatedApplication = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          c.name AS candidate_name,
          a.internship_id,
          i.title AS internship_title,
          i.company,
          a.match_score,
          a.status,
          a.created_at
        FROM applications a
        JOIN candidates c ON c.id = a.candidate_id
        JOIN internships i ON i.id = a.internship_id
        WHERE a.id = ?
      `)
      .get(req.params.id);

    res.json({
      success: true,
      message: "Application status updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Update application status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
};