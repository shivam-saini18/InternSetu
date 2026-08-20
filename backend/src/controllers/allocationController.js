const db = require("../config/database");
const { checkEligibility } = require("../services/eligibilityService");
const { calculateMatch } = require("../services/matchingService");
const { calculateAllocation } = require("../services/allocationService");

/*
=========================================================
GET VERIFIED CANDIDATES FOR ADMIN ALLOCATION
=========================================================
*/
const getVerifiedCandidates = (req, res) => {
  try {
    const candidates = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          degree,
          college,
          skills,
          verification_status,
          created_at
        FROM candidates
        WHERE LOWER(TRIM(verification_status)) = 'verified'
        ORDER BY id DESC
      `)
      .all();

    res.json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    console.error(
      "Get verified candidates error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch verified candidates",
    });
  }
};

/*
=========================================================
GET ACTIVE INTERNSHIPS FOR ADMIN ALLOCATION
=========================================================
*/
const getAllocationInternships = (req, res) => {
  try {
    const internships = db
      .prepare(`
        SELECT
          id,
          title,
          company,
          required_degree,
          required_skills,
          seats,
          status,
          created_at
        FROM internships
        WHERE LOWER(TRIM(status)) = 'active'
        ORDER BY id DESC
      `)
      .all();

    res.json({
      success: true,
      data: internships,
    });
  } catch (error) {
    console.error(
      "Get allocation internships error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch active internships",
    });
  }
};

/*
=========================================================
ALLOCATE VERIFIED CANDIDATE
=========================================================
*/
const allocateCandidate = (req, res) => {
  try {
    const candidateId = Number(req.params.candidateId);
    const internshipId = Number(req.body.internship_id);

    if (
      !Number.isInteger(candidateId) ||
      candidateId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    if (
      !Number.isInteger(internshipId) ||
      internshipId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "internship_id must be a valid positive integer",
      });
    }

    /*
    -------------------------------------------------------
    FIND CANDIDATE
    -------------------------------------------------------
    */
    const candidate = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          degree,
          college,
          skills,
          verification_status
        FROM candidates
        WHERE id = ?
      `)
      .get(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    /*
    -------------------------------------------------------
    VERIFY ADMIN-ONLY ALLOCATION CONDITION
    -------------------------------------------------------
    */
    const verified =
      String(candidate.verification_status || "")
        .trim()
        .toLowerCase() === "verified";

    if (!verified) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate must be verified before allocation",
      });
    }

    /*
    -------------------------------------------------------
    FIND INTERNSHIP
    -------------------------------------------------------
    */
    const internship = db
      .prepare(`
        SELECT
          id,
          title,
          company,
          required_degree,
          required_skills,
          seats,
          status
        FROM internships
        WHERE id = ?
      `)
      .get(internshipId);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    /*
    -------------------------------------------------------
    INTERNSHIP MUST BE ACTIVE
    -------------------------------------------------------
    */
    const internshipActive =
      String(internship.status || "")
        .trim()
        .toLowerCase() === "active";

    if (!internshipActive) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot allocate to a closed internship",
      });
    }

    /*
    -------------------------------------------------------
    CHECK EXISTING APPLICATION
    -------------------------------------------------------
    */
    const existingApplication = db
      .prepare(`
        SELECT
          id,
          match_score,
          status
        FROM applications
        WHERE candidate_id = ?
          AND internship_id = ?
      `)
      .get(candidateId, internshipId);

    /*
    -------------------------------------------------------
    CHECK INTERNSHIP CAPACITY
    -------------------------------------------------------
    */
    const allocatedCount = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM applications
        WHERE internship_id = ?
          AND status = 'Allocated'
      `)
      .get(internshipId);

    if (
      Number(allocatedCount.count) >=
      Number(internship.seats)
    ) {
      return res.status(409).json({
        success: false,
        message:
          "No internship seats are available",
      });
    }

    /*
    -------------------------------------------------------
    ELIGIBILITY
    -------------------------------------------------------
    */
    const eligibility = checkEligibility(
      {
        degree: candidate.degree,
        skills: candidate.skills,
        verification_status:
          candidate.verification_status,
      },
      {
        required_skills:
          internship.required_skills || "",
        required_degree:
          internship.required_degree || "",
      }
    );

    /*
    -------------------------------------------------------
    SKILL MATCH
    -------------------------------------------------------
    */
    const match = calculateMatch(
      candidate.skills || "",
      internship.required_skills || ""
    );

    /*
    -------------------------------------------------------
    ALLOCATION DECISION
    -------------------------------------------------------
    */
    const allocation = calculateAllocation({
      verificationPassed:
        eligibility.verificationPassed,
      eligible: eligibility.eligible,
      matchScore: match.matchPercentage,
    });

    /*
    -------------------------------------------------------
    DETERMINE APPLICATION STATUS
    -------------------------------------------------------
    */
    let applicationStatus = "Pending";

    if (allocation.decision === "Recommended") {
      applicationStatus = "Allocated";
    } else if (
      allocation.decision === "Skill Gap"
    ) {
      applicationStatus = "Under Review";
    } else if (
      allocation.decision === "Not Eligible" ||
      allocation.decision === "Not Recommended"
    ) {
      applicationStatus = "Rejected";
    } else if (
      allocation.decision ===
      "Pending Verification"
    ) {
      applicationStatus = "Pending";
    }

    /*
    -------------------------------------------------------
    CREATE OR UPDATE APPLICATION
    -------------------------------------------------------
    */
    let applicationId;

    if (existingApplication) {
      db.prepare(`
        UPDATE applications
        SET
          match_score = ?,
          status = ?
        WHERE id = ?
      `).run(
        match.matchPercentage,
        applicationStatus,
        existingApplication.id
      );

      applicationId = existingApplication.id;
    } else {
      const result = db
        .prepare(`
          INSERT INTO applications
          (
            candidate_id,
            internship_id,
            match_score,
            status
          )
          VALUES (?, ?, ?, ?)
        `)
        .run(
          candidateId,
          internshipId,
          match.matchPercentage,
          applicationStatus
        );

      applicationId =
        Number(result.lastInsertRowid);
    }

    /*
    -------------------------------------------------------
    RESPONSE
    -------------------------------------------------------
    */
    return res.json({
      success: true,

      message:
        applicationStatus === "Allocated"
          ? "Candidate allocated successfully"
          : "Allocation evaluation completed",

      data: {
        applicationId,

        candidateId: candidate.id,
        candidateName: candidate.name,

        internshipId: internship.id,
        internshipTitle: internship.title,
        company: internship.company,

        verificationPassed:
          eligibility.verificationPassed,

        eligible:
          eligibility.eligible,

        matchScore:
          match.matchPercentage,

        decision:
          allocation.decision,

        reason:
          allocation.reason,

        missingSkills:
          eligibility.missingSkills || [],

        matchedSkills:
          match.matchedSkills || [],

        status:
          applicationStatus,
      },
    });
  } catch (error) {
    console.error(
      "Allocate candidate error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process candidate allocation",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/*
=========================================================
EXISTING APPLICATION ALLOCATION RESULT
=========================================================
*/
const getAllocation = (req, res) => {
  try {
    const application = db
      .prepare(`
        SELECT
          a.id,
          a.candidate_id,
          a.internship_id,
          a.match_score,
          c.name AS candidate_name,
          c.degree,
          c.skills,
          c.verification_status,
          i.title AS internship_title,
          i.required_skills,
          i.required_degree,
          i.status AS internship_status
        FROM applications a
        JOIN candidates c
          ON c.id = a.candidate_id
        JOIN internships i
          ON i.id = a.internship_id
        WHERE a.id = ?
      `)
      .get(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const eligibility = checkEligibility(
      {
        degree: application.degree,
        skills: application.skills,
        verification_status:
          application.verification_status,
      },
      {
        required_skills:
          application.required_skills || "",
        required_degree:
          application.required_degree || "",
      }
    );

    const allocation = calculateAllocation({
      verificationPassed:
        eligibility.verificationPassed,

      eligible:
        eligibility.eligible,

      matchScore:
        application.match_score || 0,
    });

    res.json({
      success: true,

      data: {
        applicationId: application.id,

        candidateId:
          application.candidate_id,

        internshipId:
          application.internship_id,

        candidateName:
          application.candidate_name,

        internshipTitle:
          application.internship_title,

        internshipStatus:
          application.internship_status,

        verificationPassed:
          eligibility.verificationPassed,

        eligible:
          eligibility.eligible,

        matchScore:
          application.match_score || 0,

        decision:
          application.status === "Allocated"
            ? "Allocated"
            : allocation.decision,

        reason:
          allocation.reason,

        missingSkills:
          eligibility.missingSkills || [],
      },
    });
  } catch (error) {
    console.error(
      "Allocation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to calculate allocation",
    });
  }
};

module.exports = {
  getVerifiedCandidates,
  getAllocationInternships,
  allocateCandidate,
  getAllocation,
};