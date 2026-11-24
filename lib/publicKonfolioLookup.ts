import "server-only"
import { createClient } from "@supabase/supabase-js"
import { toPublicKonfolioContent } from "@/lib/publicKonfolioContent"

export function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

export async function findPublicKonfolio(business: string, portfolio: string) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: owner, error: ownerError } = await db.from("profiles")
    .select("id,business_name,business_slug").eq("business_slug", business).maybeSingle()
  if (ownerError) throw new Error("Profile lookup failed")
  if (!owner) return null
  const { data: k, error } = await db.from("konfolios")
    .select("id,user_id,template,status,updated_at,content,portfolio_name,portfolio_slug,thumbnail_url,explore_enabled")
    .eq("user_id", owner.id).eq("portfolio_slug", portfolio).eq("status", "published").maybeSingle()
  if (error) throw new Error("Portfolio lookup failed")
  if (!k) return null
  return {
    id: k.id, userId: k.user_id, template: k.template, status: k.status,
    updatedAt: k.updated_at, exploreEnabled: k.explore_enabled,
    businessName: owner.business_name, businessSlug: owner.business_slug,
    portfolioName: k.portfolio_name, portfolioSlug: k.portfolio_slug,
    thumbnailUrl: k.thumbnail_url, content: toPublicKonfolioContent(k.content),
  }
}
