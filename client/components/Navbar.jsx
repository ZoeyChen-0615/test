"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { FiSearch, FiHeart, FiUsers, FiBookOpen } from "react-icons/fi";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "text-indigo-400 bg-indigo-500/10"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="flex items-center justify-between px-6 h-16 border-b border-white/10 bg-[#1a1a24] sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-indigo-400">
        <FiBookOpen size={24} />
        <span>Bookshelf</span>
      </Link>

      <div className="flex gap-1">
        <Link href="/" className={linkClass("/")}>
          <FiSearch size={18} /> Search
        </Link>
        {isSignedIn && (
          <Link href="/favorites" className={linkClass("/favorites")}>
            <FiHeart size={18} /> Favorites
          </Link>
        )}
        <Link href="/feed" className={linkClass("/feed")}>
          <FiUsers size={18} /> Community
        </Link>
      </div>

      <div className="flex items-center">
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
