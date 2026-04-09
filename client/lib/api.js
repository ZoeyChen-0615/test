import { supabase as publicSupabase } from "./supabase";

// ─── Book Search (Open Library) ─────────────────

function coverUrl(coverId, size = "M") {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function searchBooks(query, page = 1) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=12`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    total: data.numFound,
    books: (data.docs || []).map((d) => ({
      ol_key: d.key,
      title: d.title,
      author: d.author_name?.[0] || "Unknown",
      cover_url: coverUrl(d.cover_i),
      cover_id: d.cover_i || null,
      first_publish_year: d.first_publish_year || null,
    })),
  };
}

// ─── Profiles ───────────────────────────────────

export async function ensureProfile(supabase, userId, username) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) return data;

  const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
  const avatar_color = colors[Math.floor(Math.random() * colors.length)];

  const { data: newProfile } = await supabase
    .from("profiles")
    .insert({ id: userId, username, avatar_color })
    .select()
    .single();

  return newProfile;
}

// ─── Favorites ──────────────────────────────────

export async function getFavorites(supabase, userId) {
  const { data } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function addFavorite(supabase, userId, book) {
  // First ensure profile exists
  await ensureProfile(supabase, userId, "user");

  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    ol_key: book.ol_key,
    title: book.title,
    author: book.author || null,
    cover_url: book.cover_url || null,
  });

  if (error) {
    console.error("Failed to save favorite:", error);
  } else {
    await supabase.from("reading_activity").insert({
      user_id: userId,
      book_key: book.ol_key,
      title: book.title,
      author: book.author || null,
      cover_id: book.cover_id || null,
      status: "want_to_read",
    });
  }

  return { error: error?.message };
}

export async function removeFavorite(supabase, userId, olKey) {
  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("ol_key", olKey);
}

// ─── Reading Activity / Feed ────────────────────

export async function addActivity(supabase, userId, book) {
  await supabase.from("reading_activity").insert({
    user_id: userId,
    book_key: book.ol_key,
    title: book.title,
    author: book.author || null,
    cover_id: book.cover_id || null,
    status: book.status || "reading",
  });
}

export async function getFeed() {
  const { data } = await publicSupabase
    .from("reading_activity")
    .select("*, profiles(username, avatar_color)")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data || []).map((item) => ({
    ...item,
    username: item.profiles?.username,
    avatar_color: item.profiles?.avatar_color,
  }));
}
