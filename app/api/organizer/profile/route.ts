import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizerId");

    if (!organizerId) {
      return NextResponse.json({ error: "Missing organizerId" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, organization, display_name, links")
      .eq("id", organizerId)
      .maybeSingle();

    return NextResponse.json({
      organizationName:
        profile?.business_name ||
        profile?.organization ||
        profile?.display_name ||
        null,
      links: profile?.links ?? {},
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const organizerId = body?.organizerId as string | undefined;
    const name = body?.name as string | undefined;
    const location = body?.location as string | undefined;
    const organization_name = body?.organization_name as string | undefined;
    const links = body?.links as Record<string, string> | undefined;

    if (!organizerId) {
      return NextResponse.json({ error: "Missing organizerId" }, { status: 400 });
    }

    if (user.id !== organizerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof name === "string") {
      updatePayload.business_name = name.trim();
    }

    if (typeof organization_name === "string") {
      updatePayload.organization = organization_name.trim();
    }

    if (typeof location === "string") {
      updatePayload.location = location.trim();
    }

    if (links && typeof links === "object") {
      updatePayload.links = links;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", organizerId)
      .select("id, business_name, organization, location, links, updated_at")
      .single();

    if (error) {
      console.error("PATCH /api/organizer/profile error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err: any) {
    console.error("PATCH /api/organizer/profile crashed:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}