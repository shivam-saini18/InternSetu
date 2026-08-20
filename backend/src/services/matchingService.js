const normalizeSkills = (skills) => {
  if (!skills) return [];

  return skills
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
};

const calculateMatch = (candidateSkills, requiredSkills) => {
  const candidate = new Set(normalizeSkills(candidateSkills));
  const required = [...new Set(normalizeSkills(requiredSkills))];

  if (required.length === 0) {
    return {
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const matchedSkills = required.filter((skill) =>
    candidate.has(skill)
  );

  const missingSkills = required.filter(
    (skill) => !candidate.has(skill)
  );

  const matchPercentage = Math.round(
    (matchedSkills.length / required.length) * 100
  );

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
  };
};

module.exports = {
  calculateMatch,
};