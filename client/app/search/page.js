"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { searchBooks, getFavorites, addFavorite, removeFavorite, ensureProfile } from "@/lib/api";
import { FiSearch, FiHeart, FiBookOpen } from "react-icons/fi";

function BookResult({ book, isFavorite, onSave }) {
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await onSave(book);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden transition-all hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.1)]">
      <div className="w-full h-48 bg-white/5 flex items-center justify-center">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} loading="lazy" className="h-full object-contain" />
        ) : (
          <FiBookOpen size={40} className="text-gray-600" />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-400 mb-3">{book.author || "Unknown author"}</p>
        <button
          onClick={handleSave}
          disabled={isFavorite || saved}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isFavorite || saved
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-indigo-500 hover:bg-indigo-400 text-white"
          }`}
        >
          <FiHeart size={16} className={isFavorite || saved ? "fill-current" : ""} />
          {saved ? "Saved!" : isFavorite ? "Saved" : "Save to Favorites"}
        </button>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { user } = useUser();

  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user) {
      ensureProfile(supabase, user.id, user.username || user.firstName || "user");
      getFavorites(supabase, user.id).then(setFavorites).catch(() => {});
    }
  }, [user]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
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

  function isFavorite(book) {
    return favorites.some((f) => f.ol_key === book.ol_key);
  }

  async function handleSave(book) {
    if (!user) return alert("Sign in to save favorites!");
    await addFavorite(supabase, user.id, {
      ol_key: book.ol_key,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
    });
    setFavorites((prev) => [...prev, { ol_key: book.ol_key, title: book.title }]);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="text-center py-12 pb-8">
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-500 to-purple-400 bg-clip-text text-transparent">
          Search Books
        </h1>
        <p className="text-gray-400 mb-6 text-lg">Find books from Open Library and save your favorites</p>
        <form onSubmit={handleSearch} className="flex gap-3 max-w-[640px] mx-auto">
          <div className="flex-1 relative">
            <FiSearch size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or subject..."
              className="w-full py-3 px-4 pl-11 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {searched && (
        <p className="text-center text-gray-400 mb-6 text-sm">
          {total.toLocaleString()} results found
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {books.map((book) => (
          <BookResult
            key={book.ol_key}
            book={book}
            isFavorite={isFavorite(book)}
            onSave={handleSave}
          />
        ))}
      </div>

      {searched && books.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p>No books found. Try a different search!</p>
        </div>
      )}
    </div>
  );
}
