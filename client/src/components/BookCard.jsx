import { FiHeart, FiBookOpen, FiCheck } from "react-icons/fi";

function coverUrl(coverId, size = "M") {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export default function BookCard({ book, isFavorite, onToggleFavorite, onMarkReading, showActions = true }) {
  const cover = coverUrl(book.cover_id);

  return (
    <div className="book-card">
      <div className="book-cover">
        {cover ? (
          <img src={cover} alt={book.title} loading="lazy" />
        ) : (
          <div className="book-cover-placeholder">
            <FiBookOpen size={32} />
          </div>
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author || "Unknown author"}</p>
        {book.first_publish_year && (
          <p className="book-year">{book.first_publish_year}</p>
        )}
        {showActions && (
          <div className="book-actions">
            <button
              className={`btn-icon ${isFavorite ? "favorited" : ""}`}
              onClick={() => onToggleFavorite?.(book)}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FiHeart size={18} />
            </button>
            {onMarkReading && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => onMarkReading(book, "reading")}
              >
                <FiBookOpen size={14} /> Reading
              </button>
            )}
            {onMarkReading && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => onMarkReading(book, "finished")}
              >
                <FiCheck size={14} /> Finished
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
