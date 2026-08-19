const express = require("express");

const {
  getEligibility,
} = require("../controllers/eligibilityController");

const router = express.Router();

router.get("/applications/:id", getEligibility);

module.exports = router;