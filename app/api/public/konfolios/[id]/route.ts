import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("konfolios")
    .select("id, template, status, updated_at, content, portfolio_name, portfolio_slug, thumbnail_url")
    .eq("id", id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Only allow public access to published konfolios
  if (data.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    portfolioName: data.portfolio_name,
    portfolioSlug: data.portfolio_slug,
    thumbnailUrl: data.thumbnail_url,
    content: data.content ?? {},
  })
}