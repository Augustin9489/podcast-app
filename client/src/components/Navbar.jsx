// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/Auth";
import { HomeIcon, MusicalNoteIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      nav("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-7 w-7 text-yellow-300"
          >
            <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2z" />
          </svg>
          <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-200 bg-clip-text text-transparent font-extrabold text-xl tracking-wide">
            PodCastify
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-5 text-white font-medium">
          <Link to="/" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
            <HomeIcon className="h-5 w-5" />
            Home
          </Link>
          <Link to="/library" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
            <MusicalNoteIcon className="h-5 w-5" />
            Library
          </Link>

          {user && (
            <Link to="/upload" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
              <CloudArrowUpIcon className="h-5 w-5" />
              Upload
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors"
              >
                Sign out
              </button>
              <div className="px-3 py-1 bg-yellow-400 text-purple-900 font-semibold rounded-full shadow-md">
                {user.displayName || user.email}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-semibold rounded-md shadow-md transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
