import Link from "next/link";
import { FiSearch, FiHeart, FiUsers } from "react-icons/fi";

export default function Home() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16 text-center">
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-500 to-purple-400 bg-clip-text text-transparent">
        Bookshelf
      </h1>
      <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto">
        Search for books, save your favorites, and see what others are reading.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <Link
          href="/search"
          className="flex flex-col items-center gap-3 p-6 bg-[#1a1a24] border border-white/10 rounded-xl hover:border-indigo-500 transition-colors"
        >
          <FiSearch size={32} className="text-indigo-400" />
          <span className="font-semibold">Search Books</span>
          <span className="text-xs text-gray-400">Find your next read</span>
        </Link>

        <Link
          href="/favorites"
          className="flex flex-col items-center gap-3 p-6 bg-[#1a1a24] border border-white/10 rounded-xl hover:border-indigo-500 transition-colors"
        >
          <FiHeart size={32} className="text-red-400" />
          <span className="font-semibold">Favorites</span>
          <span className="text-xs text-gray-400">Your saved books</span>
        </Link>

        <Link
          href="/feed"
          className="flex flex-col items-center gap-3 p-6 bg-[#1a1a24] border border-white/10 rounded-xl hover:border-indigo-500 transition-colors"
        >
          <FiUsers size={32} className="text-emerald-400" />
          <span className="font-semibold">Community</span>
          <span className="text-xs text-gray-400">See what others read</span>
        </Link>
      </div>
    </div>
  );
}
