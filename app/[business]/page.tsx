import { notFound } from "next/navigation"
import PublicKonfolioView from "@/components/public/PublicKonfolioView"
import { findPublicKonfolio, slugify } from "@/lib/publicKonfolioLookup"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function PublicBusinessKonfolioPage({ params }: {
  params: Promise<{ business: string }>
}) {
  const { business } = await params
  const slug = slugify(business)
  if (!slug) return notFound()
  const k = await findPublicKonfolio(slug, slug)
  if (!k) return notFound()
  return <PublicKonfolioView konfolioId={k.id}
    template={k.template === "portrait" ? "portrait" : "square"}
    content={k.content} ownerBusinessName={String(k.businessName ?? "")} />
}
