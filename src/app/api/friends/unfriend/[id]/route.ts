import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

// Context corect: params este Promise
type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // await pe params

  // verifică existența prieteniei și proprietatea
  const { data: fs, error: fsErr } = await supabaseAdmin
    .from("friendships")
    .select("id, user1_id, user2_id")
    .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
    .filter("id", "eq", id)
    .single();

  if (fsErr || !fs) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // opțional: verifică că userul e parte din relație
  if (fs.user1_id !== session.user.id && fs.user2_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: delErr } = await supabaseAdmin
    .from("friendships")
    .delete()
    .eq("id", id);

  if (delErr) {
    return NextResponse.json({ error: "Failed to unfriend" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
