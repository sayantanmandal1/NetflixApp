"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TMDBMovie, tmdb } from "@/app/lib/tmdb";
import Billboard from "@/app/components/Billboard";
import ContentRow from "@/app/components/ContentRow";
import TopTenRow from "@/app/components/TopTenRow";
import DetailModal from "@/app/components/DetailModal";

interface RowData {
  title: string;
  items: TMDBMovie[];
  isLargeRow?: boolean;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const contentType = searchParams.get("type"); // "tv", "movie", "new", or null (home)

  const [billboardItems, setBillboardItems] = useState<TMDBMovie[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [topTen, setTopTen] = useState<TMDBMovie[]>([]);
  const [selectedItem, setSelectedItem] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        if (contentType === "tv") {
          // TV Shows mode
          const [
            trendingTVRes,
            popularTVRes,
            topRatedTVRes,
            onTheAirRes,
            dramaTVRes,
            comedyTVRes,
            crimeTVRes,
            sciFiTVRes,
            animationTVRes,
            docTVRes,
          ] = await Promise.all([
            tmdb.trendingTV(),
            tmdb.popularTV(),
            tmdb.topRatedTV(),
            tmdb.onTheAir(),
            tmdb.discoverTV(18),      // Drama
            tmdb.discoverTV(35),      // Comedy
            tmdb.discoverTV(80),      // Crime
            tmdb.discoverTV(10765),   // Sci-Fi & Fantasy
            tmdb.discoverTV(16),      // Animation
            tmdb.discoverTV(99),      // Documentary
          ]);

          setBillboardItems(trendingTVRes.results.slice(0, 5).map(i => ({ ...i, media_type: "tv" })));
          setTopTen(popularTVRes.results.slice(0, 10).map(i => ({ ...i, media_type: "tv" })));

          setRows([
            { title: "Trending TV Shows", items: trendingTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Popular TV Shows", items: popularTVRes.results.map(i => ({ ...i, media_type: "tv" })), isLargeRow: true },
            { title: "Top Rated TV Shows", items: topRatedTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Currently Airing", items: onTheAirRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Drama TV Shows", items: dramaTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Comedy TV Shows", items: comedyTVRes.results.map(i => ({ ...i, media_type: "tv" })), isLargeRow: true },
            { title: "Crime TV Shows", items: crimeTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Sci-Fi & Fantasy", items: sciFiTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Animation", items: animationTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "TV Documentaries", items: docTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
          ]);
        } else if (contentType === "movie") {
          // Movies mode
          const [
            trendingRes,
            popularRes,
            topRatedRes,
            nowPlayingRes,
            upcomingRes,
            actionRes,
            comedyRes,
            horrorRes,
            romanceRes,
            sciFiRes,
            thrillerRes,
          ] = await Promise.all([
            tmdb.trending(),
            tmdb.popular(),
            tmdb.topRated(),
            tmdb.nowPlaying(),
            tmdb.upcoming(),
            tmdb.discoverMovies(28),
            tmdb.discoverMovies(35),
            tmdb.discoverMovies(27),
            tmdb.discoverMovies(10749),
            tmdb.discoverMovies(878),
            tmdb.discoverMovies(53),
          ]);

          setBillboardItems(trendingRes.results.slice(0, 5));
          setTopTen(popularRes.results.slice(0, 10));

          setRows([
            { title: "Trending Movies", items: trendingRes.results },
            { title: "Popular Movies", items: popularRes.results, isLargeRow: true },
            { title: "Top Rated Movies", items: topRatedRes.results },
            { title: "Now Playing", items: nowPlayingRes.results },
            { title: "Upcoming", items: upcomingRes.results },
            { title: "Action Movies", items: actionRes.results },
            { title: "Comedies", items: comedyRes.results, isLargeRow: true },
            { title: "Horror Movies", items: horrorRes.results },
            { title: "Romance", items: romanceRes.results },
            { title: "Sci-Fi", items: sciFiRes.results },
            { title: "Thrillers", items: thrillerRes.results },
          ]);
        } else if (contentType === "new") {
          // New & Popular mode
          const [
            trendingAllRes,
            trendingDayRes,
            nowPlayingRes,
            upcomingRes,
            onTheAirRes,
          ] = await Promise.all([
            tmdb.trendingAll(),
            tmdb.trendingAll("day"),
            tmdb.nowPlaying(),
            tmdb.upcoming(),
            tmdb.onTheAir(),
          ]);

          setBillboardItems(trendingDayRes.results.slice(0, 5));
          setTopTen(trendingAllRes.results.slice(0, 10));

          setRows([
            { title: "Trending Today", items: trendingDayRes.results },
            { title: "Trending This Week", items: trendingAllRes.results, isLargeRow: true },
            { title: "Worth the Wait", items: upcomingRes.results },
            { title: "Now in Cinemas", items: nowPlayingRes.results },
            { title: "New on TV", items: onTheAirRes.results.map(i => ({ ...i, media_type: "tv" })) },
          ]);
        } else {
          // Home (default)
          const [
            trendingRes,
            popularRes,
            topRatedRes,
            nowPlayingRes,
            upcomingRes,
            trendingTVRes,
            popularTVRes,
            topRatedTVRes,
            actionRes,
            comedyRes,
            horrorRes,
            romanceRes,
            documentaryRes,
            sciFiRes,
          ] = await Promise.all([
            tmdb.trendingAll(),
            tmdb.popular(),
            tmdb.topRated(),
            tmdb.nowPlaying(),
            tmdb.upcoming(),
            tmdb.trendingTV(),
            tmdb.popularTV(),
            tmdb.topRatedTV(),
            tmdb.discoverMovies(28),
            tmdb.discoverMovies(35),
            tmdb.discoverMovies(27),
            tmdb.discoverMovies(10749),
            tmdb.discoverMovies(99),
            tmdb.discoverMovies(878),
          ]);

          setBillboardItems(trendingRes.results.slice(0, 5));
          setTopTen(popularRes.results.slice(0, 10));

          setRows([
            { title: "Trending Now", items: trendingRes.results },
            { title: "Popular on Netflix", items: popularRes.results, isLargeRow: true },
            { title: "Now Playing", items: nowPlayingRes.results },
            { title: "Top Rated", items: topRatedRes.results },
            { title: "Upcoming", items: upcomingRes.results },
            { title: "Trending TV Shows", items: trendingTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Popular TV Shows", items: popularTVRes.results.map(i => ({ ...i, media_type: "tv" })), isLargeRow: true },
            { title: "Top Rated TV Shows", items: topRatedTVRes.results.map(i => ({ ...i, media_type: "tv" })) },
            { title: "Action Movies", items: actionRes.results },
            { title: "Comedies", items: comedyRes.results },
            { title: "Horror Movies", items: horrorRes.results },
            { title: "Romance", items: romanceRes.results },
            { title: "Sci-Fi", items: sciFiRes.results },
            { title: "Documentaries", items: documentaryRes.results },
          ]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [contentType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-[#141414] min-h-screen pb-20">
      {billboardItems.length > 0 && (
        <Billboard items={billboardItems} onMoreInfo={setSelectedItem} />
      )}

      <div className="relative z-10 -mt-[6vw]">
        {rows.slice(0, 2).map((row) => (
          <ContentRow
            key={row.title}
            title={row.title}
            items={row.items}
            onItemClick={setSelectedItem}
            isLargeRow={row.isLargeRow}
          />
        ))}

        {topTen.length > 0 && (
          <TopTenRow
            title={contentType === "tv" ? "Top 10 TV Shows Today" : "Top 10 Movies Today"}
            items={topTen}
            onItemClick={setSelectedItem}
          />
        )}

        {rows.slice(2).map((row) => (
          <ContentRow
            key={row.title}
            title={row.title}
            items={row.items}
            onItemClick={setSelectedItem}
            isLargeRow={row.isLargeRow}
          />
        ))}
      </div>

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </main>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
