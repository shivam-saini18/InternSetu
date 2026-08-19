const express = require("express");

const {
  getSkillGap,
} = require("../controllers/skillGapController");

const router = express.Router();

router.get("/applications/:id", getSkillGap);

module.exports = router;