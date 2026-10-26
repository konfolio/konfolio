import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase server configuration")
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

// Keep new host URLs away from common application routes.
// Add any additional top-level routes your app uses here.
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
])

function artistNameConflict(businessSlug: string) {
  return NextResponse.json(
    {
      error: "This business name is already taken. Try another name.",
      field: "businessName",
      businessSlug,
    },
    { status: 409 },
  )
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null

    if (!token) {
      return NextResponse.json(
        { error: "Missing Authorization Bearer token" },
        { status: 401 },
      )
    }

    const supabaseAdmin = createAdminClient()

    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token)

    if (userErr || !userData.user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      )
    }

    const userId = userData.user.id
    const payload = await req.json().catch(() => null)

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }

    if (payload.mode !== "artist" && payload.mode !== "host") {
      return NextResponse.json(
        { error: "Invalid mode" },
        { status: 400 },
      )
    }

    const firstName = cleanString(payload.firstName)
    const lastName = cleanString(payload.lastName)

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required" },
        { status: 400 },
      )
    }

    if (payload.acceptedTerms !== true) {
      return NextResponse.json(
        { error: "Please accept the terms to continue" },
        { status: 400 },
      )
    }

    const isArtist = payload.mode === "artist"

    // Keep the existing database role mapping.
    const role: "artist" | "vendor" = isArtist ? "artist" : "vendor"

    const organization = cleanString(payload.organization)

    // Hosts use their organization name for their public URL.
    const businessName = isArtist
      ? cleanString(payload.businessName)
      : organization

    if (!businessName) {
      return NextResponse.json(
        {
          error: isArtist
            ? "Business name is required"
            : "Organization name is required",
          field: isArtist ? "businessName" : "organization",
        },
        { status: 400 },
      )
    }

    let baseSlug = slugify(businessName)

    // Preserve the existing artist name validation.
    if (isArtist && !baseSlug) {
      return NextResponse.json(
        {
          error: "Business name must include letters or numbers",
          field: "businessName",
        },
        { status: 400 },
      )
    }

    if (!isArtist) {
      // A valid organization name may use a non-Latin alphabet.
      baseSlug =
        baseSlug || `organizer-${userId.slice(0, 8)}`

      if (RESERVED_SLUGS.has(baseSlug)) {
        baseSlug = `${baseSlug}-organizer`
      }
    }

    const baseUpdate = {
      role,
      first_name: firstName,
      last_name: lastName,
      accepted_terms: true,
      profile_image_url: payload.profileImageUrl ?? null,
      links: payload.links ?? {},
      onboarding_complete: true,
    }

    const artistUpdate = isArtist
      ? {
          preferred_name: payload.preferredName ?? null,
          location: payload.location ?? null,
          sales_permit: payload.salesPermit ?? "",
          will_apply: payload.willApply ?? null,
          collabs: payload.collabs ?? [],
          merch_tags: payload.merchTags ?? [],
          first_vend: payload.firstVend ?? null,
          prev_vends: payload.prevVends ?? [],
          organization: null,
          host_website: null,
          org_size: null,
          attendees: null,
          event_location: null,
        }
      : {}

    const hostUpdate = !isArtist
      ? {
          organization,
          host_website: payload.hostWebsite ?? null,
          org_size: payload.orgSize ?? null,
          attendees: payload.attendees ?? null,
          event_location: payload.eventLocation ?? null,
          preferred_name: null,
          location: null,
          sales_permit: "",
          will_apply: null,
          collabs: [],
          merch_tags: [],
          first_vend: null,
          prev_vends: [],
        }
      : {}

    // The database unique index protects against simultaneous
    // requests claiming the same business_slug.
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const { data: current, error: currentErr } =
        await supabaseAdmin
          .from("profiles")
          .select("id, business_slug")
          .eq("id", userId)
          .maybeSingle()

      if (currentErr) {
        throw currentErr
      }

      const existingSlug =
        typeof current?.business_slug === "string" &&
        current.business_slug.length > 0
          ? current.business_slug
          : null

      // Existing URLs remain stable, including after a name change.
      const businessSlug =
        existingSlug ||
        (isArtist || attempt === 0
          ? baseSlug
          : `${baseSlug}-${attempt + 1}`)

      if (!existingSlug) {
        const { data: matches, error: lookupErr } =
          await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("business_slug", businessSlug)
            .neq("id", userId)
            .limit(1)

        if (lookupErr) {
          throw lookupErr
        }

        if (matches && matches.length > 0) {
          if (isArtist) {
            return artistNameConflict(businessSlug)
          }

          // Hosts may share an organization name.
          // Try the next numbered URL.
          continue
        }
      }

      const update = {
        ...baseUpdate,
        ...artistUpdate,
        ...hostUpdate,
        business_name: businessName,
        business_slug: businessSlug,
      }

      let result

      if (current) {
        let query = supabaseAdmin
          .from("profiles")
          .update(update)
          .eq("id", userId)

        // Avoid overwriting a slug assigned by a simultaneous save.
        query =
          current.business_slug === null
            ? query.is("business_slug", null)
            : query.eq("business_slug", current.business_slug)

        result = await query
          .select("business_slug")
          .maybeSingle()
      } else {
        result = await supabaseAdmin
          .from("profiles")
          .insert({
            id: userId,
            ...update,
          })
          .select("business_slug")
          .maybeSingle()
      }

      if (result.error) {
        if (result.error.code === "23505") {
          // Re-read on the next attempt. Another request may have
          // created this profile or claimed the proposed slug.
          continue
        }

        throw result.error
      }

      if (!result.data) {
        // The profile's slug changed during this request.
        // Re-read it rather than replacing its new URL.
        continue
      }

      return NextResponse.json({
        ok: true,
        businessSlug: result.data.business_slug,
      })
    }

    return NextResponse.json(
      {
        error:
          "Unable to assign a unique URL. Please try again with a more specific business or organization name.",
        field: isArtist ? "businessName" : "organization",
      },
      { status: 409 },
    )
  } catch (error) {
    console.error("POST /api/onboarding/submit failed:", error)

    return NextResponse.json(
      { error: "Unable to complete onboarding. Please try again." },
      { status: 500 },
    )
  }
}