const normalize = (value) =>
  (value || "").trim().toLowerCase();

const normalizeSkills = (skills) =>
  (skills || "")
    .split(",")
    .map((skill) => normalize(skill))
    .filter(Boolean);

const checkEligibility = (candidate, internship) => {
  const reasons = [];
  const requiredSkills = normalizeSkills(internship.required_skills);
  const candidateSkills = new Set(normalizeSkills(candidate.skills));

  const verificationPassed =
    normalize(candidate.verification_status) === "verified";

  if (!verificationPassed) {
    reasons.push("Candidate profile is not verified");
  }

  const degreePassed =
    !internship.required_degree ||
    normalize(candidate.degree) ===
      normalize(internship.required_degree);

  if (!degreePassed) {
    reasons.push(
      `Required degree: ${internship.required_degree}`
    );
  }

  const missingSkills = requiredSkills.filter(
    (skill) => !candidateSkills.has(skill)
  );

  const skillsPassed = missingSkills.length === 0;

  if (!skillsPassed) {
    reasons.push(
      `Missing skills: ${missingSkills.join(", ")}`
    );
  }

  return {
    eligible:
      verificationPassed &&
      degreePassed &&
      skillsPassed,

    verificationPassed,
    degreePassed,
    skillsPassed,
    missingSkills,
    reasons,
  };
};

module.exports = {
  checkEligibility,
};