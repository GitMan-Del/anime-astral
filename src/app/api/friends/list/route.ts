import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { data: rows, error } = await supabaseAdmin
    .from("friendships")
    .select("id, user1_id, user2_id, created_at")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const friendIds = (rows ?? []).map((f) => (f.user1_id === userId ? f.user2_id : f.user1_id));

  if (friendIds.length === 0) {
    return NextResponse.json({ friends: [] });
  }

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, username, display_name, avatar_url, friend_code")
    .in("id", friendIds);

  return NextResponse.json({ friends: users ?? [] });
}


