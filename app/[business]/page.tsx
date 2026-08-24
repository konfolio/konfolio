// app/[business]/page.tsx

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

export default async function PublicBusinessKonfolioPage({
  params,
}: {
  params: Promise<{ business: string }>
}) {
  const { business } = await params

  const businessSlug = slugify(business)

  if (!businessSlug) {
    return notFound()
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find the business owner
  const { data: owner, error: ownerErr } = await supabaseAdmin
    .from("profiles")
    .select("id, business_name, business_slug")
    .eq("business_slug", businessSlug)
    .maybeSingle()

  if (ownerErr) {
    console.error("Profile lookup error:", ownerErr)
    return notFound()
  }

  if (!owner) {
    console.warn("No profile found for business slug:", businessSlug)
    return notFound()
  }

  // The primary portfolio has the same slug as the business.
  const { data: k, error: kErr } = await supabaseAdmin
    .from("konfolios")
    .select(
      "id, user_id, template, status, content, portfolio_name, portfolio_slug, explore_enabled"
    )
    .eq("user_id", owner.id)
    .eq("portfolio_slug", businessSlug)
    .eq("status", "published")
    .eq("explore_enabled", true)
    .maybeSingle()

  if (kErr) {
    console.error("Konfolio lookup error:", kErr)
    return notFound()
  }

  if (!k) {
    console.warn("No primary public konfolio found:", {
      ownerId: owner.id,
      businessSlug,
    })

    return notFound()
  }

  const template: Template =
    (k.template as any) === "portrait" ? "portrait" : "square"

  return (
    <PublicKonfolioView
      konfolioId={k.id}
      template={template}
      content={k.content ?? {}}
      ownerBusinessName={String(owner.business_name ?? "")}
    />
  )
}