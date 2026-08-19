const express = require("express");

const {
  getApplicationMatch,
} = require("../controllers/matchingController");

const router = express.Router();

router.get("/applications/:id/match", getApplicationMatch);

module.exports = router;