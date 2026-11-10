const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const config = require("../config");

const router = express.Router();

function sessionFor(user) {
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: "6h" }
  );
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      avatarFile: user.avatar_file
    }
  };
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Identifiant et mot de passe requis." });
  }

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = db.prepare(query).get();

  if (!user) return res.status(401).json({ error: "Identifiant ou mot de passe incorrect." });
  res.json(sessionFor(user));
});

router.post("/register", (req, res) => {
  const { username, password, displayName, email, role } = req.body;
  if (!username || !password || !displayName) {
    return res.status(400).json({ error: "Nom, identifiant et mot de passe requis." });
  }

  try {
    const info = db
      .prepare("INSERT INTO users (username, password, display_name, email, role) VALUES (?, ?, ?, ?, ?)")
      .run(username, password, displayName, email || "", role || "member");
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(sessionFor(user));
  } catch (e) {
    res.status(409).json({ error: "Cet identifiant est deja pris." });
  }
});

module.exports = router;
