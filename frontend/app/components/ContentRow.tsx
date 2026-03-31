"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle, getYear, getMediaType, getTrailerKey } from "@/app/lib/tmdb";
import TrailerPlayer from "./TrailerPlayer";

interface ContentRowProps {
  title: string;
  items: TMDBMovie[];
  onItemClick: (item: TMDBMovie) => void;
  isLargeRow?: boolean;
}

// Netflix-style hover preview card with trailer
function HoverCard({
  item,
  rect,
  onClose,
  onItemClick,
}: {
  item: TMDBMovie;
  rect: DOMRect;
  onClose: () => void;
  onItemClick: (item: TMDBMovie) => void;
}) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadTrailer() {
      const mediaType = getMediaType(item);
      const key = await getTrailerKey(item.id, mediaType);
      if (!cancelled && key) {
        setTrailerKey(key);
        setTimeout(() => {
          if (!cancelled) setShowTrailer(true);
        }, 800);
      }
    }
    loadTrailer();
    return () => { cancelled = true; };
  }, [item]);

  const cardWidth = 350;
  const cardLeft = Math.max(
    10,
    Math.min(
      rect.left + rect.width / 2 - cardWidth / 2,
      window.innerWidth - cardWidth - 10
    )
  );
  const cardTop = Math.max(10, rect.top - 40);

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
    >
      <div
        className="absolute z-[61] animate-hover-card hover-card-shadow rounded-md overflow-hidden bg-[#181818] pointer-events-auto"
        style={{
          width: `${cardWidth}px`,
          left: `${cardLeft}px`,
          top: `${cardTop}px`,
        }}
        onMouseLeave={onClose}
      >
        {/* Preview area */}
        <div className="relative w-full aspect-video bg-[#000]">
          {showTrailer && trailerKey ? (
            <TrailerPlayer
              videoKey={trailerKey}
              className="absolute inset-0"
              autoplay
              muted
            />
          ) : (
            (item.backdrop_path || item.poster_path) && (
              <Image
                src={tmdb.imgUrl(item.backdrop_path || item.poster_path, "w500")}
                alt={getTitle(item)}
                fill
                className="object-cover"
                sizes="350px"
              />
            )
          )}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#181818] to-transparent" />
        </div>

        {/* Card Controls */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => onItemClick(item)}
              className="w-[36px] h-[36px] rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 transition-colors"
            >
              <svg className="w-[18px] h-[18px] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button className="w-[36px] h-[36px] rounded-full border-2 border-[rgba(255,255,255,0.5)] text-white flex items-center justify-center hover:border-white transition-colors bg-[rgba(42,42,42,0.6)]">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="w-[36px] h-[36px] rounded-full border-2 border-[rgba(255,255,255,0.5)] text-white flex items-center justify-center hover:border-white transition-colors bg-[rgba(42,42,42,0.6)]">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
              className="ml-auto w-[36px] h-[36px] rounded-full border-2 border-[rgba(255,255,255,0.5)] text-white flex items-center justify-center hover:border-white transition-colors bg-[rgba(42,42,42,0.6)]"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[13px] mb-1.5 flex-wrap">
            <span className="text-[#46d369] font-bold">
              {Math.round(item.vote_average * 10)}% Match
            </span>
            <span className="px-[5px] py-[1px] border border-[rgba(255,255,255,0.4)] text-[#bcbcbc] text-[11px] leading-tight">
              {item.adult ? "A" : "U/A 13+"}
            </span>
            <span className="text-[#bcbcbc]">{getYear(item)}</span>
            <span className="px-[5px] py-[1px] border border-[rgba(255,255,255,0.4)] text-[#bcbcbc] text-[11px] leading-tight rounded-sm">
              HD
            </span>
          </div>

          <div className="flex items-center gap-1 text-[12px] text-white/90">
            <span>{getMediaType(item) === "tv" ? "TV Series" : "Movie"}</span>
            <span className="text-[#646464] mx-1">•</span>
            <span className="text-[#bcbcbc]">
              {item.genre_ids?.length ? "Action" : "Drama"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentRow({
  title,
  items,
  onItemClick,
  isLargeRow = false,
}: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<{ item: TMDBMovie; rect: DOMRect } | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Triple items for circular scrolling
  const circularItems = [...items, ...items, ...items];

  useEffect(() => {
    if (rowRef.current && items.length > 0) {
      const itemWidth = rowRef.current.scrollWidth / 3;
      rowRef.current.scrollLeft = itemWidth;
    }
  }, [items.length]);

  const handleScroll = useCallback(() => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;

    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);

    // Circular: jump when near edges
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

  const handleMouseEnter = (item: TMDBMovie, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimeout.current = setTimeout(() => {
      setHoveredItem({ item, rect });
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  if (!items.length) return null;

  return (
    <div className="relative px-[4%] mb-[3vw] group/row" style={{ zIndex: hoveredItem ? 50 : 'auto' }}>
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

        {/* Items */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-[4px] overflow-x-scroll hide-scrollbar scroll-smooth px-1"
        >
          {circularItems.map((item, idx) => {
            const imgPath = isLargeRow ? item.poster_path : item.backdrop_path || item.poster_path;

            return (
              <div
                key={`${item.id}-${idx}`}
                className={`relative flex-shrink-0 cursor-pointer transition-transform duration-200 ease-out ${
                  isLargeRow
                    ? "w-[calc((100vw-8%)/6*0.67)] aspect-[2/3]"
                    : "w-[calc((100vw-8%)/6.2)] aspect-video"
                } hover:z-30`}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onItemClick(item)}
              >
                <div className="relative w-full h-full rounded-[4px] overflow-hidden">
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Preview Card */}
      {hoveredItem && (
        <HoverCard
          item={hoveredItem.item}
          rect={hoveredItem.rect}
          onClose={() => setHoveredItem(null)}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
}
