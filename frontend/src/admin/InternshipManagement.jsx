import { useState } from "react";

function InternshipManagement() {
  const [internships, setInternships] = useState([
    {
      id: 1,
      title: "Software Developer Intern",
      company: "Tech Solutions",
      skills: "Java, SQL, Git",
      seats: 10,
      status: "Active",
    },
    {
      id: 2,
      title: "Data Analyst Intern",
      company: "DataWorks",
      skills: "Python, SQL, Excel",
      seats: 8,
      status: "Active",
    },
    {
      id: 3,
      title: "Web Development Intern",
      company: "Digital Labs",
      skills: "HTML, CSS, JavaScript",
      seats: 6,
      status: "Active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newInternship, setNewInternship] = useState({
    title: "",
    company: "",
    skills: "",
    seats: "",
  });

  const closeInternship = (id) => {
    setInternships(
      internships.map((internship) =>
        internship.id === id
          ? { ...internship, status: "Closed" }
          : internship
      )
    );
  };

  const handleChange = (e) => {
    setNewInternship({
      ...newInternship,
      [e.target.name]: e.target.value,
    });
  };

  const addInternship = (e) => {
    e.preventDefault();

    if (
      !newInternship.title ||
      !newInternship.company ||
      !newInternship.skills ||
      !newInternship.seats
    ) {
      return;
    }

    const internship = {
      id: Date.now(),
      title: newInternship.title,
      company: newInternship.company,
      skills: newInternship.skills,
      seats: Number(newInternship.seats),
      status: "Active",
    };

    setInternships([...internships, internship]);

    setNewInternship({
      title: "",
      company: "",
      skills: "",
      seats: "",
    });

    setShowForm(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>Internship Management</h1>
          <p>Manage available internship opportunities.</p>
        </div>

        <button
          style={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          + Add Internship
        </button>
      </div>

      {showForm && (
        <form onSubmit={addInternship} style={styles.form}>
          <h2>Add New Internship</h2>

          <input
            name="title"
            placeholder="Internship Title"
            value={newInternship.title}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="company"
            placeholder="Company / Organization"
            value={newInternship.company}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="skills"
            placeholder="Required Skills e.g. Java, SQL, Git"
            value={newInternship.skills}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="seats"
            type="number"
            min="1"
            placeholder="Available Seats"
            value={newInternship.seats}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={styles.formButtons}>
            <button type="submit" style={styles.saveButton}>
              Add Internship
            </button>

            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={styles.list}>
        {internships.map((internship) => (
          <div style={styles.card} key={internship.id}>
            <div>
              <h2>{internship.title}</h2>

              <p>
                <strong>Company:</strong> {internship.company}
              </p>

              <p>
                <strong>Required Skills:</strong> {internship.skills}
              </p>

              <p>
                <strong>Available Seats:</strong> {internship.seats}
              </p>

              <span
                style={
                  internship.status === "Active"
                    ? styles.active
                    : styles.closed
                }
              >
                {internship.status}
              </span>
            </div>

            {internship.status === "Active" && (
              <button
                style={styles.closeButton}
                onClick={() => closeInternship(internship.id)}
              >
                Close Internship
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  addButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#1d4ed8",
    color: "white",
    cursor: "pointer",
  },

  form: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    maxWidth: "600px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginTop: "12px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    fontSize: "14px",
  },

  formButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },

  saveButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#198754",
    color: "white",
    cursor: "pointer",
  },

  cancelButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#6c757d",
    color: "white",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  card: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  active: {
    display: "inline-block",
    marginTop: "8px",
    padding: "5px 10px",
    borderRadius: "15px",
    background: "#d1e7dd",
    color: "#0f5132",
    fontSize: "13px",
    fontWeight: "bold",
  },

  closed: {
    display: "inline-block",
    marginTop: "8px",
    padding: "5px 10px",
    borderRadius: "15px",
    background: "#f8d7da",
    color: "#842029",
    fontSize: "13px",
    fontWeight: "bold",
  },

  closeButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "7px",
    background: "#dc3545",
    color: "white",
    cursor: "pointer",
  },
};

export default InternshipManagement;