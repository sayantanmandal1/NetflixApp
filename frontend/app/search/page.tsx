"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle, getYear } from "@/app/lib/tmdb";
import DetailModal from "@/app/components/DetailModal";
import Navbar from "@/app/components/Navbar";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TMDBMovie | null>(null);

  const doSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await tmdb.search(query);
      setResults(
        data.results.filter(
          (r) =>
            (r.media_type === "movie" || r.media_type === "tv") &&
            (r.poster_path || r.backdrop_path)
        )
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  return (
    <>
      <div className="pt-24 px-4 md:px-12">
        {query && (
          <h2 className="text-lg text-[#808080] mb-6">
            {loading
              ? "Searching..."
              : results.length > 0
              ? `Results for "${query}"`
              : `No results for "${query}"`}
          </h2>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {results.map((item) => (
            <div
              key={`${item.id}-${item.media_type}`}
              className="relative cursor-pointer group"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#333]">
                {item.poster_path ? (
                  <Image
                    src={tmdb.imgUrl(item.poster_path, "w342")}
                    alt={getTitle(item)}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#808080]">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 px-1">
                <p className="text-sm font-medium truncate">{getTitle(item)}</p>
                <div className="flex items-center gap-2 text-xs text-[#808080]">
                  <span>{getYear(item)}</span>
                  <span className="capitalize">{item.media_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <Suspense
        fallback={
          <div className="pt-24 px-4 md:px-12">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mt-20" />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
