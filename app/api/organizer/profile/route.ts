import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server configuration");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

// Keep generated organizer URLs away from common application routes.
// Add any additional top-level routes used by your app here.
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "apply",
  "auth",
  "dashboard",
  "explore",
  "forms",
  "login",
  "logout",
  "onboarding",
  "organizer",
  "organizers",
  "portfolio",
  "portfolios",
  "profile",
  "settings",
  "signin",
  "signup",
]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizerId");

    if (!organizerId) {
      return NextResponse.json(
        { error: "Missing organizerId" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("business_name, business_slug, organization, display_name, links")
      .eq("id", organizerId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      organizationName:
        profile?.business_name ||
        profile?.organization ||
        profile?.display_name ||
        null,
      business_slug: profile?.business_slug ?? null,
      links: profile?.links ?? {},
    });
  } catch (err) {
    console.error("GET /api/organizer/profile error:", err);

    return NextResponse.json(
      { error: "Unable to load organizer profile" },
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const organizerId = body.organizerId;

    if (typeof organizerId !== "string" || !organizerId) {
      return NextResponse.json(
        { error: "Missing organizerId" },
        { status: 400 },
      );
    }

    if (organizerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    for (const key of ["name", "organization_name", "location"]) {
      if (body[key] !== undefined && typeof body[key] !== "string") {
        return NextResponse.json(
          { error: `${key} must be a string` },
          { status: 400 },
        );
      }
    }

    let links: Record<string, string> | undefined;

    if (body.links !== undefined) {
      if (
        !body.links ||
        typeof body.links !== "object" ||
        Array.isArray(body.links) ||
        Object.values(body.links).some(
          (value) => typeof value !== "string",
        )
      ) {
        return NextResponse.json(
          { error: "links must contain string values" },
          { status: 400 },
        );
      }

      links = body.links as Record<string, string>;
    }

    const admin = createAdminClient();

    // Retry if another organizer claims the same slug at the same time.
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const { data: current, error: currentErr } = await supabase
        .from("profiles")
        .select("id, business_name, business_slug, organization")
        .eq("id", user.id)
        .maybeSingle();

      if (currentErr) {
        throw currentErr;
      }

      if (!current) {
        return NextResponse.json(
          { error: "Organizer profile not found" },
          { status: 404 },
        );
      }

      const businessName =
        typeof body.name === "string"
          ? body.name.trim()
          : String(current.business_name ?? "").trim();

      const organizationName =
        typeof body.organization_name === "string"
          ? body.organization_name.trim()
          : String(current.organization ?? "").trim();

      const organizerName = businessName || organizationName;

      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (typeof body.name === "string") {
        updatePayload.business_name = businessName;
      }

      if (typeof body.organization_name === "string") {
        updatePayload.organization = organizationName;
      }

      // Organizer setup may supply organization_name instead of name.
      // Fill an empty business_name from that organization name.
      if (!businessName && organizationName) {
        updatePayload.business_name = organizationName;
      }

      if (typeof body.location === "string") {
        updatePayload.location = body.location.trim();
      }

      if (links !== undefined) {
        updatePayload.links = links;
      }

      const needsSlug =
        current.business_slug === null ||
        current.business_slug === "";

      if (needsSlug) {
        if (!organizerName) {
          return NextResponse.json(
            {
              error:
                "Enter your organization name before saving your profile.",
            },
            { status: 400 },
          );
        }

        let baseSlug =
          slugify(organizerName) ||
          `organizer-${user.id.slice(0, 8)}`;

        if (RESERVED_SLUGS.has(baseSlug)) {
          baseSlug = `${baseSlug}-organizer`;
        }

        const candidate =
          attempt === 0
            ? baseSlug
            : `${baseSlug}-${attempt + 1}`;

        // Use the server client here so profiles hidden by RLS still
        // count when checking whether a URL is already taken.
        const { data: existing, error: existingErr } = await admin
          .from("profiles")
          .select("id")
          .eq("business_slug", candidate)
          .neq("id", user.id)
          .limit(1);

        if (existingErr) {
          throw existingErr;
        }

        if (existing && existing.length > 0) {
          continue;
        }

        updatePayload.business_slug = candidate;
      }

      let updateQuery = supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);

      if (needsSlug) {
        // Avoid overwriting a slug assigned by a simultaneous save.
        updateQuery =
          current.business_slug === null
            ? updateQuery.is("business_slug", null)
            : updateQuery.eq("business_slug", "");
      }

      const { data, error } = await updateQuery
        .select(
          "id, business_name, business_slug, organization, location, links, updated_at",
        )
        .maybeSingle();

      if (error) {
        // The database unique index handles simultaneous claims.
        if (needsSlug && error.code === "23505") {
          continue;
        }

        throw error;
      }

      if (!data) {
        if (needsSlug) {
          // Re-read the profile in case another request assigned it.
          continue;
        }

        return NextResponse.json(
          { error: "Profile could not be updated" },
          { status: 403 },
        );
      }

      return NextResponse.json({ profile: data });
    }

    return NextResponse.json(
      {
        error:
          "Unable to assign an organizer URL. Try a more specific organization name and save again.",
      },
      { status: 409 },
    );
  } catch (err) {
    console.error("PATCH /api/organizer/profile error:", err);

    return NextResponse.json(
      { error: "Unable to save organizer profile" },
      { status: 500 },
    );
  }
}