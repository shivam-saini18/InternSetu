const { registerCandidate, login } = require("../services/authService");

const register = async (req, res) => {
  try {
    const result = await registerCandidate(req.body);

    res.status(201).json({
      success: true,
      message: "Candidate registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

module.exports = {
  register,
  loginUser,
};