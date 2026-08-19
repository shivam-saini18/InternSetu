const bcrypt = require("bcryptjs");
const db = require("../config/database");

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function requestPasswordReset(email) {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = db
    .prepare(`
      SELECT id, email, role
      FROM users
      WHERE email = ?
    `)
    .get(normalizedEmail);

  // Do not reveal whether an account exists.
  if (!user) {
    return {
      success: true,
      message: "If the account exists, an OTP has been generated.",
    };
  }

  const otp = generateOtp();

  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  ).toISOString();

  // Invalidate previous unused OTPs.
  db.prepare(`
    UPDATE password_reset_otps
    SET used = 1
    WHERE user_id = ?
      AND purpose = 'password_reset'
      AND used = 0
  `).run(user.id);

  // Store only the hashed OTP.
  db.prepare(`
    INSERT INTO password_reset_otps
    (
      user_id,
      otp_hash,
      purpose,
      expires_at,
      attempts,
      used
    )
    VALUES (?, ?, 'password_reset', ?, 0, 0)
  `).run(
    user.id,
    otpHash,
    expiresAt
  );

  // DEVELOPMENT ONLY.
  // This will later be replaced by real email/SMS delivery.
  console.log(
    `[DEV OTP] Password reset OTP for ${user.email}: ${otp}`
  );

  return {
    success: true,
    message: "If the account exists, an OTP has been generated.",
    developmentOtp: otp,
  };
}

async function verifyOtp(email, otp) {
  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = db
    .prepare(`
      SELECT id
      FROM users
      WHERE email = ?
    `)
    .get(normalizedEmail);

  if (!user) {
    throw new Error("Invalid or expired OTP");
  }

  const resetRecord = db
    .prepare(`
      SELECT
        id,
        user_id,
        otp_hash,
        expires_at,
        attempts,
        used
      FROM password_reset_otps
      WHERE user_id = ?
        AND purpose = 'password_reset'
        AND used = 0
      ORDER BY id DESC
      LIMIT 1
    `)
    .get(user.id);

  if (!resetRecord) {
    throw new Error("Invalid or expired OTP");
  }

  if (resetRecord.attempts >= MAX_ATTEMPTS) {
    throw new Error("Too many OTP attempts");
  }

  if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
    throw new Error("OTP has expired");
  }

  const validOtp = await bcrypt.compare(
    String(otp),
    resetRecord.otp_hash
  );

  if (!validOtp) {
    db.prepare(`
      UPDATE password_reset_otps
      SET attempts = attempts + 1
      WHERE id = ?
    `).run(resetRecord.id);

    throw new Error("Invalid or expired OTP");
  }

  return {
    success: true,
    userId: user.id,
    resetId: resetRecord.id,
  };
}

async function resetPassword(resetId, userId, newPassword) {
  if (!resetId || !userId || !newPassword) {
    throw new Error(
      "Reset ID, user ID and new password are required"
    );
  }

  if (newPassword.length < 8) {
    throw new Error(
      "Password must be at least 8 characters"
    );
  }

  const resetRecord = db
    .prepare(`
      SELECT
        id,
        user_id,
        expires_at,
        used
      FROM password_reset_otps
      WHERE id = ?
        AND user_id = ?
        AND purpose = 'password_reset'
        AND used = 0
    `)
    .get(resetId, userId);

  if (!resetRecord) {
    throw new Error("Invalid password reset request");
  }

  if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
    throw new Error("Password reset request has expired");
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    10
  );

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `).run(passwordHash, userId);

    db.prepare(`
      UPDATE password_reset_otps
      SET used = 1
      WHERE id = ?
    `).run(resetId);
  });

  transaction();

  return {
    success: true,
    message: "Password reset successfully",
  };
}

module.exports = {
  requestPasswordReset,
  verifyOtp,
  resetPassword,
};