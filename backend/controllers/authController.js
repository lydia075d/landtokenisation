const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

exports.register = (req, res) => {
  const { username, name, email, password, phone, agent_code } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json({ msg: "username, name, email and password required" });
  }

  findUserByEmail(email, (err, results) => {
    if (err) {
      console.error("DB error checking user:", err);
      return res.status(500).json({ msg: "Database error" });
    }
    if (results && results.length > 0) {
      return res.status(409).json({ msg: "Email already registered" });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error("Hash error:", err);
        return res.status(500).json({ msg: "Hashing failed" });
      }

      createUser(
        username,
        name,
        email,
        hash,
        "user",
        phone || null,
        agent_code || null,
        1,
        (err, result) => {
          if (err) {
            console.error("DB insert error:", err);
            return res.status(500).json({ msg: "Registration failed" });
          }
          return res.status(201).json({ msg: "Registered successfully" });
        }
      );
    });
  });
};


exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: "email and password required" });

  findUserByEmail(email, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ msg: "Server error" });
    }
    if (!results || results.length === 0) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("bcrypt compare error:", err);
        return res.status(500).json({ msg: "Server error" });
      }
      if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        msg: "Logged in",
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
        token,
      });
    });
  });
};

exports.logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.json({ msg: "Logged out successfully" });
};