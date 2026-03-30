import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(req.url);

    const organizerId = searchParams.get("organizerId");

    if (!organizerId) {
      return NextResponse.json({ error: "Missing organizerId" }, { status: 400 });
    }

    const { data: forms, error: formsErr } = await supabase
      .from("alley_forms")
      .select("id, organizer_id, title, description, is_open, created_at, updated_at")
      .eq("organizer_id", organizerId)
      .order("created_at", { ascending: false });

    if (formsErr) {
      console.error("formsErr:", formsErr);
      return NextResponse.json({ error: formsErr.message }, { status: 500 });
    }

    const formIds = (forms ?? []).map((form) => form.id);

    let countsByFormId: Record<string, number> = {};

    if (formIds.length > 0) {
      const { data: applications, error: appsErr } = await supabase
        .from("alley_applications")
        .select("id, form_id")
        .in("form_id", formIds);

      if (appsErr) {
        console.error("appsErr:", appsErr);
        return NextResponse.json({ error: appsErr.message }, { status: 500 });
      }

      for (const app of applications ?? []) {
        countsByFormId[app.form_id] = (countsByFormId[app.form_id] ?? 0) + 1;
      }
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, display_name, business_name, location, avatar_url")
      .eq("id", organizerId)
      .maybeSingle();

    if (profileErr) {
      console.error("profileErr:", profileErr);
    }

    const normalized =
      forms?.map((form) => ({
        id: form.id,
        title: form.title || "Untitled Form",
        status: form.is_open ? "receiving" : "closed",
        created_at: form.created_at,
        close_date: null,
        views: 0,
        applications_count: countsByFormId[form.id] ?? 0,
        description: form.description || "",
      })) ?? [];

    return NextResponse.json({
      profile: {
        id: organizerId,
        name:
          profile?.business_name ||
          profile?.display_name ||
          "Organization Name",
        location: profile?.location || "City, Country",
        avatar_url: profile?.avatar_url || null,
      },
      forms: normalized,
    });
  } catch (err: any) {
    console.error("GET /api/forms/mine crashed:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}