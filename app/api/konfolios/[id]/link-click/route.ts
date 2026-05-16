import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: konfolioId } = await params;

    if (!konfolioId) {
      return NextResponse.json(
        { error: "Missing konfolio id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const visitorId =
      typeof body?.visitorId === "string" ? body.visitorId : null;

    const linkKey =
      typeof body?.linkKey === "string" ? body.linkKey : null;

    const label =
      typeof body?.label === "string" ? body.label : null;

    const url =
      typeof body?.url === "string" ? body.url : null;

    if (!url) {
      return NextResponse.json(
        { error: "Missing link URL" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("track_konfolio_link_click", {
      p_konfolio_id: konfolioId,
      p_visitor_id: visitorId,
      p_link_key: linkKey,
      p_label: label,
      p_url: url,
    });

    if (error) {
      console.error("[TRACK LINK CLICK ERROR]", error);
      return NextResponse.json(
        { error: "Failed to track link click" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      link_click_count: data,
    });
  } catch (err) {
    console.error("[TRACK LINK CLICK ROUTE ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}