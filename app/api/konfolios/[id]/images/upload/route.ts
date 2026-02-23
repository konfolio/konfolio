import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: konfolioId } = await ctx.params;

    // 1) Auth
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = userData.user.id;

    // 2) Ensure this konfolio belongs to the authed user
    const { data: k, error: kErr } = await supabaseAdmin
      .from("konfolios")
      .select("id,user_id")
      .eq("id", konfolioId)
      .maybeSingle();

    if (kErr) {
      return NextResponse.json({ error: kErr.message }, { status: 500 });
    }
    if (!k || k.user_id !== userId) {
      return NextResponse.json({ error: "Konfolio not found" }, { status: 404 });
    }

    // 3) Parse multipart/form-data
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file (field name must be 'file')" },
        { status: 400 }
      );
    }

    // 4) Compute path
    const ext = file.name.split(".").pop() || "png";
    const timestamp = Date.now();
    const path = `${userId}/${konfolioId}/images/${timestamp}.${ext}`;

    // 5) Upload
    const buf = await file.arrayBuffer();
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("konfolio-images")
      .upload(path, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false, // new file each time
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // 6) Public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("konfolio-images")
      .getPublicUrl(path);

    return NextResponse.json({ imageUrl: publicUrlData.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}