import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "konfolio-images";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: konfolioId } = await ctx.params;

    // 1) Authenticate the request
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "Missing Bearer token" },
        { status: 401 }
      );
    }

    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData.user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // 2) Confirm the user owns this Konfolio
    const { data: konfolio, error: konfolioErr } = await supabaseAdmin
      .from("konfolios")
      .select("id,user_id")
      .eq("id", konfolioId)
      .maybeSingle();

    if (konfolioErr) {
      return NextResponse.json(
        { error: konfolioErr.message },
        { status: 500 }
      );
    }

    if (!konfolio || konfolio.user_id !== userId) {
      return NextResponse.json(
        { error: "Konfolio not found" },
        { status: 404 }
      );
    }

    // 3) Receive only lightweight file metadata, not the actual image
    const body = await req.json();

    const contentType =
      typeof body.contentType === "string" ? body.contentType : "";

    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported image type" },
        { status: 400 }
      );
    }

    const extension = EXTENSION_BY_TYPE[contentType];
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const path = `${userId}/${konfolioId}/images/${uniqueName}`;

    // 4) Create permission for the browser to upload directly to Supabase
    const { data: signedUpload, error: signedUploadErr } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(path);

    if (signedUploadErr || !signedUpload) {
      return NextResponse.json(
        {
          error:
            signedUploadErr?.message ??
            "Could not create signed upload URL",
        },
        { status: 500 }
      );
    }

    // 5) Generate the eventual public image URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return NextResponse.json({
      path,
      token: signedUpload.token,
      imageUrl: publicUrlData.publicUrl,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}