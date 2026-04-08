"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { searchBooks, getFavorites, addFavorite, removeFavorite, addActivity, ensureProfile } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { FiSearch } from "react-icons/fi";

export default function SearchPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const supabase = useMemo(
    () => (user ? createClerkSupabaseClient(getToken) : null),
    [user, getToken]
  );

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
      setFavorites((prev) => [...prev, { book_key: book.key, title: book.title }]);
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
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="text-center py-12 pb-8">
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-500 to-purple-400 bg-clip-text text-transparent">
          Discover your next great read
        </h1>
        <p className="text-gray-400 mb-6 text-lg">Search millions of books from Open Library</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="flex justify-center py-8">
          <button
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 disabled:opacity-50 transition-colors"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {searched && books.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p>No books found. Try a different search!</p>
        </div>
      )}
    </div>
  );
}
