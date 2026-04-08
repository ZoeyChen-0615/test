import { Link, useLocation } from "react-router-dom";
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import { FiSearch, FiHeart, FiUsers, FiBookOpen } from "react-icons/fi";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `nav-link ${pathname === path ? "active" : ""}`;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <FiBookOpen size={24} />
        <span>Bookshelf</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={linkClass("/")}>
          <FiSearch size={18} /> Search
        </Link>
        {isSignedIn && (
          <Link to="/favorites" className={linkClass("/favorites")}>
            <FiHeart size={18} /> Favorites
          </Link>
        )}
        <Link to="/feed" className={linkClass("/feed")}>
          <FiUsers size={18} /> Community
        </Link>
      </div>
      <div className="nav-right">
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-sm">Sign In</button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
