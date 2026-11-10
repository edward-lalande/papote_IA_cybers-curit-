const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const posts = db.prepare(`
    SELECT p.id, p.content, p.created_at, u.id AS user_id, u.username, u.display_name, u.avatar_file
    FROM posts p JOIN users u ON u.id = p.user_id
    ORDER BY p.id DESC
  `).all();
  res.json(posts);
});

router.post("/", requireAuth, (req, res) => {
  const content = (req.body.content || "").trim();
  if (!content) return res.status(400).json({ error: "Le message est vide." });

  const authorId = req.body.authorId || req.user.id;
  db.prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)").run(authorId, content);
  res.status(201).json({ ok: true });
});

module.exports = router;
