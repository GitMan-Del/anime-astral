import { LogOut, Copy, Check, Settings, User as UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserProfile() {
    const { data: session, status } = useSession();
    const defaultImage = "/default-profile.png";
    const [profile, setProfile] = useState<{ display_name: string | null; username: string | null; friend_code: string | null } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/me/profile", { cache: "no-store" });
                if (!res.ok) return;
                const json = await res.json();
                setProfile(json.profile ?? null);
            } catch {
                setProfile(null);
            }
        })();
    }, []);

    return (
        <div className="absolute top-10 right-4 md:right-14 z-50 drop-shadow-lg">
            <div className="w-[92vw] max-w-[320px] min-w-[260px] min-h-[250px] bg-[#181818] border border-[#595959]/30 rounded-xl text-white p-4 flex flex-col justify-between shadow-lg">
                {status === "loading" ? (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-white"></div>
                    </div>
                ) : !session?.user ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2">
                        <Image
                            src={defaultImage}
                            width={48}
                            height={48}
                            alt="Default User"
                            className="rounded-full opacity-60"
                        />
                        <span className="text-sm text-gray-400">Nu ești autentificat</span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4">
                            <Image
                                src={String(session.user.image || defaultImage)}
                                width={48}
                                height={48}
                                alt={session.user.name || "User Profile"}
                                priority
                                unoptimized
                                className="rounded-full border border-[#595959]/40"
                            />
                            <div className="flex flex-col">
                                <h1 className="text-base font-semibold truncate max-w-[180px]">{profile?.display_name || session.user.name || "Nume necunoscut"}</h1>
                                <p className="text-xs text-gray-400 truncate max-w-[180px]">{profile?.username ? `@${profile.username}` : (session.user.email || "Email necunoscut")}</p>
                            </div>
                        </div>
                        <hr className="my-4 border-[#595959]/30" />
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                                <span className="text-[11px] text-white/50">Friend code</span>
                                <span className="text-sm tracking-wider font-medium">{profile?.friend_code || "— — — — — — — —"}</span>
                            </div>
                            <button
                                disabled={!profile?.friend_code}
                                onClick={async () => {
                                    if (!profile?.friend_code) return;
                                    await navigator.clipboard.writeText(profile.friend_code);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1200);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs"
                                aria-label="Copy friend code"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copiat" : "Copiază"}
                            </button>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link href="/dashboard" className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm">
                                <UserIcon size={16} /> Profil
                            </Link>
                            <Link href="/dashboard" className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm">
                                <Settings size={16} /> Setări
                            </Link>
                        </div>
                        <button
                            className="text-[#BC281C] text-sm flex flex-row gap-2 items-center justify-center hover:cursor-pointer hover:scale-105 transition-transform duration-150 font-medium"
                            onClick={() => signOut()}
                            aria-label="Sign out"
                        >
                            <LogOut color="#BC281C" size={20} />
                            Deconectează-te
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}