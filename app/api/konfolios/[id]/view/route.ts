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

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const konfolioId = typeof id === "string" ? id.trim() : "";

    if (!konfolioId || !isValidUuid(konfolioId)) {
      return NextResponse.json(
        { error: "Invalid konfolio id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const visitorId =
      typeof body?.visitorId === "string" ? body.visitorId : null;

    const referrer =
      typeof body?.referrer === "string" ? body.referrer : null;

    const userAgent = req.headers.get("user-agent");

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("track_konfolio_view", {
      p_konfolio_id: konfolioId,
      p_visitor_id: visitorId,
      p_user_agent: userAgent,
      p_referrer: referrer,
    });

    if (error) {
      console.error("[TRACK VIEW ERROR]", error);
      return NextResponse.json(
        { error: "Failed to track view" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics: Array.isArray(data) ? data[0] ?? null : data ?? null,
    });
  } catch (err) {
    console.error("[TRACK VIEW ROUTE ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}