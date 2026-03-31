"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle } from "@/app/lib/tmdb";

interface TopTenRowProps {
  title: string;
  items: TMDBMovie[];
  onItemClick: (item: TMDBMovie) => void;
}

// Netflix outlined numbers — heavy stroke, transparent fill, italic-ish
const TopTenNumber = ({ num }: { num: number }) => {
  const display = String(num);
  return (
    <span
      className="font-black leading-none select-none relative z-10"
      style={{
        fontSize: "clamp(80px, 8vw, 160px)",
        WebkitTextStroke: "4px rgba(128,128,128,0.8)",
        color: "#141414",
        paintOrder: "stroke fill",
        fontFamily: "'Netflix Sans', 'Helvetica Neue', Arial, sans-serif",
        letterSpacing: num >= 10 ? "-0.15em" : "-0.05em",
        marginRight: "-0.6vw",
      }}
    >
      {display}
    </span>
  );
};

export default function TopTenRow({ title, items, onItemClick }: TopTenRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const topItems = items.slice(0, 10);
  const circularItems = [...topItems, ...topItems, ...topItems];

  // Netflix shows ~5 items per page in Top 10 rows
  const itemsPerPage = 5;
  const totalPages = Math.ceil(topItems.length / itemsPerPage);

  useEffect(() => {
    if (rowRef.current && topItems.length > 0) {
      const oneThird = rowRef.current.scrollWidth / 3;
      rowRef.current.scrollLeft = oneThird;
    }
  }, [topItems.length]);

  const handleScroll = useCallback(() => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;

    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);

    // Calculate current page for pagination indicator
    const oneThird = scrollWidth / 3;
    const scrollInMiddle = scrollLeft - oneThird;
    const pageWidth = clientWidth;
    const page = Math.round(scrollInMiddle / pageWidth);
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));

    // Circular reset
    if (scrollLeft < 10) {
      rowRef.current.scrollLeft = oneThird;
    } else if (scrollLeft >= oneThird * 2 - 10) {
      rowRef.current.scrollLeft = oneThird;
    }
  }, [totalPages]);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.92;
      rowRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!topItems.length) return null;

  return (
    <div className="relative px-[4%] mb-[3vw] group/row">
      {/* Row header with title + pagination indicator */}
      <div className="relative flex items-baseline justify-between mb-[0.5em]">
        <h2 className="text-[1.4vw] font-bold text-[#e5e5e5] hover:text-white transition-colors cursor-default inline-flex items-center gap-1 group/title leading-[1.25vw]">
          <span>{title}</span>
          <span className="text-[0.9vw] text-[#54b9c5] font-semibold opacity-0 group-hover/title:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover/title:translate-x-0">
            Explore All &rsaquo;
          </span>
        </h2>

        {/* Netflix .pagination-indicator — right: 4%; top: 0; position: absolute */}
        <ul
          className="flex items-center gap-[2px] list-none m-0 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{ position: "relative" }}
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <li
              key={i}
              className={`w-[12px] h-[2px] ${
                i === currentPage ? "bg-[#aaa]" : "bg-[#4d4d4d]"
              }`}
            />
          ))}
        </ul>
      </div>

      <div className="relative -mx-1">
        {/* Left Arrow — Netflix handlePrev */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 w-[4%] min-w-[40px] bg-[hsla(0,0%,8%,0.5)] hover:bg-[hsla(0,0%,8%,0.7)] z-20 flex items-center justify-center transition-opacity rounded-r ${
            showLeftArrow ? "opacity-0 group-hover/row:opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-[40px] h-[40px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow — Netflix handleNext */}
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 w-[4%] min-w-[40px] bg-[hsla(0,0%,8%,0.5)] hover:bg-[hsla(0,0%,8%,0.7)] z-20 flex items-center justify-center transition-opacity rounded-l ${
            showRightArrow ? "opacity-0 group-hover/row:opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-[40px] h-[40px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Netflix .sliderContent.row-with-x-columns */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-[4px] overflow-x-scroll hide-scrollbar scroll-smooth px-1"
        >
          {circularItems.map((item, idx) => {
            const displayNum = (idx % topItems.length) + 1;
            return (
              <div
                key={`${item.id}-${idx}`}
                className="relative flex-shrink-0 flex items-end cursor-pointer group/item transition-transform duration-300 hover:scale-[1.08]"
                onClick={() => onItemClick(item)}
                style={{ paddingLeft: "0.8vw" }}
              >
                {/* Netflix outlined number */}
                <TopTenNumber num={displayNum} />

                {/* Poster — Netflix uses roughly 1:1.5 aspect for top 10 posters */}
                <div className="relative w-[calc(8vw+10px)] rounded-[4px] overflow-hidden flex-shrink-0" style={{ aspectRatio: "2/3" }}>
                  {item.poster_path ? (
                    <Image
                      src={tmdb.imgUrl(item.poster_path, "w342")}
                      alt={getTitle(item)}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#333] flex items-center justify-center text-xs text-[#808080]">
                      {getTitle(item)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
