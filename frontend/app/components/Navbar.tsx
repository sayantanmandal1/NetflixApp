"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useProfile } from "@/app/contexts/ProfileContext";
import Link from "next/link";

const AVATAR_COLORS = [
  "#e50914", "#b81d24", "#221f1f", "#f5f5f1",
  "#0080ff", "#ffc601", "#04fd8f", "#a601f4",
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { logout } = useAuth();
  const { activeProfile, clearProfile } = useProfile();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearProfile();
    router.push("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-[#141414]" : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-14 h-[68px]">
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link href="/browse">
            <svg viewBox="0 0 111 30" className="h-[25px] md:h-[35px] fill-[#e50914]">
              <path d="M105.06 14.28L111 30c-1.75-.25-3.5-.5-5.25-.58l-3.35-9.6-3.35 9.6c-1.72.08-3.43.33-5.15.58l5.98-15.72L94.37 0h5.1l3.3 8.84L106.06 0h5.1l-6.1 14.28zM90.43 0v27.23c-1.6.07-3.2.2-4.8.37V0h4.8zm-8.2 0v27.97c-1.57.17-3.13.4-4.7.65V0h4.7zM67.1 7.5v2.11c1.37-1.57 3.17-2.5 5.35-2.5 4.2 0 6.44 2.83 6.44 7.17v13.35c-1.53.3-3.06.66-4.57 1.05V14.67c0-2.36-1.05-3.64-3-3.64-1.63 0-2.92.87-4.22 2.36v15.67c-1.53.43-3.07.9-4.57 1.38V0h4.57v7.5zm-15.27-.53c4.75 0 7.57 3.28 7.57 8.28v.52c0 .27 0 .55-.02.82H46.8c.37 3.2 2.14 4.55 4.97 4.55 1.87 0 3.42-.58 4.88-1.44l1.44 3.55c-1.83 1.1-4.25 1.87-7 1.87-5.48 0-9.08-3.4-9.08-9s3.2-9.15 8.82-9.15zm3.12 7.53c0-2.58-1.05-4.13-3.2-4.13-1.87 0-3.37 1.35-3.72 4.13h6.92zM38.13 7.38v19.26l-4.57 1.62V12.38l-3.23-1.12 1.2-3.88h6.6zm-2.2-7.38c1.6 0 2.85 1.26 2.85 2.88 0 1.6-1.25 2.87-2.85 2.87-1.6 0-2.88-1.27-2.88-2.87 0-1.62 1.28-2.88 2.88-2.88zM21.9 20.97l1.65-3.83c1.85 1.2 3.73 1.73 5.6 1.73 1.85 0 2.72-.65 2.72-1.63 0-3.15-9.47-1.43-9.47-8.2 0-3.4 2.85-5.93 7.35-5.93 2.47 0 4.72.6 6.48 1.67l-1.55 3.82c-1.5-.88-3.28-1.47-5.07-1.47-1.58 0-2.55.58-2.55 1.5 0 3.1 9.47 1.37 9.47 8.17 0 3.5-2.82 6.08-7.47 6.08-2.97 0-5.5-.75-7.16-1.9zM0 0h5.1l5.85 16.55V0h4.8v30H11.1L5 12.94V30H0V0z" />
            </svg>
          </Link>

          <div className="hidden md:flex items-center gap-5 text-[14px] text-[#e5e5e5]">
            <Link href="/browse" className="text-white font-medium hover:text-[#b3b3b3] transition-colors">Home</Link>
            <Link href="/browse?type=tv" className="hover:text-[#b3b3b3] transition-colors">TV Shows</Link>
            <Link href="/browse?type=movie" className="hover:text-[#b3b3b3] transition-colors">Movies</Link>
            <Link href="/browse?type=new" className="hover:text-[#b3b3b3] transition-colors">New &amp; Popular</Link>
            <Link href="/browse/my-list" className="hover:text-[#b3b3b3] transition-colors">My List</Link>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex items-center">
            {searchOpen && (
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
                placeholder="Titles, people, genres"
                className="w-[250px] h-9 bg-black/80 border border-white/50 text-white text-sm pl-9 pr-3 outline-none transition-all"
              />
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`${searchOpen ? "absolute left-2" : ""} text-white hover:text-[#b3b3b3] transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Notifications */}
          <button className="text-white hover:text-[#b3b3b3] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Profile */}
          <div
            className="relative"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            <button className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: activeProfile
                    ? AVATAR_COLORS[0]
                    : "#333",
                }}
              >
                {activeProfile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <svg
                className={`w-4 h-4 text-white transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-black/95 border border-[#333] rounded animate-fade-in py-2">
                <Link
                  href="/profiles"
                  className="block px-4 py-2 text-sm text-[#b3b3b3] hover:text-white hover:underline transition-colors"
                >
                  Switch Profiles
                </Link>
                <div className="border-t border-[#333] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[#b3b3b3] hover:text-white hover:underline transition-colors"
                >
                  Sign out of Netflix
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
