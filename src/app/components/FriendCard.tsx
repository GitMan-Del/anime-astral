"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

type FriendUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  friend_code: string | null;
  bio?: string | null;
  followingCount?: number;
  followersCount?: number;
  isVerified?: boolean;
};

export default function FriendCard({
  user,
  primaryActionLabel,
  onPrimaryAction,
}: {
  user: FriendUser;
  primaryActionLabel?: string;
  onPrimaryAction?: (userId: string) => Promise<void> | void;
}) {
  const name = user.display_name || user.username || "Utilizator";
  const avatar = user.avatar_url || "/default-profile.png";
  const banner = "/banner.png";
  const friendCode = user.friend_code ? `#${user.friend_code}` : "";
  const bio =
    user.bio ||
    "Pasionat de anime , it si tot ce tine de lucruri noi. 16 ani si ambitios";
  const following = user.followingCount ?? 832;
  const followers = user.followersCount ?? 22900;
  const isVerified = user.isVerified ?? true;

  return (
    <div className="bg-[#0F0F0F] border border-[#595959]/25 rounded-xl p-0 w-[320px] h-[370px] relative shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Banner */}
      <div className="relative w-full rounded-t-xl overflow-hidden">
        <Image
          src={banner}
          alt="banner"
          width={200}
          height={150}
          className="object-fill w-full"
          priority
        />
        {/* Social icons row */}
        <div className="absolute bottom-2 right-2 flex gap-3 z-20">
          {/* Main social icons group */}
          <div className="flex gap-3 bg-[#181818] rounded-xl px-4 py-2 shadow-lg">
            <Image src="/discord.svg" alt="Discord" width={15} height={15} />
            <Image src="/twitch.svg" alt="Twitch" width={15} height={15} />
            <Image src="/steam.svg" alt="Steam" width={15} height={15} />
            <Image src="/twitter.svg" alt="Twitter" width={15} height={15} />
          </div>
          {/* Plus icon (add friend) */}
          <div className="flex gap-2">
            <div className="bg-[#181818] rounded-xl p-2 flex items-center justify-center shadow-lg">
              <Image src="/Follow.svg" alt="Follow" width={15} height={15} />
            </div>
            {/* Profile plus icon = "Trimite cerere" */}
            {primaryActionLabel && onPrimaryAction && (
              <button
                className="bg-[#181818] rounded-xl p-2 flex items-center justify-center shadow-lg hover:bg-[#232323] transition-colors"
                title="Trimite cerere"
                onClick={() => onPrimaryAction(user.id)}
                aria-label="Trimite cerere"
                type="button"
              >
                <Image src="/Add_Friend.svg" alt="Trimite cerere" width={15} height={15} />
              </button>
            )}
          </div>
        </div>
      </div>
             
      {/* Avatar */}
      <div className="absolute left-5 top-[70px] z-20">
        <div className="rounded-full border-4 border-[#0F0F0F] bg-[#181818] w-[70px] h-[70px] flex items-center justify-center shadow-lg">
          <Image
            src={avatar}
            alt="avatar"
            width={64}
            height={64}
            className="rounded-full object-cover w-[64px] h-[64px]"
          />
        </div>
      </div>
      {/* Card Content */}
      <div className="pt-16 px-5 pb-4 flex flex-col h-[calc(100%-110px)] justify-between">
        <div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-white">{name}</span>
            {isVerified && (
              <CheckCircle2 className="w-5 h-5 text-[#3BA1FF]" fill="#3BA1FF" />
            )}
          </div>
          <div className="text-[#A3A3A3] text-sm font-medium">{friendCode}</div>
          <div className="mt-3 text-[#E6E6E6] text-[15px] leading-snug">
            {bio}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-[15px]">
          <span className="font-semibold text-white">{following.toLocaleString()}</span>
          <span className="text-[#A3A3A3]">Following</span>
          <span className="text-[#A3A3A3] font-bold px-1">|</span>
          <span className="font-semibold text-white">{(followers / 1000).toFixed(1)}K</span>
          <span className="text-[#A3A3A3]">Followers</span>
        </div>
      </div>
    </div>
  );
}
       