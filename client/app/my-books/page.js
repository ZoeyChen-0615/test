"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { getFavorites, removeFavorite } from "@/lib/api";
import { FiTrash2, FiBookOpen } from "react-icons/fi";

export default function MyBooksPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const supabase = useMemo(
    () => (user ? createClerkSupabaseClient(getToken) : null),
    [user, getToken]
  );

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && supabase) {
      getFavorites(supabase, user.id)
        .then(setBooks)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, supabase]);

  async function handleRemove(book) {
    await removeFavorite(supabase, user.id, book.ol_key);
    setBooks((prev) => prev.filter((b) => b.ol_key !== book.ol_key));
  }

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <p className="text-center text-gray-400 py-16">Loading your books...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-1">My Books</h1>
      <p className="text-gray-400 mb-8">
        {books.length} saved book{books.length !== 1 ? "s" : ""}
      </p>

      {books.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FiBookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No saved books yet.</p>
          <p className="text-sm mt-1">Go to Search and save some favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {books.map((book) => (
            <div key={book.id} className="group relative">
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a24] border border-white/10 transition-all group-hover:border-indigo-500 group-hover:-translate-y-1 group-hover:shadow-[0_12px_32px_rgba(99,102,241,0.15)]">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FiBookOpen size={28} />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm font-semibold line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-400 line-clamp-1">{book.author || "Unknown"}</p>
              </div>
              <button
                onClick={() => handleRemove(book)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                title="Remove from favorites"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
