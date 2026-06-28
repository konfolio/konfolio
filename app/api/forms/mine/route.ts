import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(req.url);

    const organizerId = searchParams.get("organizerId");

    if (!organizerId) {
      return NextResponse.json(
        { error: "Missing organizerId" },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: forms, error: formsErr } = await supabase
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
        is_open,
        start_date,
        end_date,
        location,
        created_at,
        updated_at
      `)
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
        countsByFormId[app.form_id] =
          (countsByFormId[app.form_id] ?? 0) + 1;
      }
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select(
        "id, display_name, business_name, location, profile_image_url, organization, links, created_at"
      )
      .eq("id", organizerId)
      .maybeSingle();

    if (profileErr) {
      console.error("profileErr:", profileErr);
    }

    const normalized =
      forms?.map((form) => {
        // New status is preferred.
        // But this fallback keeps old forms working if they still relied on is_open.
        const normalizedStatus =
          form.status && form.status !== "draft"
            ? form.status
            : form.is_open
              ? "receiving"
              : form.status || "draft";

        return {
          id: form.id,
          organizer_id: form.organizer_id,
          title: form.title || "Untitled Form",
          description: form.description || "",

          slug: form.slug || null,
          public_url: form.slug ? `/apply/${form.slug}` : null,

          status: normalizedStatus,

          event_date_start: form.event_date_start || form.start_date || null,
          event_date_end: form.event_date_end || form.end_date || null,
          event_address: form.event_address || form.location || "",

          cover_image_url: form.cover_image_url || null,
          application_limit: form.application_limit ?? null,
          fields: form.fields || [],

          published_at: form.published_at || null,
          created_at: form.created_at,
          updated_at: form.updated_at,

          close_date: null,
          views: 0,
          applications_count: countsByFormId[form.id] ?? 0,
        };
      }) ?? [];

    return NextResponse.json({
      profile: {
        id: organizerId,
        name:
          profile?.business_name ||
          profile?.organization ||
          profile?.display_name ||
          "Organization Name",
        location: profile?.location || "City, Country",
        salesLocation: profile?.location || "",
        profile_image_url: profile?.profile_image_url || null,
        email: user?.email || null,
        created_at: profile?.created_at || null,
        organization_name:
          profile?.organization ||
          profile?.business_name ||
          profile?.display_name ||
          null,
        links: profile?.links ?? {},
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