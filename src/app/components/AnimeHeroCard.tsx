"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  JikanAnimeFull,
  JikanFullResponse,
  JikanImageSet,
} from "@/types/jikan";

type Props = {
  id: string | number;
  cover?: string; // imagine custom din /public sau URL extern
};

function primaryImage(images?: JikanImageSet): string | undefined {
  return (
    images?.webp?.large_image_url ||
    images?.jpg?.large_image_url ||
    images?.webp?.image_url ||
    images?.jpg?.image_url
  );
}

function simplifyRating(r?: string | null): string {
  if (!r) return "—";
  if (r.startsWith("PG-13")) return "+13";
  if (r.startsWith("R - 17")) return "+17";
  if (r.startsWith("R+")) return "+17";
  if (r.startsWith("Rx")) return "+18";
  if (r.startsWith("PG ")) return "+7";
  if (r.startsWith("G")) return "All";
  return r;
}

export default function AnimeHeroCard({ id, cover }: Props) {
  const [data, setData] = useState<JikanAnimeFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/anime/${id}/full`); // cache Next.js activ
        const json: JikanFullResponse | { error?: string } = await res.json();
        if (aborted) return;
        if (!res.ok) {
          setError(("error" in json && json.error) || `HTTP ${res.status}`);
          setData(null);
          return;
        }
        setData((json as JikanFullResponse).data);
      } catch (e) {
        if (!aborted) setError(e instanceof Error ? e.message : "Eroare necunoscută.");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [id]);

  if (loading && !data) return <div className="h-72 bg-gray-200 rounded-xl animate-pulse" />;
  if (error) return <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm">Eroare: {error}</div>;
  if (!data) return null;

  const coverImg = cover || primaryImage(data.images);
  const firstGenre = data.genres?.[0]?.name || "—";
  const rating = simplifyRating(data.rating);
  const year = data.year ?? "—";
  const season = data.season ?? "—";
  const score = data.score ?? "—";
  const episodes = data.episodes ?? "—";
  const seasonCount =
    data.relations?.filter((r) => r.relation === "Prequel" || r.relation === "Sequel")
      .flatMap((r) => r.entry).length ?? 0;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg">
      {coverImg ? (
        <Image src={coverImg} alt={data.title} width={1600} height={900} className="w-full h-80 object-cover" priority />
      ) : (
        <div className="w-full h-80 bg-gray-300" />
      )}

      {/* badges în coloană dreapta */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex justify-end">
        <div className="flex flex-col justify-center items-end p-6 gap-3 text-white text-sm min-w-[160px]">
          {[firstGenre, rating, `${season} ${year}`, `Scor: ${score}`, `Episoade: ${episodes}`].map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm shadow-sm text-xs font-medium"
            >
              {item}
            </span>
          ))}
          {seasonCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm shadow-sm text-xs font-semibold">
              Seasons: {seasonCount}
            </span>
          )}
        </div>
      </div>

      {/* titlu jos stânga */}
      <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
        <h2 className="text-3xl font-bold">{data.title}</h2>
        {!!data.title_english && <p className="text-sm opacity-80">{data.title_english}</p>}
      </div>
    </div>
  );
}
