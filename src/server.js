const express = require("express");
const path = require("path");
const config = require("./config");
const db = require("./db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(express.json());
app.use("/avatars", express.static(config.uploadsDir));
app.use("/avatars", express.static(path.join(__dirname, "..", "seed-avatars")));
app.use("/voices", express.static(config.uploadsDir));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

// Outil de debug pendant le developpement
app.get("/api/debug/users", (req, res) => {
  res.json(db.prepare("SELECT * FROM users").all());
});

app.listen(config.port, () => {
  console.log(`Papote backend sur le port ${config.port}`);
});
