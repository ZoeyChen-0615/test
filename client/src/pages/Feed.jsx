import { useState, useEffect } from "react";
import { getFeed } from "../api";
import { FiBookOpen, FiCheck, FiBookmark } from "react-icons/fi";

function coverUrl(coverId) {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`;
}

const statusConfig = {
  reading: { icon: FiBookOpen, label: "is reading", color: "#3b82f6" },
  finished: { icon: FiCheck, label: "finished", color: "#10b981" },
  want_to_read: { icon: FiBookmark, label: "wants to read", color: "#f59e0b" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeed()
      .then(setFeed)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="loading">Loading...</p></div>;

  return (
    <div className="page">
      <h1>Community Feed</h1>
      <p className="subtitle">See what others are reading</p>

      {feed.length === 0 ? (
        <div className="empty-state">
          <p>No activity yet. Be the first to share what you're reading!</p>
        </div>
      ) : (
        <div className="feed-list">
          {feed.map((item) => {
            const status = statusConfig[item.status] || statusConfig.reading;
            const StatusIcon = status.icon;
            const cover = coverUrl(item.cover_id);

            return (
              <div key={item.id} className="feed-item">
                <div className="avatar" style={{ background: item.avatar_color }}>
                  {item.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="feed-content">
                  <div className="feed-header">
                    <strong>{item.username || "Unknown"}</strong>
                    <span className="feed-status" style={{ color: status.color }}>
                      <StatusIcon size={14} /> {status.label}
                    </span>
                  </div>
                  <div className="feed-book">
                    {cover && <img src={cover} alt="" className="feed-cover" />}
                    <div>
                      <p className="feed-title">{item.title}</p>
                      {item.author && <p className="feed-author">by {item.author}</p>}
                    </div>
                  </div>
                  <time className="feed-time">{timeAgo(item.created_at)}</time>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
