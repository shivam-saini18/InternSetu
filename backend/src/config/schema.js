const db = require("./database");

db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    degree TEXT NOT NULL,
    college TEXT,
    skills TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    required_degree TEXT,
    required_skills TEXT NOT NULL,
    seats INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    internship_id INTEGER NOT NULL,
    match_score REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (candidate_id)
      REFERENCES candidates(id)
      ON DELETE CASCADE,

    FOREIGN KEY (internship_id)
      REFERENCES internships(id)
      ON DELETE CASCADE,

    UNIQUE(candidate_id, internship_id)
  );
`);

/*
  Safe migration for existing databases.
  CREATE TABLE IF NOT EXISTS does not modify an existing table,
  so add required_degree if it is missing.
*/
const internshipColumns = db
  .prepare(`PRAGMA table_info(internships)`)
  .all();

const hasRequiredDegree = internshipColumns.some(
  (column) => column.name === "required_degree"
);

if (!hasRequiredDegree) {
  db.exec(`
    ALTER TABLE internships
    ADD COLUMN required_degree TEXT
  `);

  console.log("Migration applied: required_degree added");
}

console.log("Database schema ready");

module.exports = db;