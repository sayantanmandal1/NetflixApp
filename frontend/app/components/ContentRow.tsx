"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle, getYear, getMediaType } from "@/app/lib/tmdb";

interface ContentRowProps {
  title: string;
  items: TMDBMovie[];
  onItemClick: (item: TMDBMovie) => void;
  isLargeRow?: boolean;
}

export default function ContentRow({
  title,
  items,
  onItemClick,
  isLargeRow = false,
}: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const handleMouseEnter = (idx: number) => {
    hoverTimeout.current = setTimeout(() => setHoveredItem(idx), 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredItem(null);
  };

  if (!items.length) return null;

  return (
    <div className="relative px-[4%] mb-[3vw] group/row">
      <h2 className="text-[1.4vw] font-bold text-[#e5e5e5] mb-[0.5vw] hover:text-white transition-colors cursor-default inline-block">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
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

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-14 bg-black/50 hover:bg-black/80 z-20 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Items */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-[4px] overflow-x-scroll hide-scrollbar scroll-smooth"
        >
          {items.map((item, idx) => {
            const imgPath = isLargeRow ? item.poster_path : item.backdrop_path || item.poster_path;
            const isHovered = hoveredItem === idx;

            return (
              <div
                key={`${item.id}-${idx}`}
                className={`relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out ${
                  isLargeRow
                    ? "w-[calc((100vw-8%)/6*0.67)] aspect-[2/3]"
                    : "w-[calc((100vw-8%)/6.2)] aspect-video"
                } ${isHovered ? "z-30 scale-[1.3] delay-300" : "z-10"}`}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onItemClick(item)}
              >
                <div className="relative w-full h-full rounded overflow-hidden">
                  {imgPath ? (
                    <Image
                      src={tmdb.imgUrl(imgPath, isLargeRow ? "w342" : "w500")}
                      alt={getTitle(item)}
                      fill
                      className="object-cover"
                      sizes={isLargeRow ? "200px" : "280px"}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#333] flex items-center justify-center text-sm text-[#808080]">
                      {getTitle(item)}
                    </div>
                  )}
                </div>

                {/* Hover Card */}
                {isHovered && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-[280px] md:w-[320px] bg-[#181818] rounded-b-md shadow-2xl animate-slide-up z-40 pointer-events-auto">
                    <div className="p-3">
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mb-2">
                        <button className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                        <button className="w-9 h-9 rounded-full border-2 border-[#808080] text-white flex items-center justify-center hover:border-white transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button className="w-9 h-9 rounded-full border-2 border-[#808080] text-white flex items-center justify-center hover:border-white transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemClick(item);
                          }}
                          className="ml-auto w-9 h-9 rounded-full border-2 border-[#808080] text-white flex items-center justify-center hover:border-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="text-[#46d369] font-semibold">
                          {Math.round(item.vote_average * 10)}% Match
                        </span>
                        <span className="px-1.5 py-0.5 border border-[#808080] text-[#bcbcbc] text-xs">
                          {item.adult ? "18+" : "16+"}
                        </span>
                        <span className="text-[#bcbcbc]">{getYear(item)}</span>
                      </div>

                      <div className="text-xs text-[#bcbcbc]">
                        {getMediaType(item) === "tv" ? "TV Series" : "Movie"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
