const calculateAllocation = ({
  verificationPassed,
  eligible,
  matchScore,
}) => {
  if (!verificationPassed) {
    return {
      decision: "Pending Verification",
      reason: "Candidate profile verification is pending",
    };
  }

  if (!eligible) {
    return {
      decision: "Not Eligible",
      reason: "Candidate does not satisfy the eligibility requirements",
    };
  }

  if (matchScore >= 80) {
    return {
      decision: "Recommended",
      reason: "Strong skill match with the internship requirements",
    };
  }

  if (matchScore >= 60) {
    return {
      decision: "Skill Gap",
      reason: "Candidate is eligible but has some skill gaps",
    };
  }

  return {
    decision: "Not Recommended",
    reason: "Skill match is below the recommended threshold",
  };
};

module.exports = {
  calculateAllocation,
};