const db = require("../config/database");

const getInternships = (req, res) => {
  try {
    const internships = db
      .prepare(`
        SELECT
          id,
          title,
          company,
          required_skills,
          seats,
          status,
          created_at
        FROM internships
        ORDER BY id DESC
      `)
      .all();

    res.json({
      success: true,
      data: internships,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch internships",
    });
  }
};

const getInternshipById = (req, res) => {
  try {
    const internship = db
      .prepare(`
        SELECT
          id,
          title,
          company,
          required_skills,
          seats,
          status,
          created_at
        FROM internships
        WHERE id = ?
      `)
      .get(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.json({
      success: true,
      data: internship,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch internship",
    });
  }
};

const createInternship = (req, res) => {
  try {
    const {
      title,
      company,
      required_skills,
      seats,
    } = req.body;

    if (
      !title ||
      !company ||
      !required_skills ||
      !Number.isInteger(seats) ||
      seats <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title, company, required_skills and a positive integer seats are required",
      });
    }

    const result = db
      .prepare(`
        INSERT INTO internships
        (title, company, required_skills, seats)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        title.trim(),
        company.trim(),
        required_skills.trim(),
        seats
      );

    const internship = db
      .prepare(`
        SELECT
          id,
          title,
          company,
          required_skills,
          seats,
          status,
          created_at
        FROM internships
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Internship created successfully",
      data: internship,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create internship",
    });
  }
};

const closeInternship = (req, res) => {
  try {
    const result = db
      .prepare(`
        UPDATE internships
        SET status = 'Closed'
        WHERE id = ?
      `)
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const internship = db
      .prepare(`
        SELECT
          id,
          title,
          company,
          required_skills,
          seats,
          status,
          created_at
        FROM internships
        WHERE id = ?
      `)
      .get(req.params.id);

    res.json({
      success: true,
      message: "Internship closed successfully",
      data: internship,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to close internship",
    });
  }
};

module.exports = {
  getInternships,
  getInternshipById,
  createInternship,
  closeInternship,
};