import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
    setShowMenu(false);
  };

  return (
    <nav className="w-full bg-black/80 backdrop-blur-lg border-b border-yellow-500/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">R</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Resume AI
            </h1>
            <p className="text-xs text-yellow-500/60">Professional Analysis</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 items-center">
          <Link
            to="/dashboard"
            className="text-gray-300 hover:text-yellow-400 font-medium transition relative group"
          >
            Analyzer
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            to="/history"
            className="text-gray-300 hover:text-yellow-400 font-medium transition relative group"
          >
            History
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold hover:shadow-lg hover:shadow-yellow-500/50 transition cursor-pointer"
            title={user ? user.name || user.email : "Account"}
          >
            {user ? user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() : "A"}
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-black/60 backdrop-blur-xl rounded-xl shadow-2xl border border-yellow-500/30 z-50">
              {user ? (
                <>
                  <div className="px-5 py-4 border-b border-yellow-500/20">
                    <p className="text-sm font-semibold text-yellow-400">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <div className="p-3 space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 rounded-lg transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 rounded-lg transition"
                    >
                      History
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 border-t border-yellow-500/20 rounded-b-lg transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="p-4 space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setShowMenu(false)}
                      className="block w-full px-4 py-2 text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-500 rounded-lg text-center transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setShowMenu(false)}
                      className="block w-full px-4 py-2 text-sm font-semibold text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/10 rounded-lg text-center transition"
                    >
                      Create Account
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
