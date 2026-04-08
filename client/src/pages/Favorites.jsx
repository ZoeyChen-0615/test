import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { getFavorites, removeFavorite } from "../api";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";

export default function Favorites() {
  const { user } = useUser();
  const { supabase } = useAuth();
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

  if (loading) return <div className="page"><p className="loading">Loading...</p></div>;

  return (
    <div className="page">
      <h1>Your Favorites</h1>
      <p className="subtitle">{favorites.length} saved book{favorites.length !== 1 ? "s" : ""}</p>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>No favorites yet. Search for books and hit the heart!</p>
        </div>
      ) : (
        <div className="book-grid">
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
