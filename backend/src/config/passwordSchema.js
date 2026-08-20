const db = require("./database");

const columns = db
  .prepare("PRAGMA table_info(users)")
  .all()
  .map((column) => column.name);

if (!columns.includes("phone")) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN phone TEXT
  `);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS password_reset_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'password_reset',
    expires_at DATETIME NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  )
`);

console.log("Password reset schema ready");

module.exports = db;