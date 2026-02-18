import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 })
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    const userId = userData.user.id

    const payload = await req.json()

    if (!payload.mode || !payload.firstName || !payload.lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (payload.mode !== "artist" && payload.mode !== "host") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
    }

    // DB allows only 'artist' | 'vendor'
    const role: "artist" | "vendor" = payload.mode === "artist" ? "artist" : "vendor"

    const baseUpdate: any = {
      role,
      first_name: payload.firstName,
      last_name: payload.lastName,
      accepted_terms: !!payload.acceptedTerms,
      profile_image_url: payload.profileImageUrl ?? null,
      links: payload.links ?? {},
      onboarding_complete: true,
    }

    const artistUpdate =
      payload.mode === "artist"
        ? {
            preferred_name: payload.preferredName ?? null,
            business_name: payload.businessName ?? null,
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

    const hostUpdate =
      payload.mode === "host"
        ? {
            organization: payload.organization ?? null,
            host_website: payload.hostWebsite ?? null,
            org_size: payload.orgSize ?? null,
            attendees: payload.attendees ?? null,
            event_location: payload.eventLocation ?? null,
            preferred_name: null,
            business_name: null,
            location: null,
            sales_permit: "",
            will_apply: null,
            collabs: [],
            merch_tags: [],
            first_vend: null,
            prev_vends: [],
          }
        : {}

    const update = { ...baseUpdate, ...artistUpdate, ...hostUpdate }

    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, ...update }, { onConflict: "id" })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}
