"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle, getYear, getMediaType } from "@/app/lib/tmdb";

interface TopTenRowProps {
  title: string;
  items: TMDBMovie[];
  onItemClick: (item: TMDBMovie) => void;
}

// SVG numbers styled like Netflix (outlined, bold strokes)
const TopTenNumber = ({ num }: { num: number }) => {
  const display = String(num);
  return (
    <span
      className="text-[8vw] font-black leading-none select-none mr-[-1.5vw] z-10 relative"
      style={{
        WebkitTextStroke: "4px #808080",
        color: "#141414",
        paintOrder: "stroke fill",
        fontFamily: "'Netflix Sans', 'Helvetica Neue', Arial, sans-serif",
        letterSpacing: "-0.1em",
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

  const topItems = items.slice(0, 10);

  // Circular: triple the items
  const circularItems = [...topItems, ...topItems, ...topItems];

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

    const oneThird = scrollWidth / 3;
    if (scrollLeft < 10) {
      rowRef.current.scrollLeft = oneThird;
    } else if (scrollLeft >= oneThird * 2 - 10) {
      rowRef.current.scrollLeft = oneThird;
    }
  }, []);

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
      <h2 className="text-[1.4vw] font-bold text-[#e5e5e5] mb-[0.4em] hover:text-white transition-colors cursor-default inline-flex items-center gap-1 group/title">
        <span>{title}</span>
        <span className="text-[0.9vw] text-[#54b9c5] font-semibold opacity-0 group-hover/title:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover/title:translate-x-0">
          Explore All &rsaquo;
        </span>
      </h2>

      <div className="relative -mx-1">
        {/* Left Arrow */}
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

        {/* Right Arrow */}
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
                className="relative flex-shrink-0 flex items-end cursor-pointer group/item transition-transform duration-200 hover:scale-105"
                onClick={() => onItemClick(item)}
                style={{ paddingLeft: "1vw" }}
              >
                {/* Number */}
                <TopTenNumber num={displayNum} />

                {/* Poster */}
                <div className="relative w-[8vw] h-[12vw] rounded-[4px] overflow-hidden flex-shrink-0">
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
