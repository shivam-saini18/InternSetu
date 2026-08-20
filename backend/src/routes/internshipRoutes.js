const express = require("express");

const {
  getInternships,
  getInternshipById,
  createInternship,
  closeInternship,
} = require("../controllers/internshipController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getInternships);

router.get("/:id", getInternshipById);

router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  createInternship
);

router.patch(
  "/:id/close",
  authenticateToken,
  requireRole("admin"),
  closeInternship
);

module.exports = router;