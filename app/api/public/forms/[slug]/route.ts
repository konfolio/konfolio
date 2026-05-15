import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: form, error } = await supabase
      .from("alley_forms")
      .select(`
        id,
        organizer_id,
        title,
        description,
        slug,
        status,
        event_date_start,
        event_date_end,
        event_address,
        cover_image_url,
        application_limit,
        fields,
        published_at,
        created_at,
        updated_at
      `)
      .eq("slug", slug)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.status === "draft") {
      return NextResponse.json(
        { error: "This form has not been published yet" },
        { status: 404 }
      );
    }

    return NextResponse.json({ form });
  } catch (err: any) {
    console.error("GET /api/public/forms/[slug] failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load form" },
      { status: 500 }
    );
  }
}