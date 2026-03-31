"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useProfile } from "@/app/contexts/ProfileContext";
import Link from "next/link";

const AVATAR_COLORS = [
  "#e50914", "#b81d24", "#221f1f", "#f5f5f1",
  "#0080ff", "#ffc601", "#04fd8f", "#a601f4",
];

function NavbarContent() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const { activeProfile, clearProfile } = useProfile();

  const currentType = searchParams.get("type");

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

  // Determine active nav item
  const isHome = pathname === "/browse" && !currentType;
  const isTVShows = currentType === "tv";
  const isMovies = currentType === "movie";
  const isNew = currentType === "new";
  const isMyList = pathname === "/browse/my-list";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[70] transition-colors duration-500 ${
        scrolled ? "bg-[rgb(20,20,20)]" : "bg-gradient-to-b from-[rgba(0,0,0,0.7)] via-[rgba(0,0,0,0.4)] to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-[60px] h-[41px] md:h-[68px]">
        {/* Left */}
        <div className="flex items-center gap-[18px] md:gap-[20px]">
          <Link href="/browse" className="focus:outline-none focus:ring-2 focus:ring-white rounded mr-[5px]">
            <svg viewBox="0 0 111 30" className="h-[20px] md:h-[25px] w-auto fill-[#e50914]" aria-label="Netflix">
              <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z" />
            </svg>
          </Link>

          <div className="hidden md:flex items-center gap-[18px] text-[14px]">
            <Link
              href="/browse"
              className={`transition-colors text-[14px] leading-[18px] ${isHome ? "text-white font-semibold" : "text-[#e5e5e5] hover:text-[#b3b3b3]"}`}
            >
              Home
            </Link>
            <Link
              href="/browse?type=tv"
              className={`transition-colors text-[14px] leading-[18px] ${isTVShows ? "text-white font-semibold" : "text-[#e5e5e5] hover:text-[#b3b3b3]"}`}
            >
              TV Shows
            </Link>
            <Link
              href="/browse?type=movie"
              className={`transition-colors text-[14px] leading-[18px] ${isMovies ? "text-white font-semibold" : "text-[#e5e5e5] hover:text-[#b3b3b3]"}`}
            >
              Movies
            </Link>
            <Link
              href="/browse?type=new"
              className={`transition-colors text-[14px] leading-[18px] ${isNew ? "text-white font-semibold" : "text-[#e5e5e5] hover:text-[#b3b3b3]"}`}
            >
              New &amp; Popular
            </Link>
            <Link
              href="/browse/my-list"
              className={`transition-colors text-[14px] leading-[18px] ${isMyList ? "text-white font-semibold" : "text-[#e5e5e5] hover:text-[#b3b3b3]"}`}
            >
              My List
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-[15px]">
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
                className="w-[250px] h-[34px] bg-[rgba(0,0,0,0.75)] border border-[rgba(255,255,255,0.85)] text-white text-[14px] pl-9 pr-3 outline-none transition-all"
              />
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`${searchOpen ? "absolute left-2" : ""} text-white hover:text-[#b3b3b3] transition-colors`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Notifications bell */}
          <button className="text-white hover:text-[#b3b3b3] transition-colors relative">
            <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Profile */}
          <div
            className="relative"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            <button className="flex items-center gap-[6px]">
              <div
                className="w-[32px] h-[32px] rounded-[4px] flex items-center justify-center text-[14px] font-bold overflow-hidden"
                style={{
                  backgroundColor: activeProfile
                    ? AVATAR_COLORS[0]
                    : "#333",
                }}
              >
                {activeProfile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <svg
                className={`w-[16px] h-[16px] text-white transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full pt-[10px]">
                <div className="w-[220px] bg-[rgba(0,0,0,0.9)] border border-[rgba(255,255,255,0.15)] rounded animate-fade-in py-[10px]">
                  <Link
                    href="/profiles"
                    className="block px-[10px] py-[5px] text-[13px] text-[#b3b3b3] hover:text-white hover:underline transition-colors"
                  >
                    Manage Profiles
                  </Link>
                  <Link
                    href="/profiles"
                    className="block px-[10px] py-[5px] text-[13px] text-[#b3b3b3] hover:text-white hover:underline transition-colors"
                  >
                    Transfer Profile
                  </Link>
                  <Link
                    href="/profiles"
                    className="block px-[10px] py-[5px] text-[13px] text-[#b3b3b3] hover:text-white hover:underline transition-colors"
                  >
                    Account
                  </Link>
                  <Link
                    href="/profiles"
                    className="block px-[10px] py-[5px] text-[13px] text-[#b3b3b3] hover:text-white hover:underline transition-colors"
                  >
                    Help Centre
                  </Link>
                  <div className="border-t border-[rgba(255,255,255,0.15)] my-[5px]" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-[10px] py-[5px] text-[13px] text-[#b3b3b3] hover:text-white hover:underline transition-colors"
                  >
                    Sign out of Netflix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="fixed top-0 left-0 right-0 z-[70] h-[68px] bg-transparent" />}>
      <NavbarContent />
    </Suspense>
  );
}
