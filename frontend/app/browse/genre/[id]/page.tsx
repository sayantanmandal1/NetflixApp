"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { TMDBMovie, TMDBGenre, tmdb, getTitle, getYear } from "@/app/lib/tmdb";
import DetailModal from "@/app/components/DetailModal";

export default function GenrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const genreId = parseInt(id, 10);

  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [tvShows, setTvShows] = useState<TMDBMovie[]>([]);
  const [genreName, setGenreName] = useState("");
  const [selectedItem, setSelectedItem] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGenre() {
      try {
        const [movieRes, tvRes, movieGenres, tvGenres] = await Promise.all([
          tmdb.discoverMovies(genreId),
          tmdb.discoverTV(genreId),
          tmdb.movieGenres(),
          tmdb.tvGenres(),
        ]);

        setMovies(movieRes.results);
        setTvShows(tvRes.results);

        const allGenres: TMDBGenre[] = [
          ...movieGenres.genres,
          ...tvGenres.genres,
        ];
        const found = allGenres.find((g) => g.id === genreId);
        setGenreName(found?.name || "Genre");
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchGenre();
  }, [genreId]);

  const allItems = [...movies, ...tvShows].filter(
    (item) => item.poster_path || item.backdrop_path
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">{genreName}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {allItems.map((item) => (
          <div
            key={`${item.id}-${item.media_type || "unknown"}`}
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
              <p className="text-xs text-[#808080]">{getYear(item)}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
