"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";
import UserProfile from "./Userprofile";


export default function Header() {
  const { data: session, status } = useSession();

  const [isopen ,setisOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const defaultImage = "/default-profile.png"; // Uniformizat cu Sidebar și NextAuth
  const profileImage = session?.user?.image || defaultImage;

  return (
    <div className="w-full h-16 flex items-center justify-between px-4 md:px-6 gap-6">
      {/* Mobile hamburger */}
      <div className="md:hidden flex items-center">
        <button
          aria-label="Open sidebar"
          className="p-2 rounded-md bg-white/10 text-white hover:bg-white/20"
          onClick={() => setMobileOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12zm.75 4.5a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75z" clipRule="evenodd" />
          </svg>
        </button>
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
      {/* Link-uri pentru notificări și Discord */}
      <div className="flex items-center gap-4 ml-auto">
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
        (
          <Image
            src={String(profileImage)}
            width={40}
            height={40}
            alt={session?.user?.name || "User Profile"}
            priority
            unoptimized
            className="rounded-full hover:cursor-pointer"
            onClick={() => setisOpen((prev) => !prev)}
          />
        )
      )}
    </div>
  );
}