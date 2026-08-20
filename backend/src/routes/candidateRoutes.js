const express = require("express");

const {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateVerification,
} = require("../controllers/candidateController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Candidate registration remains public.
router.post("/", createCandidate);

// Candidate database is admin-only.
router.get(
  "/",
  authenticateToken,
  requireRole("admin"),
  getCandidates
);

// Candidate profile requires authentication.
router.get(
  "/:id",
  authenticateToken,
  requireRole("candidate", "admin"),
  getCandidateById
);

// Verification is an administrative action.
router.patch(
  "/:id/verification",
  authenticateToken,
  requireRole("admin"),
  updateVerification
);

module.exports = router;