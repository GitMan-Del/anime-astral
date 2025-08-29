import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();
  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  // Basic constraints mirrored client-side
  if (!/^[a-z0-9_\.]{3,20}$/.test(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  // Username is available if not taken or it's the current user's own username
  if (!existing || existing.id === session.user.id) {
    return NextResponse.json({ available: true });
  }
  return NextResponse.json({ available: false });
}


