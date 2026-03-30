"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TMDBMovie, tmdb, getTitle, getYear, getMediaType } from "@/app/lib/tmdb";
import { api } from "@/app/lib/api";
import { useProfile } from "@/app/contexts/ProfileContext";
import DetailModal from "@/app/components/DetailModal";

export default function MyListPage() {
  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TMDBMovie | null>(null);
  const { activeProfile } = useProfile();

  useEffect(() => {
    async function fetchFavorites() {
      if (!activeProfile) return;
      try {
        const favorites = await api.favorites.list(activeProfile.id);
        // Fetch TMDB details for each favorite
        const details = await Promise.all(
          favorites.map(async (fav) => {
            try {
              const data =
                fav.media_type === "tv"
                  ? await tmdb.tvDetails(fav.tmdb_id)
                  : await tmdb.movieDetails(fav.tmdb_id);
              return { ...data, media_type: fav.media_type } as TMDBMovie;
            } catch {
              return null;
            }
          })
        );
        setItems(details.filter(Boolean) as TMDBMovie[]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [activeProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-12 pb-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">My List</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-16 h-16 text-[#808080] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-[#808080] text-lg">
            You haven&apos;t added any titles to your list yet.
          </p>
          <p className="text-[#808080] text-sm mt-1">
            Browse for something to watch and add it to My List.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {items.map((item) => (
            <div
              key={`${item.id}-${getMediaType(item)}`}
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
                  <span className="capitalize">{getMediaType(item)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
