"use client";

import { useState, useEffect } from "react";
import { getFeed } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { FiBookOpen } from "react-icons/fi";

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllFavorites() {
      const { data } = await supabase
        .from("favorites")
        .select("*, profiles(username, avatar_color)")
        .order("created_at", { ascending: false });
      setBooks(data || []);
      setLoading(false);
    }
    loadAllFavorites();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <p className="text-center text-gray-400 py-16">Loading the class bookshelf...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          The Class Bookshelf
        </h1>
        <p className="text-gray-400 text-lg">
          {books.length} book{books.length !== 1 ? "s" : ""} saved by the community
        </p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FiBookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">The bookshelf is empty.</p>
          <p className="text-sm mt-1">Search for books and save your favorites to fill it up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
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
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-xs font-semibold line-clamp-2">{book.title}</p>
                <p className="text-gray-300 text-[10px] mt-0.5">{book.author}</p>
                {book.profiles?.username && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ background: book.profiles?.avatar_color || "#6366f1" }}
                    >
                      {book.profiles.username[0].toUpperCase()}
                    </div>
                    <span className="text-gray-400 text-[10px]">{book.profiles.username}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
