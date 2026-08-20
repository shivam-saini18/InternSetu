const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./src/config/database");

// Database schema must load before authentication schema
require("./src/config/schema");
require("./src/config/authSchema");

const app = express();

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    process.env.FRONTEND_URL.replace(/\/$/, "")
  );
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as health checks/server-side tools.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(
        `CORS blocked origin: ${origin}`
      );

      return callback(
        new Error("CORS origin not allowed")
      );
    },
    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],
  })
);

app.use(express.json());

/* =========================
   AUTHENTICATION
========================= */

const authRoutes = require("./src/routes/authRoutes");

app.use("/api/auth", authRoutes);

/* =========================
   CANDIDATES
========================= */

const candidateRoutes = require("./src/routes/candidateRoutes");

app.use("/api/candidates", candidateRoutes);

/* =========================
   INTERNSHIPS
========================= */

const internshipRoutes = require("./src/routes/internshipRoutes");

app.use("/api/internships", internshipRoutes);

/* =========================
   APPLICATIONS
========================= */

const applicationRoutes = require("./src/routes/applicationRoutes");

app.use("/api/applications", applicationRoutes);

/* =========================
   MATCHING
========================= */

const matchingRoutes = require("./src/routes/matchingRoutes");

app.use("/api/matching", matchingRoutes);

/* =========================
   SKILL GAP
========================= */

const skillGapRoutes = require("./src/routes/skillGapRoutes");

app.use("/api/skill-gap", skillGapRoutes);

/* =========================
   ELIGIBILITY
========================= */

const eligibilityRoutes = require("./src/routes/eligibilityRoutes");

app.use("/api/eligibility", eligibilityRoutes);

/* =========================
   ALLOCATION
========================= */

const allocationRoutes = require("./src/routes/allocationRoutes");

app.use("/api/allocation", allocationRoutes);

/* =========================
   DASHBOARD
========================= */

const dashboardRoutes = require("./src/routes/dashboardRoutes");

app.use("/api/dashboard", dashboardRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "InternSetu backend is running",
    service: "InternSetu API",
    database: "SQLite",
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((error, req, res, next) => {
  console.error(
    "Unhandled server error:",
    error
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("        INTERNSETU BACKEND");
  console.log("========================================");
  console.log(`Port: ${PORT}`);
  console.log(
    `Health: /api/health`
  );
  console.log(
    `Frontend URL: ${
      process.env.FRONTEND_URL ||
      "localhost development"
    }`
  );
  console.log("Authentication schema: loaded");
  console.log("Candidate routes: loaded");
  console.log("Internship routes: loaded");
  console.log("Application routes: loaded");
  console.log("Matching routes: loaded");
  console.log("Eligibility routes: loaded");
  console.log("Allocation routes: loaded");
  console.log("Dashboard routes: loaded");
  console.log("========================================");
  console.log("");
});