// app/[business]/[portfolio]/page.tsx
import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import PublicKonfolioView from "@/components/public/PublicKonfolioView"

type Template = "square" | "portrait"

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export const runtime = "nodejs"

export default async function PublicKonfolioPage({
  params,
}: {
  params: Promise<{ business: string; portfolio: string }>
}) {
  const { business, portfolio } = await params

  const businessSlug = slugify(business)
  const portfolioSlug = slugify(portfolio)
  if (!businessSlug || !portfolioSlug) return notFound()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, business_name")
    .not("business_name", "is", null)

  if (profErr || !profiles?.length) return notFound()

  const owner = profiles.find((p: any) => slugify(String(p.business_name ?? "")) === businessSlug)
  if (!owner) return notFound()

  const { data: k, error: kErr } = await supabaseAdmin
    .from("konfolios")
    .select("id, template, status, content, portfolio_name, portfolio_slug")
    .eq("user_id", owner.id)
    .eq("portfolio_slug", portfolioSlug)
    .eq("status", "published")
    .maybeSingle()

  if (kErr || !k) return notFound()

  const template: Template = (k.template as any) === "portrait" ? "portrait" : "square"
  const content: any = k.content ?? {}

  return (
    <PublicKonfolioView
      template={template}
      content={content}
      ownerBusinessName={String(owner.business_name ?? "")}
      portfolioName={String(k.portfolio_name ?? "")}
    />
  )
}