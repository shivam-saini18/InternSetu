# InternSetu API Contract

## Base URL

http://localhost:8000

## API Prefix

/api

---

## Health Check

GET /api/health

Response:

{
  "status": "ok"
}

---

## Candidate Profile

POST /api/profile

Request:

{
  "name": "",
  "email": "",
  "education": "",
  "skills": []
}

Response:

{
  "student_id": "",
  "message": ""
}

---

## Get Candidate Profile

GET /api/profile/{student_id}

---

## Verification

POST /api/verify

Request:

{
  "student_id": "",
  "document_type": "",
  "document_number": ""
}

---

## Verification Status

GET /api/verification/{student_id}

---

## Create Internship

POST /api/internships

Request:

{
  "title": "",
  "description": "",
  "required_skills": [],
  "eligibility": {},
  "seats": 0,
  "location": ""
}

---

## Get Internships

GET /api/internships

---

## Matching

POST /api/match

Request:

{
  "student_id": "",
  "internship_id": ""
}

---

## Allocation

POST /api/allocate

Request:

{
  "policy": {}
}

---

## Allocation Result

GET /api/allocation/{student_id}

---

## Skill Gap

GET /api/skill-gap/{student_id}

---

## Readiness Simulation

POST /api/simulate-readiness

---

## Policy Simulation

POST /api/simulate-policy

---

## Admin Analytics

GET /api/admin/analytics

---

## Allocation Audit

GET /api/admin/audit/{student_id}