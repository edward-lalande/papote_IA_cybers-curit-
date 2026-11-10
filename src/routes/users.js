const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../db");
const config = require("../config");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ dest: config.uploadsDir });
const PUBLIC_FIELDS = "id, username, display_name, email, bio, role, avatar_file, voice_file";

router.get("/", (req, res) => {
  res.json(db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users`).all());
});

router.get("/:id", (req, res) => {
  const user = db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`).get(req.params.id);
  if (!user) return res.status(404).json({ error: "Profil introuvable." });
  res.json(user);
});

router.put("/:id", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "Profil introuvable." });

  for (const field of ["display_name", "bio", "email", "role"]) {
    if (req.body[field] !== undefined) {
      db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(req.body[field], req.params.id);
    }
  }
  res.json(db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`).get(req.params.id));
});

// Enregistre le fichier recu (photo ou voix) et le rattache au profil vise.
function saveUpload(column) {
  return (req, res) => {
    const targetId = req.params.id;
    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(targetId);
    if (!user) return res.status(404).json({ error: "Profil introuvable." });
    if (!req.file) return res.status(400).json({ error: "Aucun fichier recu." });

    const finalName = `user-${targetId}-${Date.now()}${path.extname(req.file.originalname)}`;
    fs.renameSync(req.file.path, path.join(config.uploadsDir, finalName));
    db.prepare(`UPDATE users SET ${column} = ? WHERE id = ?`).run(finalName, targetId);

    res.json({ ok: true, file: finalName });
  };
}

router.post("/:id/avatar", requireAuth, upload.single("avatar"), saveUpload("avatar_file"));
router.post("/:id/voice", requireAuth, upload.single("voice"), saveUpload("voice_file"));

module.exports = router;
