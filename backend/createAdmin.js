const bcrypt = require("bcryptjs");
const db = require("./src/config/database");

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be provided through environment variables."
    );
  }

  const existing = db
    .prepare("SELECT id, role FROM users WHERE email = ?")
    .get(email);

  if (existing) {
    if (existing.role !== "admin") {
      db.prepare(`
        UPDATE users
        SET role = 'admin'
        WHERE id = ?
      `).run(existing.id);

      console.log("Existing account converted to administrator.");
    } else {
      console.log("Administrator account already exists.");
    }

    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO users
    (
      email,
      password_hash,
      role,
      candidate_id
    )
    VALUES (?, ?, 'admin', NULL)
  `).run(email, passwordHash);

  console.log("");
  console.log("=================================");
  console.log("InternSetu Administrator Created");
  console.log("=================================");
  console.log("Email    :", email);
  console.log("Role     : admin");
  console.log("=================================");
}

createAdmin()
  .catch((error) => {
    console.error("Failed to create administrator:", error);
    process.exit(1);
  })
  .finally(() => {
    try {
      db.close();
    } catch {}
  });