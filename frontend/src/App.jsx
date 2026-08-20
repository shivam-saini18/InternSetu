import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CandidateProfile from "./pages/CandidateProfile";
import Verification from "./pages/Verification";
import CandidateDashboard from "./pages/CandidateDashboard";
import Internships from "./pages/Internships.jsx";
import InternshipDetails from "./pages/InternshipDetails";
import AllocationResult from "./pages/AllocationResult";
import SkillGap from "./pages/SkillGap";
import AdminLogin from "./pages/AdminLogin";

import AdminDashboard from "./admin/AdminDashboard.jsx";
import CandidateVerification from "./admin/CandidateVerification.jsx";
import InternshipManagement from "./admin/InternshipManagement.jsx";
import Applications from "./admin/Applications.jsx";
import AllocationManagement from "./admin/AllocationManagement.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC
        ===================================================== */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* =====================================================
            CANDIDATE
        ===================================================== */}

        {/* Candidate profile / registration */}
        <Route
          path="/candidate/profile"
          element={<CandidateProfile />}
        />

        {/* Candidate verification */}
        <Route
          path="/candidate/verification"
          element={<Verification />}
        />

        {/* Candidate dashboard - existing route */}
        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />

        {/* Candidate dashboard - candidate-specific route
            FIX: supports URLs such as:
            /candidate/dashboard/25
            /candidate/dashboard/26
            etc.
        */}
        <Route
          path="/candidate/dashboard/:candidateId"
          element={<CandidateDashboard />}
        />

        {/* Internship listing */}
        <Route
          path="/candidate/internships"
          element={<Internships />}
        />

        {/* Internship details */}
        <Route
          path="/candidate/internship/:id"
          element={<InternshipDetails />}
        />

        {/* Allocation result */}
        <Route
          path="/candidate/allocation"
          element={<AllocationResult />}
        />

        {/* Skill gap */}
        <Route
          path="/candidate/skill-gap"
          element={<SkillGap />}
        />

        {/* =====================================================
            ADMIN AUTHENTICATION
        ===================================================== */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =====================================================
            ADMINISTRATION
        ===================================================== */}

        {/* Admin dashboard */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Candidate verification */}
        <Route
          path="/admin/candidate-verification"
          element={<CandidateVerification />}
        />

        {/* Internship management */}
        <Route
          path="/admin/internships"
          element={<InternshipManagement />}
        />

        {/* Applications */}
        <Route
          path="/admin/applications"
          element={<Applications />}
        />

        {/* Allocation management */}
        <Route
          path="/admin/allocation"
          element={<AllocationManagement />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;