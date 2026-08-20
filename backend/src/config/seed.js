const db = require("./database");

const candidates = [
  {
    name: "Rahul Sharma",
    email: "rahul@example.com",
    degree: "B.Tech Computer Science",
    college: "ABC Institute of Technology",
    skills: "Java, SQL, Git, Python",
    verification_status: "Verified",
  },
  {
    name: "Priya Singh",
    email: "priya@example.com",
    degree: "B.Tech Information Technology",
    college: "XYZ Institute of Technology",
    skills: "Python, SQL, Excel, Data Analysis",
    verification_status: "Verified",
  },
  {
    name: "Aman Kumar",
    email: "aman@example.com",
    degree: "B.Tech Computer Science",
    college: "National Institute of Technology",
    skills: "HTML, CSS, JavaScript, React",
    verification_status: "Pending",
  },
];

const internships = [
  {
    title: "Software Developer Intern",
    company: "Tech Solutions",
    required_skills: "Java, SQL, Git",
    seats: 10,
  },
  {
    title: "Data Analyst Intern",
    company: "DataWorks",
    required_skills: "Python, SQL, Excel",
    seats: 8,
  },
  {
    title: "Web Development Intern",
    company: "Digital Labs",
    required_skills: "HTML, CSS, JavaScript",
    seats: 6,
  },
];

const insertCandidate = db.prepare(`
  INSERT OR IGNORE INTO candidates
  (name, email, degree, college, skills, verification_status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertInternship = db.prepare(`
  INSERT OR IGNORE INTO internships
  (title, company, required_skills, seats)
  VALUES (?, ?, ?, ?)
`);

const seed = db.transaction(() => {
  for (const candidate of candidates) {
    insertCandidate.run(
      candidate.name,
      candidate.email,
      candidate.degree,
      candidate.college,
      candidate.skills,
      candidate.verification_status
    );
  }

  for (const internship of internships) {
    insertInternship.run(
      internship.title,
      internship.company,
      internship.required_skills,
      internship.seats
    );
  }
});

seed();

console.log("InternSetu seed data inserted successfully");