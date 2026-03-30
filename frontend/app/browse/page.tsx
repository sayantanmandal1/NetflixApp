"use client";

import { useEffect, useState } from "react";
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

export default function BrowsePage() {
  const [billboardItems, setBillboardItems] = useState<TMDBMovie[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [topTen, setTopTen] = useState<TMDBMovie[]>([]);
  const [selectedItem, setSelectedItem] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
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
          tmdb.discoverMovies(28),   // Action
          tmdb.discoverMovies(35),   // Comedy
          tmdb.discoverMovies(27),   // Horror
          tmdb.discoverMovies(10749), // Romance
          tmdb.discoverMovies(99),   // Documentary
          tmdb.discoverMovies(878),  // Sci-Fi
        ]);

        setBillboardItems(trendingRes.results.slice(0, 5));
        setTopTen(popularRes.results.slice(0, 10));

        setRows([
          { title: "Trending Now", items: trendingRes.results },
          { title: "Popular on Netflix", items: popularRes.results, isLargeRow: true },
          { title: "Now Playing", items: nowPlayingRes.results },
          { title: "Top Rated", items: topRatedRes.results },
          { title: "Upcoming", items: upcomingRes.results },
          { title: "Trending TV Shows", items: trendingTVRes.results },
          { title: "Popular TV Shows", items: popularTVRes.results, isLargeRow: true },
          { title: "Top Rated TV Shows", items: topRatedTVRes.results },
          { title: "Action Movies", items: actionRes.results },
          { title: "Comedies", items: comedyRes.results },
          { title: "Horror Movies", items: horrorRes.results },
          { title: "Romance", items: romanceRes.results },
          { title: "Sci-Fi", items: sciFiRes.results },
          { title: "Documentaries", items: documentaryRes.results },
        ]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

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

      <div className="relative z-10 -mt-20 space-y-2">
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
            title="Top 10 Movies Today"
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
