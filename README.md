# InternSetu

## Smart Internship Allocation & Management Platform

InternSetu is a full-stack internship management platform designed to simplify the journey from **candidate registration and verification to internship application, skill matching, and final allocation**.

The platform provides dedicated workflows for candidates and administrators, with verification, eligibility checking, skill-based matching, application management, seat validation, and allocation processing.

---

## 🚀 Key Features

### 👨‍🎓 Candidate Workflow

- Candidate registration and profile creation
- Academic information management
- Skills management
- Candidate verification status tracking
- Internship browsing
- Internship details and eligibility information
- Internship application
- Skill-based matching
- Skill-gap identification
- Application status tracking
- Allocation result viewing

### 👨‍💼 Administrator Workflow

- Secure administrator authentication
- Candidate management
- Candidate verification
- Internship management
- Internship creation and closure
- Application monitoring
- Eligibility validation
- Skill-based matching
- Match-score evaluation
- Seat availability validation
- Internship allocation processing
- Application status management
- Allocation result monitoring

---

## 🔄 InternSetu System Flow

```text
┌──────────────────────┐
│ Candidate Registration│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Candidate Profile  │
│  Skills & Academics  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Candidate Verification│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Browse Internships   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Apply for Internship │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Eligibility Check   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Skill Matching    │
│    & Match Score     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Admin Review       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Allocation Processing│
└──────────┬───────────┘
           │
      ┌────┴─────┐
      │          │
      ▼          ▼
┌──────────┐  ┌──────────────┐
│Allocated │  │Not Allocated │
└────┬─────┘  └──────────────┘
     │
     ▼
┌──────────────────────┐
│  Allocation Result   │
└──────────────────────┘
