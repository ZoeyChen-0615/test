"use client";

import { FiHeart, FiBookOpen, FiCheck } from "react-icons/fi";

export default function BookCard({ book, isFavorite, onToggleFavorite, onMarkReading, showActions = true }) {
  const cover = book.cover_url || (book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` : null);

  return (
    <div className="flex gap-4 bg-[#1a1a24] border border-white/10 rounded-xl p-4 transition-all hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.1)]">
      <div className="w-20 h-[120px] flex-shrink-0 rounded-lg overflow-hidden">
        {cover ? (
          <img src={cover} alt={book.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500">
            <FiBookOpen size={32} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-400 mb-0.5">{book.author || "Unknown author"}</p>
        {book.first_publish_year && (
          <p className="text-xs text-gray-500">{book.first_publish_year}</p>
        )}
        {showActions && (
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            <button
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? "text-red-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => onToggleFavorite?.(book)}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FiHeart size={18} className={isFavorite ? "fill-current" : ""} />
            </button>
            {onMarkReading && (
              <>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                  onClick={() => onMarkReading(book, "reading")}
                >
                  <FiBookOpen size={14} /> Reading
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                  onClick={() => onMarkReading(book, "finished")}
                >
                  <FiCheck size={14} /> Finished
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
