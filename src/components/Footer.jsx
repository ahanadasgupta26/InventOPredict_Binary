import React from "react";
import { FaInstagram, FaFacebook, FaEnvelope, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-yellow-400/20 px-4 sm:px-6 md:px-16 py-12 text-sm text-gray-300">
      
      <div className="max-w-7xl mx-auto flex flex-col gap-12 md:flex-row md:justify-between">

        {/* Left Section */}
        <div className="flex flex-col items-center md:items-start gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 text-xl font-semibold group">
            <img
              src="https://img.icons8.com/ios-filled/50/ffffff/combo-chart.png"
              alt="logo"
              className="w-7 h-7"
            />
            <Link to="/">
              <span className="text-white group-hover:text-yellow-400 transition">
                Invent<span className="text-yellow-400">O</span>
                <span className="text-yellow-400">Predict</span>
              </span>
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 text-lg">
            <a href="#" className="hover:text-yellow-400 transition hover:scale-110">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-yellow-400 transition hover:scale-110">
              <FaFacebook />
            </a>
            <a href="#" className="hover:text-yellow-400 transition hover:scale-110">
              <FaEnvelope />
            </a>
            <a href="#" className="hover:text-yellow-400 transition hover:scale-110">
              <FaPhone />
            </a>
          </div>

          <div className="text-xs text-gray-500 mt-2 text-center md:text-left">
            © 2025 All rights reserved
          </div>
        </div>

        {/* Middle Links */}
        <div className="flex flex-col sm:flex-row gap-10 justify-center items-center md:items-start text-center md:text-left">

          {/* Quick Links */}
          <div className="flex flex-col gap-2 min-w-[120px]">
            <h4 className="font-bold text-base mb-2 text-yellow-400">Quick Links</h4>
            <Link to="/" className="hover:text-yellow-400 transition">Home</Link>
            <Link to="/about" className="hover:text-yellow-400 transition">About</Link>
            <Link to="/feedback" className="hover:text-yellow-400 transition">Feedback</Link>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-2 min-w-[160px]">
            <h4 className="font-bold text-base mb-2 text-yellow-400">Features</h4>
            <Link to="#" className="hover:text-yellow-400 transition">Stock Operation Data</Link>
            <Link to="#" className="hover:text-yellow-400 transition">AI Forecast Tool</Link>
            <Link to="#" className="hover:text-yellow-400 transition">Visual Insights</Link>
          </div>

          {/* External */}
          <div className="flex flex-col gap-2 min-w-[160px]">
            <h4 className="font-bold text-base mb-2 text-yellow-400">External</h4>

            <a
              href="https://github.com/ahanadasgupta26/InventOPredict_Binary/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition"
            >
              Documentation
            </a>

            <a
              href="https://github.com/ahanadasgupta26/InventOPredict_Binary"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition"
            >
              GitHub Repository
            </a>
          </div>
        </div>

        {/* Right Section */}
        <div className="text-center md:text-right font-mono text-yellow-400 text-2xl md:text-3xl leading-relaxed italic tracking-wide">
          <span className="block hover:translate-x-1 transition">Predict.</span>
          <span className="block hover:translate-x-1 transition delay-75">Prepare.</span>
          <span className="block hover:translate-x-1 transition delay-150">Perform.</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;