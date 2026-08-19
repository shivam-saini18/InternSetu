const db = require("../config/database");

const createCandidate = (req, res) => {
  try {
    const { name, email, degree, college, skills } = req.body;

    if (!name || !email || !degree || !skills) {
      return res.status(400).json({
        success: false,
        message: "Name, email, degree and skills are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingCandidate = db
      .prepare(`
        SELECT id
        FROM candidates
        WHERE email = ?
      `)
      .get(normalizedEmail);

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: "Candidate with this email already exists",
        candidateId: existingCandidate.id,
      });
    }

    const result = db
      .prepare(`
        INSERT INTO candidates
        (
          name,
          email,
          degree,
          college,
          skills,
          verification_status
        )
        VALUES (?, ?, ?, ?, ?, 'Pending')
      `)
      .run(
        name.trim(),
        normalizedEmail,
        degree.trim(),
        college ? college.trim() : "Not provided",
        skills.trim()
      );

    const candidate = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          degree,
          college,
          skills,
          verification_status,
          created_at
        FROM candidates
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Candidate profile created successfully",
      data: candidate,
    });
  } catch (error) {
    console.error("Create candidate error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create candidate",
    });
  }
};

const getCandidates = (req, res) => {
  try {
    const candidates = db
      .prepare(
        `SELECT id, name, email, degree, college, skills,
                verification_status, created_at
         FROM candidates
         ORDER BY id DESC`
      )
      .all();

    res.json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
    });
  }
};

const getCandidateById = (req, res) => {
  try {
    const requestedId = Number(req.params.id);

    if (!Number.isInteger(requestedId) || requestedId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    if (
      req.user.role === "candidate" &&
      Number(req.user.candidateId) !== requestedId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this candidate",
      });
    }

    const candidate = db
      .prepare(
        `SELECT id, name, email, degree, college, skills,
                verification_status, created_at
         FROM candidates
         WHERE id = ?`
      )
      .get(requestedId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    console.error("Get candidate error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate",
    });
  }
};

const updateVerification = (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Verified", "Rejected", "Pending"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status",
      });
    }

    const result = db
      .prepare(
        `UPDATE candidates
         SET verification_status = ?
         WHERE id = ?`
      )
      .run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const candidate = db
      .prepare(
        `SELECT id, name, email, degree, college, skills,
                verification_status
         FROM candidates
         WHERE id = ?`
      )
      .get(req.params.id);

    res.json({
      success: true,
      message: `Candidate ${status.toLowerCase()} successfully`,
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update verification status",
    });
  }
};

module.exports = {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateVerification,
};