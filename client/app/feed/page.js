"use client";

import { useState, useEffect } from "react";
import { getFeed } from "@/lib/api";
import { FiBookOpen, FiCheck, FiBookmark } from "react-icons/fi";

const statusConfig = {
  reading: { icon: FiBookOpen, label: "is reading", color: "text-blue-500" },
  finished: { icon: FiCheck, label: "finished", color: "text-emerald-500" },
  want_to_read: { icon: FiBookmark, label: "wants to read", color: "text-amber-500" },
};

function coverUrl(coverId) {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`;
}

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

export default function FeedPage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeed()
      .then(setFeed)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <p className="text-center text-gray-400 py-12">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-1">Community Feed</h1>
      <p className="text-gray-400 mb-6">See what others are reading</p>

      {feed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No activity yet. Be the first to share what you&apos;re reading!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((item) => {
            const status = statusConfig[item.status] || statusConfig.reading;
            const StatusIcon = status.icon;
            const cover = coverUrl(item.cover_id);

            return (
              <div
                key={item.id}
                className="flex gap-3.5 p-4 bg-[#1a1a24] border border-white/10 rounded-xl hover:border-indigo-500 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: item.avatar_color || "#6366f1" }}
                >
                  {item.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <strong className="text-sm">{item.username || "Unknown"}</strong>
                    <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                      <StatusIcon size={14} /> {status.label}
                    </span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    {cover && (
                      <img src={cover} alt="" className="w-9 h-13 rounded object-cover" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.author && (
                        <p className="text-xs text-gray-400">by {item.author}</p>
                      )}
                    </div>
                  </div>
                  <time className="block text-xs text-gray-500 mt-2">
                    {timeAgo(item.created_at)}
                  </time>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
