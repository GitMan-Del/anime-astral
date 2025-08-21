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
  cover?: string;    // /public/... sau URL
  avatar?: string;   // /public/... sau URL
  highlight?: boolean;
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

export default function AnimeMiniCard({ id, cover, avatar, highlight }: Props) {
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
    return () => { aborted = true; };
  }, [id]);

  if (loading && !data) {
    return <div className="h-64 bg-[#141414] border border-[#4D4D4D] rounded-3xl animate-pulse" />;
  }
  if (error) {
    return <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm">Eroare: {error}</div>;
  }
  if (!data) return null;

  const coverImg = cover || primaryImage(data.images);
  const title = data.title || "—";
  const genre = data.genres?.[0]?.name || "—";
  const rating = simplifyRating(data.rating);
  const subtitle = `${genre}, ${rating}`;

  return (
    // Wrapper pentru efectul de hover + cadrul punctat
    <div className="relative group inline-block hover:cursor-pointer">
      {/* Cardul principal */}
      <article
        className="relative z-10 bg-[#141414] text-zinc-50 rounded-3xl overflow-hidden shadow
                   border border-[#4D4D4D] w-full transform transition-transform duration-300
                   group-hover:-translate-x-2"
      >
        <div className="relative h-40 w-full">
          {coverImg ? (
            <Image src={coverImg} alt={title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold truncate">{title}</h3>
              <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
            </div>

            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-zinc-700">
                {avatar ? (
                  <Image src={avatar} alt="avatar" width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-zinc-700" />
                )}
              </div>
              {highlight && (
                <span className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-fuchsia-600 flex items-center justify-center ring-2 ring-[#141414]">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-white">
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Cadrul punctat identic, sub card */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-dashed border-[#4D4D4D]
                   opacity-0 group-hover:opacity-100 translate-x-2 translate-y-2 transition-all duration-300"
      />
    </div>
  );
}
