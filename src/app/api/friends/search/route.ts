import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // Use admin client to bypass RLS for server-side lookup by friend_code
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, username, display_name, avatar_url, friend_code")
    .eq("friend_code", code)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.id === session.user.id) {
    return NextResponse.json({ error: "You cannot add yourself" }, { status: 400 });
  }

  return NextResponse.json({ user });
}


