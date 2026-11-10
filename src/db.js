const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const config = require("./config");

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
const db = new Database(config.dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    bio TEXT NOT NULL DEFAULT '',
    avatar_file TEXT NOT NULL DEFAULT 'default.svg',
    voice_file TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seed() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO users (username, password, display_name, email, role, bio, avatar_file)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    "edward",
    "Epitech2027!",
    "Edward Lalande",
    "edward.lalande@epitech.eu",
    "member",
    "Organisateur de l'atelier. Developpeur fullstack.",
    "edward.svg"
  );
  insert.run(
    "sophie",
    "Quartier75!",
    "Sophie Martin",
    "sophie.martin@papote.test",
    "member",
    "Maman de deux enfants, dispo pour covoiturage le mercredi.",
    "sophie.svg"
  );
  insert.run(
    "karim",
    "Voisinage2024",
    "Karim Benali",
    "karim.benali@papote.test",
    "member",
    "Le meilleur papa du monde.",
    "karim.svg"
  );
  insert.run(
    "admin",
    "Moderation#2026",
    "Moderation Papote",
    "moderation@papote.test",
    "admin",
    "Compte de moderation du quartier.",
    "default.svg"
  );

  const post = db.prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
  post.run(4, "Bienvenue sur Papote ! Soyez bienveillants, les messages sont moderes.");
  post.run(3, "Perceuse dispo ce week-end, passez sonner au 12 :)");
  post.run(2, "Quelqu'un pour un covoiturage mercredi vers le conservatoire ?");
  post.run(1, "Pensez a completer votre profil et a enregistrer une petite presentation vocale pour vos voisins !");
}

seed();

module.exports = db;
