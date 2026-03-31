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

      {/* Vignette / gradient overlays — Netflix uses these exact gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(20,20,20,0.8)] via-[rgba(20,20,20,0.15)] to-transparent w-[50%]" />
      <div className="absolute bottom-0 left-0 right-0 h-[14.7vw] bg-gradient-to-t from-[#141414] via-[rgba(20,20,20,0.6)] to-transparent" />

      {/* Content — Netflix .fill-container > .info.meta-layer > .logo-and-text.meta-layer */}
      <div className="absolute bottom-[35%] left-[4%] max-w-[36%] min-w-[300px] z-10">
        {/* Netflix .titleWrapper with transform-origin: left bottom */}
        <div
          className={`transition-all duration-[1300ms] ${fadeClass}`}
          style={{ transformOrigin: "left bottom" }}
        >
          <h1
            className="text-[2.8vw] font-bold text-white mb-[0.8vw] leading-[1.1]"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.45)" }}
          >
            {title}
          </h1>
        </div>
        {/* Netflix .info-wrapper */}
        <p
          className={`text-[1.2vw] text-white/90 mb-[1.5vw] line-clamp-3 leading-[1.4] transition-opacity duration-500 ${fadeClass}`}
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.45)" }}
        >
          {currentItem.overview}
        </p>
        <div className="flex items-center gap-0">
          {/* Netflix Play button — .color-primary.hasLabel.hasIcon
              padding: 0.8rem; pl: 2rem; pr: 2.4rem; border: 0; border-radius: 4px;
              .billboard-links button { margin-bottom: 1rem; margin-right: 1rem; } */}
          <button
            onClick={() => onMoreInfo(currentItem)}
            className="flex items-center bg-white text-black font-bold rounded-[4px] hover:bg-[rgba(255,255,255,0.75)] transition-all duration-200 cursor-pointer border-0 appearance-none select-none relative opacity-100"
            style={{
              padding: "0.8rem",
              paddingLeft: "2rem",
              paddingRight: "2.4rem",
              marginRight: "1rem",
              marginBottom: "1rem",
            }}
          >
            <svg className="w-[24px] h-[24px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4l15 8-15 8z" />
            </svg>
            <div style={{ width: "1rem" }} />
            <span className="text-[1.6rem] leading-none">Play</span>
          </button>
          {/* Netflix More Info button — .color-secondary.hasLabel.hasIcon
              bg: rgba(109,109,110,0.7), hover: rgba(109,109,110,0.4) */}
          <button
            onClick={() => onMoreInfo(currentItem)}
            className="flex items-center bg-[rgba(109,109,110,0.7)] text-white font-bold rounded-[4px] hover:bg-[rgba(109,109,110,0.4)] transition-all duration-200 cursor-pointer border-0 appearance-none select-none relative opacity-100"
            style={{
              padding: "0.8rem",
              paddingLeft: "2rem",
              paddingRight: "2.4rem",
              marginRight: "1rem",
              marginBottom: "1rem",
            }}
          >
            <svg className="w-[24px] h-[24px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <div style={{ width: "1rem" }} />
            <span className="text-[1.6rem] leading-none">More Info</span>
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
