"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  TMDBMovie,
  tmdb,
  getTitle,
  getMediaType,
  getTrailerKey,
} from "@/app/lib/tmdb";
import TrailerPlayer from "./TrailerPlayer";

interface BillboardProps {
  items: TMDBMovie[];
  onMoreInfo: (item: TMDBMovie) => void;
}

export default function Billboard({ items, onMoreInfo }: BillboardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  const currentItem = items[currentIndex];

  const loadTrailer = useCallback(async (item: TMDBMovie) => {
    const mediaType = getMediaType(item);
    const key = await getTrailerKey(item.id, mediaType);
    setTrailerKey(key);
    if (key) {
      setTimeout(() => setShowTrailer(true), 2000);
    }
  }, []);

  useEffect(() => {
    if (currentItem) {
      setShowTrailer(false);
      setTrailerKey(null);
      loadTrailer(currentItem);
    }
  }, [currentItem, loadTrailer]);

  // Auto-rotate every 12 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setFadeClass("opacity-0");
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 5));
        setFadeClass("opacity-100");
      }, 500);
    }, 12000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!currentItem) return null;

  const title = getTitle(currentItem);

  return (
    <div className="relative w-full h-[56.25vw] max-h-[85vh] min-h-[450px]">
      {/* Backdrop Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${fadeClass} ${
          showTrailer ? "opacity-0" : ""
        }`}
      >
        <Image
          src={tmdb.backdropUrl(currentItem.backdrop_path)}
          alt={title}
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* Trailer */}
      {showTrailer && trailerKey && (
        <TrailerPlayer
          videoKey={trailerKey}
          className="absolute inset-0"
          onEnd={() => setShowTrailer(false)}
        />
      )}

      {/* Vignette / Gradient overlays — Netflix uses these exact gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(20,20,20,0.8)] via-[rgba(20,20,20,0.15)] to-transparent w-[50%]" />
      <div className="absolute bottom-0 left-0 right-0 h-[14.7vw] bg-gradient-to-t from-[#141414] via-[rgba(20,20,20,0.6)] to-transparent" />

      {/* Content — Netflix positions at ~35% from bottom */}
      <div className="absolute bottom-[35%] left-[4%] max-w-[36%] min-w-[300px] z-10">
        <h1
          className={`text-[2.8vw] font-bold text-white mb-[0.8vw] leading-[1.1] drop-shadow-lg transition-opacity duration-500 ${fadeClass}`}
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.45)" }}
        >
          {title}
        </h1>
        <p
          className={`text-[1.2vw] text-white/90 mb-[1.5vw] line-clamp-3 drop-shadow leading-[1.4] transition-opacity duration-500 ${fadeClass}`}
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.45)" }}
        >
          {currentItem.overview}
        </p>
        <div className="flex items-center gap-[0.8vw]">
          {/* Netflix Play button - white bg, rounded-[4px], bold font */}
          <button
            onClick={() => onMoreInfo(currentItem)}
            className="flex items-center gap-[0.8vw] px-[2.2vw] py-[0.55vw] bg-white text-black text-[1.2vw] font-bold rounded-[4px] hover:bg-[rgba(255,255,255,0.75)] transition-all duration-200"
          >
            <svg className="w-[2vw] h-[2vw]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4l15 8-15 8z" />
            </svg>
            <span>Play</span>
          </button>
          {/* Netflix More Info button - gray semi-transparent bg */}
          <button
            onClick={() => onMoreInfo(currentItem)}
            className="flex items-center gap-[0.8vw] px-[2.2vw] py-[0.55vw] bg-[rgba(109,109,110,0.7)] text-white text-[1.2vw] font-bold rounded-[4px] hover:bg-[rgba(109,109,110,0.4)] transition-all duration-200"
          >
            <svg className="w-[2vw] h-[2vw]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* Maturity Rating — right side, Netflix style */}
      <div className="absolute bottom-[35%] right-0 flex items-center z-10">
        <span className="border-l-[3px] border-white/40 bg-[rgba(51,51,51,0.6)] pl-[0.8vw] pr-[2.5vw] py-[0.4vw] text-[1vw] text-white/90">
          {currentItem.adult ? "18+" : "16+"}
        </span>
      </div>
    </div>
  );
}
