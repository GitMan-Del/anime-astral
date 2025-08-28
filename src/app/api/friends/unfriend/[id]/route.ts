import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const otherId = params.id;

  const { data: friendship } = await supabase
    .from("friendships")
    .select("id, user1_id, user2_id")
    .or(`and(user1_id.eq.${userId},user2_id.eq.${otherId}),and(user1_id.eq.${otherId},user2_id.eq.${userId})`)
    .maybeSingle();

  if (!friendship) {
    return NextResponse.json({ error: "Not friends" }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from("friendships").delete().eq("id", friendship.id);
  if (error) {
    return NextResponse.json({ error: "Failed to unfriend" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}


