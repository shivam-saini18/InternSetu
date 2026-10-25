# InternSetu

### Smart Internship Allocation & Management Platform

InternSetu is a full-stack web application designed to streamline internship management, from candidate registration and verification to internship applications, skill matching, and allocation.

The platform provides dedicated workflows for candidates and administrators, bringing profile management, eligibility validation, application tracking, and internship allocation into one place.

## ✨ Features

### 🎓 Candidate Portal
- Candidate registration and profile creation
- Academic information and skills management
- Candidate verification status tracking
- Internship browsing and eligibility information
- Internship application management
- Skill matching and skill-gap identification
- Application status tracking
- Internship allocation result viewing

### 🛡️ Admin Dashboard
- Administrator authentication and role-based access
- Candidate management and verification
- Internship creation, management, and closure
- Application monitoring and status management
- Candidate eligibility validation
- Skill matching and match-score evaluation
- Internship seat availability validation
- Allocation processing and result monitoring

## 🔄 Application Workflow

```text
Candidate Registration
         ↓
 Profile & Skills
         ↓
Candidate Verification
         ↓
Browse Internships
         ↓
 Submit Application
         ↓
 Eligibility Validation
         ↓
   Skill Matching
         ↓
  Admin Review
         ↓
Allocation Processing
         ↓
 Allocation Results
```

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript |
| Build Tool | Vite |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcryptjs |
| API Middleware | CORS, dotenv |

## 📁 Project Structure

```text
InternSetu/
├── backend/
│   ├── database/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/shivam-saini18/InternSetu.git
cd InternSetu
```

### 2. Set up the backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

The backend uses SQLite and expects the database file at `backend/database/internsetu.db`. Ensure the `backend/database` directory exists before starting the server.

Start the backend:

```bash
npm start
```

The API runs on port `5000` by default. The port can be configured using the `PORT` environment variable.

Health check:

```text
http://localhost:5000/api/health
```

A successful response indicates that the backend is running.

### 3. Set up the frontend

Open a **second terminal** in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

Keep both terminals running while using the application locally.

## 🔌 API Overview

The backend exposes REST API routes for the following features:

| Endpoint | Purpose |
|---|---|
| `/api/health` | Backend health check |
| `/api/auth` | Registration and login |
| `/api/candidates` | Candidate profiles and verification |
| `/api/internships` | Internship management |
| `/api/applications` | Internship applications |
| `/api/matching` | Skill-based matching |
| `/api/skill-gap` | Skill-gap analysis |
| `/api/eligibility` | Eligibility validation |
| `/api/allocation` | Internship allocation |
| `/api/dashboard` | Dashboard data |

Authentication and role requirements depend on the individual route.

## 🔐 Security Notes

- Never commit `.env` files, credentials, authentication secrets, or database files.
- The repository's `.gitignore` excludes environment files and SQLite database files.
- Use appropriate environment configuration and a secure authentication secret when running the application in a deployment environment.
- Use synthetic candidate information when demonstrating the application publicly.

## 🌐 Project Links

- **GitHub Repository:** [shivam-saini18/InternSetu](https://github.com/shivam-saini18/InternSetu)

## 🎯 Project Objective

InternSetu aims to make internship management more organized by connecting candidate information, internship opportunities, eligibility checks, skill matching, application workflows, and allocation processing in one platform.

---

**Built with React, Node.js, Express, and SQLite.**
