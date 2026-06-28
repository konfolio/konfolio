// app/api/public/konfolios/by-slug/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const business = slugify(searchParams.get("business") || "")
    const portfolio = slugify(searchParams.get("portfolio") || "")

    if (!business || !portfolio) {
      return NextResponse.json(
        { error: "Missing business or portfolio" },
        { status: 400 }
      )
    }

    const { data: owner, error: ownerErr } = await supabaseAdmin
      .from("profiles")
      .select("id, business_name, business_slug")
      .eq("business_slug", business)
      .maybeSingle()

    if (ownerErr) {
      return NextResponse.json({ error: ownerErr.message }, { status: 500 })
    }

    if (!owner) {
      return NextResponse.json(
        {
          error: "Not found",
          step: "profile",
          business,
        },
        { status: 404 }
      )
    }

    const { data: k, error: kErr } = await supabaseAdmin
      .from("konfolios")
      .select(
        "id, user_id, template, status, updated_at, content, portfolio_name, portfolio_slug, thumbnail_url, explore_enabled"
      )
      .eq("user_id", owner.id)
      .eq("portfolio_slug", portfolio)
      .eq("status", "published")
      .eq("explore_enabled", true)
      .maybeSingle()

    if (kErr) {
      return NextResponse.json({ error: kErr.message }, { status: 500 })
    }

    if (!k) {
      return NextResponse.json(
        {
          error: "Not found",
          step: "konfolio",
          ownerId: owner.id,
          business,
          portfolio,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: k.id,
      userId: k.user_id,
      template: k.template,
      status: k.status,
      updatedAt: k.updated_at,
      exploreEnabled: k.explore_enabled,
      businessName: owner.business_name,
      businessSlug: owner.business_slug,
      portfolioName: k.portfolio_name,
      portfolioSlug: k.portfolio_slug,
      thumbnailUrl: k.thumbnail_url,
      content: k.content ?? {},
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
} 