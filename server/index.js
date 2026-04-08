const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");
const { generateToken, authMiddleware } = require("./auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Auth Routes ────────────────────────────────────────────

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
  const avatar_color = colors[Math.floor(Math.random() * colors.length)];

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare("INSERT INTO users (username, password, avatar_color) VALUES (?, ?, ?)")
      .run(username.trim(), hash, avatar_color);
    const user = { id: result.lastInsertRowid, username: username.trim(), avatar_color };
    res.json({ token: generateToken(user), user });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username?.trim());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const { password: _, ...safe } = user;
  res.json({ token: generateToken(safe), user: safe });
});

app.get("/api/me", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT id, username, avatar_color, created_at FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

// ─── Book Search (proxies Open Library) ─────────────────────

app.get("/api/search", async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&page=${page}&limit=20`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({
      total: data.numFound,
      books: (data.docs || []).map((d) => ({
        key: d.key,
        title: d.title,
        author: d.author_name?.[0] || "Unknown",
        cover_id: d.cover_i || null,
        first_publish_year: d.first_publish_year || null,
        subjects: (d.subject || []).slice(0, 5),
      })),
    });
  } catch {
    res.status(502).json({ error: "Failed to search books" });
  }
});

// ─── Favorites ──────────────────────────────────────────────

app.get("/api/favorites", authMiddleware, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC")
    .all(req.user.id);
  res.json(rows);
});

app.post("/api/favorites", authMiddleware, (req, res) => {
  const { book_key, title, author, cover_id, first_publish_year } = req.body;
  if (!book_key || !title) {
    return res.status(400).json({ error: "book_key and title required" });
  }
  try {
    db.prepare(
      "INSERT INTO favorites (user_id, book_key, title, author, cover_id, first_publish_year) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(req.user.id, book_key, title, author || null, cover_id || null, first_publish_year || null);

    // Also add to activity feed
    db.prepare(
      "INSERT INTO reading_activity (user_id, book_key, title, author, cover_id, status) VALUES (?, ?, ?, ?, ?, 'want_to_read')"
    ).run(req.user.id, book_key, title, author || null, cover_id || null);

    res.json({ success: true });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Already in favorites" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/favorites/:bookKey", authMiddleware, (req, res) => {
  const bookKey = decodeURIComponent(req.params.bookKey);
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND book_key = ?").run(req.user.id, bookKey);
  res.json({ success: true });
});

// ─── Reading Activity / Social Feed ─────────────────────────

app.post("/api/activity", authMiddleware, (req, res) => {
  const { book_key, title, author, cover_id, status } = req.body;
  if (!book_key || !title) {
    return res.status(400).json({ error: "book_key and title required" });
  }
  db.prepare(
    "INSERT INTO reading_activity (user_id, book_key, title, author, cover_id, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(req.user.id, book_key, title, author || null, cover_id || null, status || "reading");
  res.json({ success: true });
});

app.get("/api/feed", (req, res) => {
  const rows = db
    .prepare(
      `SELECT ra.*, u.username, u.avatar_color
       FROM reading_activity ra
       JOIN users u ON u.id = ra.user_id
       ORDER BY ra.created_at DESC
       LIMIT 50`
    )
    .all();
  res.json(rows);
});

// ─── Start ──────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Bookshelf API running on http://localhost:${PORT}`);
});
