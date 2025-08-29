"use client";

import Sidebar from "../components/Sidebar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Header from "../components/Header";
// import AnimeHeroCard from "../components/AnimeHeroCard";
// import AnimeMiniCard from "../components/AnimeMiniCard";


export default function Dashboard() {

  const { data: session } = useSession()
  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="bg-[#0F0F0F] flex h-screen">
    {/* Sidebar în stânga (ascuns pe mobil) */}
    <div className="hidden md:block">
      <Sidebar />
    </div>
  
    {/* Container pentru Header și conținut */}
    <div className="flex-1 flex flex-col">
      {/* Header sus */}
      <div className="h-fit">
        <Header />
      </div>
  
      {/* Conținutul dashboard-ului */}
      <div className="flex-1 overflow-x-hidden">
        {/* Aici adaugi conținutul dashboard-ului */}
        <div className="p-4 text-white">
          {/* Exemplu de conținut */}
          <div className="w-[50%]">
          {/* <AnimeHeroCard id={"52588"} cover="/kaiju-no-8.png"/> */}
          </div>
          </div>
          <div>
            {/* <h2 className="text-2xl text-white font-bold mb-4">Recomandate</h2> */}
            {/* <div className="w-full grid grid-cols-5 grid-rows-3 gap-5">
              <AnimeMiniCard id={1} />
              <AnimeMiniCard id={52991} />
              <AnimeMiniCard id={195} />
              <AnimeMiniCard id={23755} />
              <AnimeMiniCard id={23755} />
              <AnimeMiniCard id={5114} />
              <AnimeMiniCard id={11061} />
              <AnimeMiniCard id={30276} />
              <AnimeMiniCard id={9253} />
              <AnimeMiniCard id={1535} />
              <AnimeMiniCard id={16498} />
              <AnimeMiniCard id={28851} />
              <AnimeMiniCard id={11757} />
              <AnimeMiniCard id={19815} />
              <AnimeMiniCard id={38000} />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}