import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CandidateProfile from "./pages/CandidateProfile";
import Verification from "./pages/Verification";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/candidate/profile"
          element={<CandidateProfile />}
        />
        <Route
          path="/candidate/verification"
          element={<Verification />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;