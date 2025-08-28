"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { getFriends } from '../../lib/friendsClient';

const Sidebar: React.FC = () => {
  return (
    <div className='w-24 h-screen p-2 justify-between flex flex-col gap-5'>
      <div className='bg-[#0F0F0F] flex flex-1 rounded-full flex-col border border-[#595959]/30 items-center p-5 justify-between gap-10'>
      <Image src="/logo.png" alt="Logo of Anime Astral" priority width={40} height={40} />


      {/* Links */}
      <ul className='flex flex-col gap-5'>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard'><Image src="/compass.svg" alt='Browser' width={20} height={20} /></Link>
        </li>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard'><Image src="/collection-play.svg" alt='Browser' width={20} height={20} /></Link>
        </li>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard/friends'><Image src="/people.svg" alt='Friends' width={20} height={20} /></Link>
        </li>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard'><Image src="/filter.svg" alt='Browser' width={20} height={20} /></Link>
        </li>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard'><Image src="/display.svg" alt='Browser' width={20} height={20} /></Link>
        </li>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard'><Image src="/book.svg" alt='Browser' width={20} height={20} /></Link>
        </li>
      </ul>

      {/* Friends avatars (first 4) */}
      <FriendsAvatars />
      </div>

      {/* Settings/Help & Donate */}
      <div className='bg-[#0F0F0F] flex flex-1 max-h-[25%]  rounded-full flex-col border border-[#595959]/30 items-center justify-between p-5'>
      <ul className='flex flex-col gap-5'>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard'><Image src="/settings.svg" alt='Browser' width={20} height={20} /></Link>
        </li>
        <li className="transition-transform duration-150 hover:scale-110">
          <Link href='/dashboard'><Image src="/question-circle.svg" alt='Browser' width={20} height={20} /></Link>
        </li>
      </ul>

      <div className='w-14 h-14 rounded-full bg-[#BC281C] flex items-center justify-center'>
      <Link href='/dashboard'><Image src="/lightning-charge.svg" alt='Browser' width={20} height={20} /></Link>
      </div>
      </div>
    </div>
  );
};

export default Sidebar;

function FriendsAvatars() {
  type FriendUser = { id: string; avatar_url: string | null; display_name: string | null; username: string | null };
  const [friends, setFriends] = useState<FriendUser[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { friends } = await getFriends();
        setFriends((friends || []).slice(0, 4));
      } catch {
        setFriends([]);
      }
    })();
  }, []);

  const slots = 4;
  const items: (FriendUser | null)[] = [...friends];
  while (items.length < slots) items.push(null);

  return (
    <div className="flex flex-col gap-2">
      {items.map((u, idx) => (
        <div key={idx} className="transition-transform duration-150 hover:scale-110 hover:rotate-6">
          {u ? (
            <Image
              src={u.avatar_url || "/default-profile.png"}
              alt={u.display_name || u.username || "Friend"}
              width={25}
              height={25}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-[25px] h-[25px] rounded-full bg-white/10 border border-white/10" />
          )}
        </div>
      ))}
    </div>
  );
}