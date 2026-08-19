const express = require("express");

const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requireRole("admin"),
  getApplications
);

router.get(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  getApplicationById
);

router.post(
  "/",
  authenticateToken,
  requireRole("candidate"),
  createApplication
);

router.patch(
  "/:id/status",
  authenticateToken,
  requireRole("admin"),
  updateApplicationStatus
);

module.exports = router;