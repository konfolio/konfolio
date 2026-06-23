import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import PublicKonfolioView from "@/components/public/PublicKonfolioView"

export const dynamic = "force-dynamic"

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ portfolioId: string }>
}) {
  const { portfolioId } = await params
  const supabase = await createSupabaseServerClient()

  const cleanPortfolioId = decodeURIComponent(portfolioId).trim()

  let portfolioQuery = supabase
    .from("konfolios")
    .select("id, user_id, template, content, portfolio_name, portfolio_slug")
    .eq("status", "published")
    .eq("explore_enabled", true)

  if (isValidUuid(cleanPortfolioId)) {
    portfolioQuery = portfolioQuery.eq("id", cleanPortfolioId)
  } else {
    portfolioQuery = portfolioQuery.eq("portfolio_slug", cleanPortfolioId)
  }

  const { data: portfolio, error: portfolioError } =
    await portfolioQuery.maybeSingle()

  if (portfolioError) {
    console.error("Portfolio query error:", portfolioError)
    notFound()
  }

  if (!portfolio) {
    console.error("Portfolio not found for:", cleanPortfolioId)
    notFound()
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", portfolio.user_id)
    .maybeSingle()

  if (profileError) {
    console.error("Portfolio profile query error:", profileError)
  }

  return (
    <PublicKonfolioView
      konfolioId={portfolio.id}
      template={portfolio.template === "portrait" ? "portrait" : "square"}
      content={portfolio.content ?? {}}
      ownerBusinessName={profile?.business_name ?? ""}
      portfolioName={portfolio.portfolio_name ?? ""}
    />
  )
}