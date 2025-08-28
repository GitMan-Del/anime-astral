import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

// List incoming and outgoing requests
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [{ data: incoming }, { data: outgoing }] = await Promise.all([
    supabaseAdmin
      .from("friend_requests")
      .select("id, sender_id, receiver_id, status, created_at")
      .eq("receiver_id", userId)
      .eq("status", "pending"),
    supabaseAdmin
      .from("friend_requests")
      .select("id, sender_id, receiver_id, status, created_at")
      .eq("sender_id", userId)
      .eq("status", "pending"),
  ]);

  return NextResponse.json({ incoming: incoming ?? [], outgoing: outgoing ?? [] });
}

// Send a request by receiverId
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  let { receiverId } = body as { receiverId?: string; code?: string };
  const code = (body as { receiverId?: string; code?: string }).code;

  if (!receiverId && code) {
    const { data: userByCode } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("friend_code", code)
      .single();
    receiverId = userByCode?.id;
  }

  if (!receiverId) {
    return NextResponse.json({ error: "Missing receiverId or code" }, { status: 400 });
  }

  if (receiverId === session.user.id) {
    return NextResponse.json({ error: "You cannot add yourself" }, { status: 400 });
  }

  // prevent duplicates or if already friends
  const [{ data: existingReq }, { data: existingFriendship }] = await Promise.all([
    supabaseAdmin
      .from("friend_requests")
      .select("id, status")
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`)
      .in("status", ["pending", "accepted"])
      .maybeSingle(),
    supabaseAdmin
      .from("friendships")
      .select("id")
      .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${session.user.id})`)
      .maybeSingle(),
  ]);

  if (existingReq || existingFriendship) {
    return NextResponse.json({ error: "Already pending or friends" }, { status: 400 });
  }

  // insert via admin (or ensure RLS insert policy exists)
  const { error } = await supabaseAdmin.from("friend_requests").insert({
    sender_id: session.user.id,
    receiver_id: receiverId,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send request", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}


