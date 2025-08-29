import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("display_name, username, friend_code, avatar_url, banner_url, bio, discord, twitch, steam, twitter")
    .eq("id", session.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }

  if (!data) return NextResponse.json({ profile: null });

  // If stored paths are in a private bucket, return signed urls for client display
  const bucket = "user-media";
  type UserProfileRow = typeof data & { banner_url?: string | null };
  const result: Partial<UserProfileRow> = { ...data };
  const toSign: { key: keyof UserProfileRow; path: string | null }[] = [
    { key: "avatar_url", path: (data as UserProfileRow).avatar_url as unknown as string | null },
    { key: "banner_url", path: (data as UserProfileRow).banner_url ?? null },
  ];
  for (const item of toSign) {
    if (item.path && !String(item.path).startsWith("http")) {
      const { data: signed } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(item.path, 60 * 60);
      if (signed?.signedUrl) result[item.key] = signed.signedUrl;
    }
  }

  return NextResponse.json({ profile: result });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const payload: Record<string, unknown> = {};
  if (typeof body.username === "string") payload.username = body.username;
  if (typeof body.display_name === "string") payload.display_name = body.display_name;
  if (typeof body.avatar_url === "string") payload.avatar_url = body.avatar_url;
  if (typeof body.banner_url === "string") payload.banner_url = body.banner_url;
  if (typeof body.bio === "string") payload.bio = body.bio;
  if (typeof body.discord === "string") payload.discord = body.discord;
  if (typeof body.twitch === "string") payload.twitch = body.twitch;
  if (typeof body.steam === "string") payload.steam = body.steam;
  if (typeof body.twitter === "string") payload.twitter = body.twitter;

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update(payload)
    .eq("id", session.user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}


