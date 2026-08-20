const express = require("express");

const {
  getCandidateDashboard,
} = require("../controllers/dashboardController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/candidate/:candidateId",
  authenticateToken,
  requireRole("candidate", "admin"),
  getCandidateDashboard
);

module.exports = router;