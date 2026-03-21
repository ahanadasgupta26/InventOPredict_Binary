import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Analysis", path: "/analysis" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contactus" },
  { name: "Feedback", path: "/feedback" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  // ✅ CLICK OUTSIDE CLOSE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-md border-b border-yellow-400/20 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="h-11 w-11 rounded-full"
          />
          <h1 className="text-2xl font-bold tracking-wide">
            <span className="text-white transition duration-300 group-hover:text-yellow-400">
              Invent
            </span>
            <span className="text-yellow-400 transition duration-300 group-hover:text-white">
              OPredict
            </span>
          </h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium text-gray-300">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="relative group hover:text-yellow-400 transition duration-300"
            >
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#facc15]"></span>
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:block relative" ref={dropdownRef}>
          {!user ? (
            <Link to="/login">
              <button className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition shadow-md">
                Login
              </button>
            </Link>
          ) : (
            <>
              {/* AVATAR BUTTON */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 
        flex items-center justify-center text-black font-bold shadow-md
        hover:scale-105 hover:shadow-[0_0_12px_#facc15] transition"
              >
                {user.company_name?.charAt(0).toUpperCase() || "U"}
              </button>

              {/* PREMIUM FLOATING DROPDOWN */}
              <div
                className={`absolute right-0 mt-4 transition-all duration-300 ease-out
  ${
    dropdownOpen
      ? "opacity-100 translate-y-0"
      : "opacity-0 -translate-y-2 pointer-events-none"
  }`}
              >
                <div
                  className="w-64 p-4 rounded-2xl 
    bg-black/80 backdrop-blur-2xl 
    border border-white/10 
    shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                >
                  {/* USER INFO */}
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-white">
                      {user.company_name}
                    </p>
                    <p className="text-xs text-gray-400">{user.company_code}</p>
                  </div>

                  {/* SOFT DIVIDER */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3" />

                  {/* ACTION */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg
      text-sm text-red-400 hover:bg-red-500/10 transition group"
                  >
                    <span className="flex items-center gap-2">
                      <FiLogOut size={16} />
                      Logout
                    </span>

                    {/* subtle arrow effect */}
                    <span className="opacity-0 group-hover:opacity-100 transition text-xs">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-yellow-400"
          onClick={() => setMenuOpen(true)}
        >
          <HiMenu size={30} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-[75%] max-w-sm bg-black border-r border-yellow-400/20 z-50
        transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-yellow-400/20">
          <h2 className="text-lg font-semibold text-yellow-400">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-yellow-400"
          >
            <HiX size={26} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-6 text-gray-300 font-medium text-[15px]">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="hover:text-yellow-400 transition"
            >
              {link.name}
            </Link>
          ))}

          <div className="mt-6 border-t border-yellow-400/20 pt-5">
            {!user ? (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">
                  Login
                </button>
              </Link>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-3">
                  {user.company_name}
                </p>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-400 py-3 rounded-lg hover:bg-red-500/10 transition"
                >
                  <FiLogOut />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
