const jwt  = require("jsonwebtoken");
const User = require("../models/User");

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(422).json({ error: "name, email, and password are required" });

    if (password.length < 6)
      return res.status(422).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(422).json({ error: "email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile" });
  }
};
