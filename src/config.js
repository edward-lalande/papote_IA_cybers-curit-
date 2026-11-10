module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: "papote2024",
  dbPath: process.env.DB_PATH || "/app/data/papote.db",
  uploadsDir: process.env.UPLOADS_DIR || "/app/uploads"
};
