const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const JWT_SECRET =
  process.env.JWT_SECRET || "internsetu-development-secret";

const registerCandidate = async ({
  name,
  email,
  password,
  degree,
  college,
  skills,
}) => {
  if (!name || !email || !password || !degree || !skills) {
    throw new Error("Name, email, password, degree and skills are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(normalizedEmail);

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const existingCandidate = db
    .prepare("SELECT id FROM candidates WHERE email = ?")
    .get(normalizedEmail);

  if (existingCandidate) {
    throw new Error("Candidate with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const transaction = db.transaction(() => {
    const candidateResult = db
      .prepare(`
        INSERT INTO candidates
        (name, email, degree, college, skills)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        name.trim(),
        normalizedEmail,
        degree.trim(),
        college ? college.trim() : null,
        skills.trim()
      );

    const candidateId = candidateResult.lastInsertRowid;

    const userResult = db
      .prepare(`
        INSERT INTO users
        (email, password_hash, role, candidate_id)
        VALUES (?, ?, 'candidate', ?)
      `)
      .run(normalizedEmail, passwordHash, candidateId);

    return {
      userId: userResult.lastInsertRowid,
      candidateId,
    };
  });

  return transaction();
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = db
    .prepare(`
      SELECT
        id,
        email,
        password_hash,
        role,
        candidate_id
      FROM users
      WHERE email = ?
    `)
    .get(normalizedEmail);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      candidateId: user.candidate_id,
    },
    JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      candidateId: user.candidate_id,
    },
  };
};

module.exports = {
  registerCandidate,
  login,
};