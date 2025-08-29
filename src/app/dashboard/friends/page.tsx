// app/friends/page.tsx
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../..//components/Header";
import FriendsPageClient from "./FriendsPageClient";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="bg-[#0F0F0F] flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-fit">
          <Header />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0F0F0F] p-6">
          <FriendsPageClient />
        </div>
      </div>
    </div>
  );
}
