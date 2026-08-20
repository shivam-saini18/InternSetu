const express = require("express");

const {
  getVerifiedCandidates,
  getAllocationInternships,
  allocateCandidate,
  getAllocation,
} = require("../controllers/allocationController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
=========================================================
ADMIN ALLOCATION QUEUE
=========================================================
*/

router.get(
  "/candidates",
  authenticateToken,
  requireRole("admin"),
  getVerifiedCandidates
);

/*
=========================================================
ACTIVE INTERNSHIPS FOR ALLOCATION
=========================================================
*/

router.get(
  "/internships",
  authenticateToken,
  requireRole("admin"),
  getAllocationInternships
);

/*
=========================================================
ALLOCATE VERIFIED CANDIDATE
=========================================================
*/

router.post(
  "/candidates/:candidateId",
  authenticateToken,
  requireRole("admin"),
  allocateCandidate
);

/*
=========================================================
ALLOCATION RESULT
=========================================================
*/

router.get(
  "/applications/:id",
  authenticateToken,
  requireRole("admin"),
  getAllocation
);

module.exports = router;