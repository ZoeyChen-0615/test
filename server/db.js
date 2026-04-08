const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "bookshelf.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_key TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    cover_id INTEGER,
    first_publish_year INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, book_key)
  );

  CREATE TABLE IF NOT EXISTS reading_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_key TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    cover_id INTEGER,
    status TEXT CHECK(status IN ('reading', 'finished', 'want_to_read')) DEFAULT 'reading',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

module.exports = db;
