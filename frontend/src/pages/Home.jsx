import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <nav className="navbar">
        <h2>InternSetu</h2>
        <span>Connecting Skills with Opportunities</span>
      </nav>

      <main className="hero">
        <p className="label">CANDIDATE PORTAL</p>

        <h1>Find internships that match your skills.</h1>

        <p className="hero-text">
          Create your profile, complete verification and discover
          internship opportunities based on your eligibility and skills.
        </p>

        <button onClick={() => navigate("/candidate/profile")}>
          Create Candidate Profile
        </button>
      </main>

      <section className="steps">
        <div>
          <strong>01</strong>
          <h3>Build Profile</h3>
          <p>Add your education and skills.</p>
        </div>

        <div>
          <strong>02</strong>
          <h3>Verify</h3>
          <p>Complete candidate verification.</p>
        </div>

        <div>
          <strong>03</strong>
          <h3>Get Matched</h3>
          <p>Find opportunities that fit your profile.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;