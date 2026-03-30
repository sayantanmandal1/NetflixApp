"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  TMDBMovie,
  TMDBCast,
  tmdb,
  getTitle,
  getYear,
  getMediaType,
  getTrailerKey,
} from "@/app/lib/tmdb";
import { api } from "@/app/lib/api";
import { useProfile } from "@/app/contexts/ProfileContext";
import TrailerPlayer from "./TrailerPlayer";

interface DetailModalProps {
  item: TMDBMovie;
  onClose: () => void;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  runtime: number;
  air_date: string;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  const [details, setDetails] = useState<TMDBMovie | null>(null);
  const [cast, setCast] = useState<TMDBCast[]>([]);
  const [similar, setSimilar] = useState<TMDBMovie[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const { activeProfile } = useProfile();

  const mediaType = getMediaType(item);
  const title = getTitle(item);

  const fetchDetails = useCallback(async () => {
    try {
      const [detailData, creditData, similarData, key] = await Promise.all([
        mediaType === "tv" ? tmdb.tvDetails(item.id) : tmdb.movieDetails(item.id),
        mediaType === "tv" ? tmdb.tvCredits(item.id) : tmdb.movieCredits(item.id),
        mediaType === "tv" ? tmdb.similarTV(item.id) : tmdb.similarMovies(item.id),
        getTrailerKey(item.id, mediaType),
      ]);

      setDetails(detailData);
      setCast(creditData.cast.slice(0, 12));
      setSimilar(similarData.results.slice(0, 12));
      setTrailerKey(key);

      if (mediaType === "tv") {
        try {
          const seasonData = await tmdb.tvSeason(item.id, 1);
          setEpisodes(seasonData.episodes || []);
        } catch {
          // no episodes
        }
      }
    } catch {
      // ignore
    }
  }, [item.id, mediaType]);

  const checkFavorite = useCallback(async () => {
    if (!activeProfile) return;
    try {
      const res = await api.favorites.check(activeProfile.id, item.id, mediaType);
      setIsFavorite(res.is_favorite);
    } catch {
      // ignore
    }
  }, [activeProfile, item.id, mediaType]);

  useEffect(() => {
    fetchDetails();
    checkFavorite();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fetchDetails, checkFavorite]);

  const handleSeasonChange = async (season: number) => {
    setSelectedSeason(season);
    try {
      const data = await tmdb.tvSeason(item.id, season);
      setEpisodes(data.episodes || []);
    } catch {
      setEpisodes([]);
    }
  };

  const toggleFavorite = async () => {
    if (!activeProfile) return;
    try {
      if (isFavorite) {
        await api.favorites.remove(activeProfile.id, item.id, mediaType);
        setIsFavorite(false);
      } else {
        await api.favorites.add(activeProfile.id, item.id, mediaType);
        setIsFavorite(true);
      }
    } catch {
      // ignore
    }
  };

  const d = details || item;
  const genres = d.genres?.map((g) => g.name).join(", ") || "";
  const numSeasons = d.number_of_seasons || 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex justify-center overflow-y-auto py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[850px] bg-[#181818] rounded-lg shadow-2xl animate-scale-in my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-white hover:bg-[#333] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Section */}
        <div className="relative w-full aspect-video">
          {trailerKey ? (
            <TrailerPlayer videoKey={trailerKey} className="w-full h-full" />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={tmdb.backdropUrl(d.backdrop_path)}
                alt={title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-[#181818] to-transparent" />

          <div className="absolute bottom-6 left-6 z-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 drop-shadow-lg">{title}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded hover:bg-white/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </button>
              <button
                onClick={toggleFavorite}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isFavorite
                    ? "border-white text-white bg-white/20"
                    : "border-[#808080] text-white hover:border-white"
                }`}
              >
                {isFavorite ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={3} fill="none" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
              <button className="w-10 h-10 rounded-full border-2 border-[#808080] text-white flex items-center justify-center hover:border-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 text-sm">
                <span className="text-[#46d369] font-semibold">
                  {Math.round(d.vote_average * 10)}% Match
                </span>
                <span className="text-[#bcbcbc]">{getYear(d)}</span>
                {d.runtime && (
                  <span className="text-[#bcbcbc]">
                    {Math.floor(d.runtime / 60)}h {d.runtime % 60}m
                  </span>
                )}
                {numSeasons > 0 && (
                  <span className="text-[#bcbcbc]">
                    {numSeasons} Season{numSeasons !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="px-1.5 py-0.5 border border-[#808080] text-[#bcbcbc] text-xs">
                  HD
                </span>
              </div>

              {d.tagline && (
                <p className="text-lg italic text-[#808080] mb-3">{d.tagline}</p>
              )}

              <p className="text-sm text-[#d2d2d2] leading-relaxed">
                {d.overview}
              </p>
            </div>

            <div className="w-full md:w-[260px] text-sm space-y-2">
              {cast.length > 0 && (
                <p className="text-[#777]">
                  <span className="text-[#777]">Cast: </span>
                  <span className="text-white">
                    {cast
                      .slice(0, 4)
                      .map((c) => c.name)
                      .join(", ")}
                    {cast.length > 4 && ", more..."}
                  </span>
                </p>
              )}
              {genres && (
                <p className="text-[#777]">
                  <span className="text-[#777]">Genres: </span>
                  <span className="text-white">{genres}</span>
                </p>
              )}
            </div>
          </div>

          {/* Episodes (TV Shows) */}
          {mediaType === "tv" && numSeasons > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Episodes</h3>
                <select
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                  className="bg-[#242424] text-white border border-[#404040] rounded px-3 py-1.5 text-sm outline-none"
                >
                  {Array.from({ length: numSeasons }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Season {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex gap-4 p-3 rounded hover:bg-[#333] transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 text-xl text-[#d2d2d2] w-8 text-center pt-2">
                      {ep.episode_number}
                    </div>
                    <div className="relative flex-shrink-0 w-[130px] h-[73px] rounded overflow-hidden bg-[#333]">
                      {ep.still_path ? (
                        <Image
                          src={tmdb.imgUrl(ep.still_path, "w300")}
                          alt={ep.name}
                          fill
                          className="object-cover"
                          sizes="130px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{ep.name}</h4>
                        {ep.runtime > 0 && (
                          <span className="text-[#d2d2d2] text-xs ml-2 flex-shrink-0">{ep.runtime}m</span>
                        )}
                      </div>
                      <p className="text-xs text-[#d2d2d2] line-clamp-2">{ep.overview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This */}
          {similar.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">More Like This</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {similar.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#2f2f2f] rounded overflow-hidden cursor-pointer hover:brightness-125 transition"
                  >
                    <div className="relative aspect-video">
                      {(s.backdrop_path || s.poster_path) ? (
                        <Image
                          src={tmdb.imgUrl(s.backdrop_path || s.poster_path, "w500")}
                          alt={getTitle(s)}
                          fill
                          className="object-cover"
                          sizes="280px"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#333]" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#46d369] text-xs font-semibold">
                          {Math.round(s.vote_average * 10)}%
                        </span>
                        <span className="text-[#bcbcbc] text-xs">{getYear(s)}</span>
                      </div>
                      <p className="text-xs text-[#d2d2d2] line-clamp-3">{s.overview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Cast</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {cast.map((c) => (
                  <div key={c.id} className="text-center">
                    <div className="relative w-full aspect-square rounded-full overflow-hidden bg-[#333] mb-2">
                      {c.profile_path ? (
                        <Image
                          src={tmdb.imgUrl(c.profile_path, "w185")}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-[#808080]">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-[#777] truncate">{c.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
