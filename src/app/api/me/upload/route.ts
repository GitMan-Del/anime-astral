import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "user-media"; // Ensure this Supabase Storage bucket exists and is private

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const type = String(form.get("type") || "avatar"); // avatar | banner
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (type !== "avatar" && type !== "banner") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const path = `users/${session.user.id}/${type}.${ext}`;

  const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (upErr) {
    console.error("storage upload error", upErr);
    return NextResponse.json({ error: "Upload failed", detail: upErr.message }, { status: 500 });
  }

  // Update user field
  const column = type === "banner" ? "banner_url" : "avatar_url";
  const { error: dbErr } = await supabaseAdmin
    .from("users")
    .update({ [column]: path } as never)
    .eq("id", session.user.id);
  if (dbErr) {
    console.error("db update error", dbErr);
    return NextResponse.json({ error: "Failed to update user", detail: dbErr.message }, { status: 500 });
  }

  // Signed URL for immediate preview (1 hour)
  const { data: signed } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);

  return NextResponse.json({ ok: true, path, url: signed?.signedUrl || null });
}


