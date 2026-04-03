"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1a0e04] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[#f5b731]">Lake Santa Fe Shoot Out</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-[#f5b731] transition-colors">Home</Link>
            <Link href="/rules" className="hover:text-[#f5b731] transition-colors">Rules</Link>
            <Link href="/results" className="hover:text-[#f5b731] transition-colors">Results</Link>
            <Link href="/signup" className="bg-[#c45e10] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#e8940c] transition-colors">
              Sign Up
            </Link>
            <Link href="/waiver" className="hover:text-[#f5b731] transition-colors">
              Waiver
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-[#f5b731]" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/rules" className="block py-2 hover:text-[#f5b731]" onClick={() => setMenuOpen(false)}>Rules</Link>
            <Link href="/results" className="block py-2 hover:text-[#f5b731]" onClick={() => setMenuOpen(false)}>Results</Link>
            <Link href="/signup" className="block bg-[#c45e10] text-white px-4 py-2 rounded-lg font-semibold text-center hover:bg-[#e8940c]" onClick={() => setMenuOpen(false)}>
              Sign Up
            </Link>
            <Link href="/waiver" className="block py-2 hover:text-[#f5b731]" onClick={() => setMenuOpen(false)}>Waiver</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
