"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { getFavorites, removeFavorite } from "@/lib/api";
import BookCard from "@/components/BookCard";

export default function FavoritesPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const supabase = useMemo(
    () => (user ? createClerkSupabaseClient(getToken) : null),
    [user, getToken]
  );

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && supabase) {
      getFavorites(supabase, user.id)
        .then(setFavorites)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, supabase]);

  async function handleRemove(book) {
    await removeFavorite(supabase, user.id, book.book_key);
    setFavorites((prev) => prev.filter((f) => f.book_key !== book.book_key));
  }

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <p className="text-center text-gray-400 py-12">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-1">Your Favorites</h1>
      <p className="text-gray-400 mb-6">
        {favorites.length} saved book{favorites.length !== 1 ? "s" : ""}
      </p>

      {favorites.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No favorites yet. Search for books and hit the heart!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((fav) => (
            <BookCard
              key={fav.id}
              book={fav}
              isFavorite={true}
              onToggleFavorite={handleRemove}
              showActions={true}
              onMarkReading={null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
