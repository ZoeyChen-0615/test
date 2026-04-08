import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { searchBooks, getFavorites, addFavorite, removeFavorite, addActivity, ensureProfile } from "../api";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import { FiSearch } from "react-icons/fi";

export default function Search() {
  const { user } = useUser();
  const { supabase } = useAuth();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user && supabase) {
      ensureProfile(supabase, user.id, user.username || user.firstName || "user");
      getFavorites(supabase, user.id).then(setFavorites).catch(() => {});
    }
  }, [user, supabase]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setPage(1);
    try {
      const data = await searchBooks(query, 1);
      setBooks(data.books || []);
      setTotal(data.total || 0);
      setSearched(true);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    const next = page + 1;
    setLoading(true);
    try {
      const data = await searchBooks(query, next);
      setBooks((prev) => [...prev, ...(data.books || [])]);
      setPage(next);
    } finally {
      setLoading(false);
    }
  }

  function isFavorite(book) {
    return favorites.some((f) => f.book_key === book.key);
  }

  async function toggleFavorite(book) {
    if (!user || !supabase) return alert("Sign in to save favorites!");
    if (isFavorite(book)) {
      await removeFavorite(supabase, user.id, book.key);
      setFavorites((prev) => prev.filter((f) => f.book_key !== book.key));
    } else {
      await addFavorite(supabase, user.id, {
        book_key: book.key,
        title: book.title,
        author: book.author,
        cover_id: book.cover_id,
        first_publish_year: book.first_publish_year,
      });
      setFavorites((prev) => [
        ...prev,
        { book_key: book.key, title: book.title },
      ]);
    }
  }

  async function markReading(book, status) {
    if (!user || !supabase) return alert("Sign in to track reading!");
    await addActivity(supabase, user.id, {
      book_key: book.key,
      title: book.title,
      author: book.author,
      cover_id: book.cover_id,
      status,
    });
  }

  return (
    <div className="page">
      <div className="search-hero">
        <h1>Discover your next great read</h1>
        <p>Search millions of books from Open Library</p>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrap">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or subject..."
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {searched && (
        <p className="search-count">
          {total.toLocaleString()} results found
        </p>
      )}

      <div className="book-grid">
        {books.map((book) => (
          <BookCard
            key={book.key}
            book={book}
            isFavorite={isFavorite(book)}
            onToggleFavorite={toggleFavorite}
            onMarkReading={markReading}
          />
        ))}
      </div>

      {books.length > 0 && books.length < total && (
        <div className="load-more">
          <button className="btn btn-secondary" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {searched && books.length === 0 && !loading && (
        <div className="empty-state">
          <p>No books found. Try a different search!</p>
        </div>
      )}
    </div>
  );
}
