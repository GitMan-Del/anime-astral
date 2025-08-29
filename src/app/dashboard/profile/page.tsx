"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

type Profile = {
  display_name: string | null;
  username: string | null;
  friend_code: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  bio?: string | null;
  discord?: string | null;
  twitch?: string | null;
  steam?: string | null;
  twitter?: string | null;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    username: "",
    friend_code: "",
    avatar_url: "",
    banner_url: "",
    bio: "",
    discord: "",
    twitch: "",
    steam: "",
    twitter: "",
  });

  // Upload handlers removed in display-only redesign; re-add when enabling editor UI

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me/profile", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load");
        const { profile: p } = await res.json();
        setProfile((prev) => ({ ...prev, ...p }));
      } catch {
        setError("Nu am putut încărca profilul");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleUpload(file: File, type: "avatar" | "banner") {
    try {
      if (type === "avatar") {
        setUploadingAvatar(true);
      } else {
        setUploadingBanner(true);
      }
      // Instant local preview while upload runs
      const localPreview = URL.createObjectURL(file);
      if (type === "avatar") {
        setProfile((p) => ({ ...p, avatar_url: localPreview }));
      } else {
        setProfile((p) => ({ ...p, banner_url: localPreview }));
      }
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      const res = await fetch("/api/me/upload", { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        const message = json?.error || json?.detail || "Upload failed";
        setError(`Încărcarea fișierului a eșuat: ${message}`);
        throw new Error(message);
      }
      const url: string | null = json.url || null;
      const withCacheBust = (u: string | null) => {
        if (!u) return u;
        return u.includes("?") ? `${u}&v=${Date.now()}` : `${u}?v=${Date.now()}`;
      };
      if (type === "avatar") {
        setProfile((p) => ({ ...p, avatar_url: withCacheBust(url) || p.avatar_url }));
      } else {
        setProfile((p) => ({ ...p, banner_url: withCacheBust(url) || p.banner_url }));
      }
      // Revoke after swap; keep brief timeout so component re-renders first
      setTimeout(() => URL.revokeObjectURL(localPreview), 1000);
    } catch {
      setError("Încărcarea fișierului a eșuat");
    } finally {
      if (type === "avatar") {
        setUploadingAvatar(false);
      } else {
        setUploadingBanner(false);
      }
    }
  }


  return (
    <div className="bg-[#0F0F0F] flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-fit">
          <Header />
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 text-white">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-white/60">Se încarcă…</div>
            ) : (
              <>
                <div className="relative rounded-xl overflow-hidden border border-[#595959]/30 bg-[#181818]">
                  <div className="relative h-40 sm:h-56 md:h-64">
                    {profile.banner_url ? (
                      <Image key={String(profile.banner_url)} src={String(profile.banner_url)} alt="banner" fill sizes="100vw" className="object-cover" unoptimized />
                    ) : (
                      <Image key="default-banner" src="/banner.png" alt="banner" fill sizes="100vw" className="object-cover" />
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-3 z-10">
                    <div className="flex gap-3 bg-[#181818] rounded-xl px-4 py-2 border border-[#595959]/30">
                      <Image src="/discord.svg" alt="Discord" width={15} height={15} />
                      <Image src="/twitch.svg" alt="Twitch" width={15} height={15} />
                      <Image src="/steam.svg" alt="Steam" width={15} height={15} />
                      <Image src="/twitter.svg" alt="Twitter" width={15} height={15} />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <label className="bg-[#181818] rounded-lg px-3 py-1.5 border border-[#595959]/30 text-xs cursor-pointer">
                      {uploadingBanner ? "Se încarcă…" : "Schimbă banner"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleUpload(f, "banner");
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="-mt-8 sm:-mt-10 ml-6 z-30 ">
                  <div className="rounded-full border-4 border-[#0F0F0F] bg-[#181818] w-[70px] h-[70px] flex items-center justify-center shadow-lg">
                    <Image key={String(profile.avatar_url || "/default-profile.png")} src={String(profile.avatar_url || "/default-profile.png")} alt="avatar" width={64} height={64} className="rounded-full object-cover w-[64px] h-[64px]" unoptimized />
                  </div>
                  <div className="mt-2">
                    <label className="bg-white/10 rounded-md px-3 py-1.5 border border-white/15 text-xs cursor-pointer">
                      {uploadingAvatar ? "Se încarcă…" : "Schimbă avatar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleUpload(f, "avatar");
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-6 px-6 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold">{profile.display_name || "Username"}</span>
                    <CheckCircle2 className="w-5 h-5 text-[#3BA1FF]" fill="#3BA1FF" />
                  </div>
                  <div className="text-white/60 text-sm">
                    {profile.username ? `@${profile.username}` : null}
                    {profile.username && profile.friend_code ? " · " : null}
                    {profile.friend_code ? `#${profile.friend_code}` : null}
                  </div>
                  {profile.friend_code && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/90 text-xs px-3 py-1.5 rounded-full">
                      <span>Friend code: #{profile.friend_code}</span>
                      <button
                        className="opacity-80 hover:opacity-100"
                        onClick={async () => {
                          await navigator.clipboard.writeText(profile.friend_code || "");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        }}
                      >
                        {copied ? "Copiat" : "Copiază"}
                      </button>
                    </div>
                  )}
                  {error && (
                    <div className="text-red-400 text-xs mt-2">{error}</div>
                  )}
                </div>

               
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


