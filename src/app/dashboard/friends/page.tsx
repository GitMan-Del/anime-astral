"use client";

import Sidebar from "../../components/Sidebar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Header from "../../components/Header";
import FriendSystem from '../../components/FriendSystem';

export default function FriendsPage() {
  const { data: session } = useSession();
  
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="bg-[#0F0F0F] flex h-screen">
      {/* Sidebar în stânga */}
      <div>
        <Sidebar />
      </div>
    
      {/* Container pentru Header și conținut */}
      <div className="flex-1 flex flex-col">
        {/* Header sus */}
        <div className="h-fit">
          <Header />
        </div>
    
        {/* Conținutul friends system */}
        <div className="flex-1 overflow-y-auto bg-[#0F0F0F] p-6">
          <FriendSystem />
        </div>
      </div>
    </div>
  );
}
