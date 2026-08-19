const express = require("express");

const {
  getAllocation,
} = require("../controllers/allocationController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/applications/:id",
  authenticateToken,
  requireRole("admin"),
  getAllocation
);

module.exports = router;