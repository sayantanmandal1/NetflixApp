"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle, getYear, getMediaType, getTrailerKey } from "@/app/lib/tmdb";

// Genre ID to name mapping
const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};

interface ContentRowProps {
  title: string;
  items: TMDBMovie[];
  onItemClick: (item: TMDBMovie) => void;
  isLargeRow?: boolean;
}

// Netflix previewModal--container-MINI_MODAL style hover card
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
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadTrailer() {
      try {
        const mediaType = getMediaType(item);
        const key = await getTrailerKey(item.id, mediaType);
        if (!cancelled && key) {
          setTrailerKey(key);
          // Short delay before showing trailer to let card animate in first
          setTimeout(() => {
            if (!cancelled) setShowTrailer(true);
          }, 400);
        }
      } catch {
        // Trailer unavailable — backdrop image stays
      }
    }
    loadTrailer();
    return () => { cancelled = true; };
  }, [item]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 150);
  }, [onClose]);

  // Netflix mini modal: 320px wide, centered on the source card
  const cardWidth = 320;
  const cardLeft = Math.max(
    8,
    Math.min(
      rect.left + rect.width / 2 - cardWidth / 2,
      window.innerWidth - cardWidth - 8
    )
  );
  const cardTop = Math.max(8, rect.top - 30);

  const genres = item.genre_ids
    ?.slice(0, 3)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean) || [];

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 1000, pointerEvents: "none" }}
    >
      {/* previewModal--container-MINI_MODAL */}
      <div
        className={`absolute rounded-md overflow-hidden bg-[#181818] ${
          isClosing ? "animate-hover-card-out" : "animate-hover-card"
        }`}
        style={{
          width: `${cardWidth}px`,
          left: `${cardLeft}px`,
          top: `${cardTop}px`,
          boxShadow: "rgba(0, 0, 0, 0.75) 0px 3px 10px",
          transformOrigin: "50% 50%",
          pointerEvents: "auto",
          zIndex: 3,
        }}
        onMouseLeave={handleClose}
      >
        {/* Video / image preview area — 16:9 */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {/* Backdrop image (always rendered as base layer) */}
          {(item.backdrop_path || item.poster_path) && (
            <Image
              src={tmdb.imgUrl(item.backdrop_path || item.poster_path, "w500")}
              alt={getTitle(item)}
              fill
              className="object-cover"
              sizes="320px"
            />
          )}

          {/* Trailer — direct iframe with allow="autoplay" for reliable playback */}
          {showTrailer && trailerKey && (
            <div className="absolute inset-0 overflow-hidden z-[1]">
              <iframe
                src={`https://www.youtube.com/embed/${encodeURIComponent(trailerKey)}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&playsinline=1`}
                className="absolute border-0"
                style={{
                  top: "-50px",
                  left: "-50px",
                  width: "calc(100% + 100px)",
                  height: "calc(100% + 100px)",
                }}
                allow="autoplay; encrypted-media"
                title="Preview"
              />
            </div>
          )}

          {/* Bottom gradient into card body */}
          <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-[#181818] to-transparent z-[2]" />

          {/* Mute / volume indicator — right side */}
          <div className="absolute bottom-3 right-3 z-[3] flex items-center gap-2">
            <button className="w-[26px] h-[26px] rounded-full border border-[rgba(255,255,255,0.5)] text-white flex items-center justify-center bg-[rgba(42,42,42,0.6)]">
              <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Card body — controls + metadata */}
        <div className="px-[16px] pt-[8px] pb-[12px]">
          {/* Action buttons — Netflix has-smaller-buttons mini-modal */}
          <div className="flex items-center gap-[6px] mb-[8px]">
            {/* Play — white filled circle */}
            <button
              onClick={() => onItemClick(item)}
              className="w-[32px] h-[32px] rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 transition border-0 cursor-pointer"
              aria-label="Play"
            >
              <svg className="w-[15px] h-[15px] ml-[2px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4l15 8-15 8z" />
              </svg>
            </button>

            {/* Add to My List */}
            <button
              className="w-[32px] h-[32px] rounded-full border-2 border-[rgba(255,255,255,0.5)] text-white flex items-center justify-center hover:border-white transition bg-[rgba(42,42,42,0.6)] hover:bg-[rgba(42,42,42,0.9)] cursor-pointer"
              aria-label="Add to My List"
            >
              <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Like / thumbs up */}
            <button
              className="w-[32px] h-[32px] rounded-full border-2 border-[rgba(255,255,255,0.5)] text-white flex items-center justify-center hover:border-white transition bg-[rgba(42,42,42,0.6)] hover:bg-[rgba(42,42,42,0.9)] cursor-pointer"
              aria-label="I like this"
            >
              <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
              </svg>
            </button>

            {/* Expand details — pushed to right, Netflix down-chevron */}
            <button
              onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
              className="ml-auto w-[32px] h-[32px] rounded-full border-2 border-[rgba(255,255,255,0.5)] text-white flex items-center justify-center hover:border-white transition bg-[rgba(42,42,42,0.6)] hover:bg-[rgba(42,42,42,0.9)] cursor-pointer"
              aria-label="Episodes & Info"
            >
              <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Metadata: match %, maturity, year, quality badge */}
          <div className="flex items-center gap-[6px] text-[13px] mb-[6px] flex-wrap">
            <span className="text-[#46d369] font-bold">
              {Math.round(item.vote_average * 10)}% Match
            </span>
            <span className="px-[4px] py-[1px] border border-[rgba(255,255,255,0.4)] text-[#bcbcbc] text-[11px] leading-[1.3]">
              {item.adult ? "A" : "U/A 13+"}
            </span>
            <span className="text-[#bcbcbc]">{getYear(item)}</span>
            <span className="px-[4px] py-[1px] border border-[rgba(255,255,255,0.4)] text-[#bcbcbc] text-[11px] leading-[1.3] rounded-[2px]">
              HD
            </span>
          </div>

          {/* Genres — dot-separated */}
          {genres.length > 0 && (
            <div className="flex items-center text-[12px] text-white/80 leading-[1.4]">
              {genres.map((g, i) => (
                <span key={g} className="flex items-center">
                  {i > 0 && <span className="text-[#646464] mx-[4px]">•</span>}
                  <span>{g}</span>
                </span>
              ))}
            </div>
          )}
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
  const [currentPage, setCurrentPage] = useState(0);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Triple items for circular scrolling
  const circularItems = [...items, ...items, ...items];

  // Netflix shows ~6 items per row page
  const itemsPerPage = 6;
  const totalPages = Math.ceil(items.length / itemsPerPage);

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

    // Update pagination
    const oneThird = scrollWidth / 3;
    const scrollInMiddle = scrollLeft - oneThird;
    const page = Math.round(scrollInMiddle / clientWidth);
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));

    // Circular: jump when near edges
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
      {/* Netflix .lolomoRow header: title + pagination-indicator */}
      <div className="relative flex items-baseline justify-between mb-[0.5em]">
        <h2 className="text-[1.4vw] font-bold text-[#e5e5e5] hover:text-white transition-colors cursor-default inline-flex items-center gap-1 group/title leading-[1.25vw]">
          <span>{title}</span>
          <span className="text-[0.9vw] text-[#54b9c5] font-semibold opacity-0 group-hover/title:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover/title:translate-x-0">
            Explore All &rsaquo;
          </span>
        </h2>

        {/* Netflix .pagination-indicator — small dots at top right */}
        <ul className="flex items-center gap-[2px] list-none m-0 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
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
