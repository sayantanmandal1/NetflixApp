"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle, getYear, getMediaType } from "@/app/lib/tmdb";

interface TopTenRowProps {
  title: string;
  items: TMDBMovie[];
  onItemClick: (item: TMDBMovie) => void;
}

export default function TopTenRow({ title, items, onItemClick }: TopTenRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 0);
    }
  };

  const topItems = items.slice(0, 10);
  if (!topItems.length) return null;

  return (
    <div className="relative px-[4%] mb-[3vw] group/row">
      <h2 className="text-[1.4vw] font-bold text-[#e5e5e5] mb-[0.5vw]">
        {title}
      </h2>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 w-12 md:w-14 bg-black/50 hover:bg-black/80 z-20 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-14 bg-black/50 hover:bg-black/80 z-20 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-[4px] overflow-x-scroll hide-scrollbar scroll-smooth"
        >
          {topItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="relative flex-shrink-0 flex items-end cursor-pointer group"
              onClick={() => onItemClick(item)}
            >
              {/* Number */}
              <span
                className="text-[8vw] font-black leading-none select-none mr-[-1vw] z-10"
                style={{
                  WebkitTextStroke: "3px #808080",
                  color: "transparent",
                }}
              >
                {idx + 1}
              </span>

              {/* Poster */}
              <div className="relative w-[8vw] h-[12vw] rounded overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                {item.poster_path ? (
                  <Image
                    src={tmdb.imgUrl(item.poster_path, "w342")}
                    alt={getTitle(item)}
                    fill
                    className="object-cover"
                    sizes="130px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#333] flex items-center justify-center text-xs text-[#808080]">
                    {getTitle(item)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
