const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Reserve a l'administrateur." });
  next();
});

router.get("/users", (req, res) => {
  res.json(db.prepare("SELECT * FROM users").all());
});

router.put("/users/:id", (req, res) => {
  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "Profil introuvable." });

  try {
    for (const field of ["username", "password", "display_name", "email", "role", "bio"]) {
      if (req.body[field] !== undefined) {
        db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(req.body[field], req.params.id);
      }
    }
  } catch (e) {
    return res.status(409).json({ error: "Cet identifiant est deja pris." });
  }
  res.json({ ok: true });
});

module.exports = router;
