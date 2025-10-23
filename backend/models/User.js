const db = require("../config/db");

exports.createUser = (
  username,
  name,
  email,
  hashedPassword,
  role = "user",
  phone = null,
  agent_code = null,
  is_active = 1,
  cb
) => {
  const sql = `
    INSERT INTO users (username, name, email, password, role, phone, agent_code, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  db.query(sql, [username, name, email, hashedPassword, role, phone, agent_code, is_active], cb);
};


exports.findUserByEmail = (email, cb) => {
  const sql = "SELECT id, username, email, password, role FROM users WHERE email = ?";
  db.query(sql, [email], cb);
};

exports.findUserById = (id, cb) => {
  const sql = "SELECT id, username, email, role FROM users WHERE id = ?";
  db.query(sql, [id], cb);
};

