"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import UserProfile from "./Userprofile";


export default function Header() {
  const { data: session, status } = useSession();

  const [isopen ,setisOpen] = useState(false)

  const defaultImage = "public/default-avatar.png"; // Uniformizat cu Sidebar și NextAuth
  const profileImage = session?.user?.image || defaultImage;

  return (
    <div className="w-full h-16 flex items-center justify-end px-6 gap-6">
      {/* Link-uri pentru notificări și Discord */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" aria-label="Notifications">
          <Image src="/bell-fill.svg" alt="Notifications" width={16} height={16} />
        </Link>
        <Link href="/dashboard" aria-label="Discord">
          <Image src="/discord.svg" alt="Discord" width={16} height={16} />
        </Link>
      </div>

      <>
        {isopen && <UserProfile />}
      </>

      {/* Poza de profil */}
      {status === "loading" ? (
        <div className="w-10 h-10 rounded-full bg-gray-600 animate-pulse" />
      ) : (
        <Image
        src={profileImage}
        width={40}
        height={40}
        alt={session?.user?.name || "User Profile"}
        priority
        className="rounded-full hover:cursor-pointer"
        onClick={() => setisOpen((prev) => !prev)}
        />
      )}
    </div>
  );
}