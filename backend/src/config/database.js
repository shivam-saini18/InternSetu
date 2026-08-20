const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../../database/internsetu.db");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

console.log("SQLite database connected");

module.exports = db;