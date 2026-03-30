const TMDB_BASE = "/api/tmdb";

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: string;
  adult?: boolean;
  popularity: number;
  runtime?: number;
  number_of_seasons?: number;
  tagline?: string;
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${window.location.origin}${TMDB_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
  return res.json();
}

export const tmdb = {
  // Movies
  trending: (timeWindow: "day" | "week" = "week") =>
    tmdbFetch<TMDBResponse>(`/trending/movie/${timeWindow}`),
  trendingAll: (timeWindow: "day" | "week" = "week") =>
    tmdbFetch<TMDBResponse>(`/trending/all/${timeWindow}`),
  popular: () => tmdbFetch<TMDBResponse>("/movie/popular"),
  topRated: () => tmdbFetch<TMDBResponse>("/movie/top_rated"),
  nowPlaying: () => tmdbFetch<TMDBResponse>("/movie/now_playing"),
  upcoming: () => tmdbFetch<TMDBResponse>("/movie/upcoming"),

  // TV
  trendingTV: (timeWindow: "day" | "week" = "week") =>
    tmdbFetch<TMDBResponse>(`/trending/tv/${timeWindow}`),
  popularTV: () => tmdbFetch<TMDBResponse>("/tv/popular"),
  topRatedTV: () => tmdbFetch<TMDBResponse>("/tv/top_rated"),
  onTheAir: () => tmdbFetch<TMDBResponse>("/tv/on_the_air"),

  // Genre-based
  discoverMovies: (genreId: number) =>
    tmdbFetch<TMDBResponse>("/discover/movie", {
      with_genres: String(genreId),
      sort_by: "popularity.desc",
    }),
  discoverTV: (genreId: number) =>
    tmdbFetch<TMDBResponse>("/discover/tv", {
      with_genres: String(genreId),
      sort_by: "popularity.desc",
    }),

  // Details
  movieDetails: (id: number) => tmdbFetch<TMDBMovie>(`/movie/${id}`),
  tvDetails: (id: number) => tmdbFetch<TMDBMovie>(`/tv/${id}`),

  // Videos (trailers)
  movieVideos: (id: number) =>
    tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${id}/videos`),
  tvVideos: (id: number) =>
    tmdbFetch<{ results: TMDBVideo[] }>(`/tv/${id}/videos`),

  // Credits
  movieCredits: (id: number) =>
    tmdbFetch<{ cast: TMDBCast[] }>(`/movie/${id}/credits`),
  tvCredits: (id: number) =>
    tmdbFetch<{ cast: TMDBCast[] }>(`/tv/${id}/credits`),

  // Similar
  similarMovies: (id: number) => tmdbFetch<TMDBResponse>(`/movie/${id}/similar`),
  similarTV: (id: number) => tmdbFetch<TMDBResponse>(`/tv/${id}/similar`),
  recommendedMovies: (id: number) =>
    tmdbFetch<TMDBResponse>(`/movie/${id}/recommendations`),

  // Search
  search: (query: string, page = 1) =>
    tmdbFetch<TMDBResponse>("/search/multi", {
      query,
      page: String(page),
    }),

  // Genres
  movieGenres: () =>
    tmdbFetch<{ genres: TMDBGenre[] }>("/genre/movie/list"),
  tvGenres: () => tmdbFetch<{ genres: TMDBGenre[] }>("/genre/tv/list"),

  // TV Seasons
  tvSeason: (tvId: number, seasonNumber: number) =>
    tmdbFetch<{
      episodes: {
        id: number;
        name: string;
        overview: string;
        episode_number: number;
        still_path: string | null;
        runtime: number;
        air_date: string;
      }[];
    }>(`/tv/${tvId}/season/${seasonNumber}`),

  // Helpers
  imgUrl: (path: string | null, size = "w500") =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : "/no-image.png",
  backdropUrl: (path: string | null) =>
    path
      ? `https://image.tmdb.org/t/p/original${path}`
      : "/no-image.png",
};

export function getTitle(item: TMDBMovie): string {
  return item.title || item.name || item.original_title || item.original_name || "Untitled";
}

export function getYear(item: TMDBMovie): string {
  const date = item.release_date || item.first_air_date;
  return date ? date.substring(0, 4) : "";
}

export function getMediaType(item: TMDBMovie): "movie" | "tv" {
  if (item.media_type) return item.media_type as "movie" | "tv";
  if (item.first_air_date || item.name) return "tv";
  return "movie";
}

export async function getTrailerKey(
  id: number,
  mediaType: "movie" | "tv"
): Promise<string | null> {
  try {
    const data =
      mediaType === "tv"
        ? await tmdb.tvVideos(id)
        : await tmdb.movieVideos(id);
    const trailer = data.results.find(
      (v) => v.site === "YouTube" && v.type === "Trailer"
    );
    if (trailer) return trailer.key;
    const teaser = data.results.find(
      (v) => v.site === "YouTube" && v.type === "Teaser"
    );
    if (teaser) return teaser.key;
    const any = data.results.find((v) => v.site === "YouTube");
    return any?.key ?? null;
  } catch {
    return null;
  }
}
