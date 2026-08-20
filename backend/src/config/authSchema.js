const db = require("./database");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'candidate')),
    candidate_id INTEGER UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (candidate_id)
      REFERENCES candidates(id)
      ON DELETE CASCADE
  )
`);

console.log("Authentication schema ready");

module.exports = db;