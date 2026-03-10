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
  const { searchParams } = new URL(req.url)
  const business = slugify(searchParams.get("business") || "")
  const portfolio = slugify(searchParams.get("portfolio") || "")

  if (!business || !portfolio) {
    return NextResponse.json({ error: "Missing business or portfolio" }, { status: 400 })
  }

  // MVP approach: fetch candidates and match by slugified business_name.
  // Recommended next step: add profiles.business_slug (unique) and query by eq("business_slug", business).
  const { data: profiles, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, business_name")
    .not("business_name", "is", null)

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })
  if (!profiles || profiles.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const owner = profiles.find((p: any) => slugify(String(p.business_name ?? "")) === business)
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: k, error: kErr } = await supabaseAdmin
    .from("konfolios")
    .select("id, template, status, updated_at, content, portfolio_name, portfolio_slug, thumbnail_url")
    .eq("user_id", owner.id)
    .eq("portfolio_slug", portfolio)
    .eq("status", "published")
    .maybeSingle()

  if (kErr) return NextResponse.json({ error: kErr.message }, { status: 500 })
  if (!k) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    id: k.id,
    template: k.template,
    status: k.status,
    updatedAt: k.updated_at,
    portfolioName: k.portfolio_name,
    portfolioSlug: k.portfolio_slug,
    thumbnailUrl: k.thumbnail_url,
    content: k.content ?? {},
  })
}