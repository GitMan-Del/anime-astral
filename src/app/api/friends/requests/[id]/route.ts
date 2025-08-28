import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

type RouteParams = { id: string };

// Accept or reject request
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<RouteParams> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json(); // 'accept' | 'reject'
  if (!action || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { id: requestId } = await ctx.params; // await pe params

  const { data: fr, error: frErr } = await supabaseAdmin
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status")
    .eq("id", requestId)
    .single();

  if (frErr || !fr) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (fr.receiver_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (fr.status !== "pending") {
    return NextResponse.json({ error: "Already handled" }, { status: 400 });
  }

  if (action === "reject") {
    const { error } = await supabaseAdmin
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);
    if (error) {
      return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // accept
  const { error: upErr } = await supabaseAdmin
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);
  if (upErr) {
    return NextResponse.json({ error: "Failed to accept" }, { status: 500 });
  }

  // create friendship (ordered pair)
  const user1 = fr.sender_id < fr.receiver_id ? fr.sender_id : fr.receiver_id;
  const user2 = fr.sender_id < fr.receiver_id ? fr.receiver_id : fr.sender_id;

  const { error: insErr } = await supabaseAdmin
    .from("friendships")
    .insert({ user1_id: user1, user2_id: user2 });
  if (insErr) {
    return NextResponse.json({ error: "Failed to create friendship" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Cancel request (sender only) or delete (cleanup)
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<RouteParams> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await ctx.params;

  const { data: fr, error: fetchError } = await supabaseAdmin
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status")
    .eq("id", requestId)
    .single();

  if (fetchError || !fr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (fr.sender_id !== session.user.id && fr.receiver_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("friend_requests")
    .delete()
    .eq("id", requestId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
