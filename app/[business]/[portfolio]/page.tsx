// app/[business]/[portfolio]/page.tsx
import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

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

function normalizeBusinessSlug(v: string) {
  return slugify(v)
}

export const runtime = "nodejs"

export default async function PublicKonfolioPage({
  params,
}: {
  params: Promise<{ business: string; portfolio: string }>
}) {
  const { business, portfolio } = await params

  const businessSlug = normalizeBusinessSlug(business)
  const portfolioSlug = slugify(portfolio)

  if (!businessSlug || !portfolioSlug) return notFound()

  // Service role query: public page, only returns published konfolios
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1) Find profile by "business name" slug.
  // MVP approach: fetch candidates with business_name and match by slugify.
  // Recommended next step: add profiles.business_slug (unique) and query by eq("business_slug", businessSlug).
  const { data: profiles, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, business_name")
    .not("business_name", "is", null)

  if (profErr) return notFound()
  if (!profiles || profiles.length === 0) return notFound()

  const owner = profiles.find((p: any) => slugify(String(p.business_name ?? "")) === businessSlug)
  if (!owner) return notFound()

  // 2) Fetch the published konfolio by (user_id, portfolio_slug)
  const { data: k, error: kErr } = await supabaseAdmin
    .from("konfolios")
    .select("id, template, status, updated_at, content, portfolio_name, portfolio_slug, thumbnail_url")
    .eq("user_id", owner.id)
    .eq("portfolio_slug", portfolioSlug)
    .eq("status", "published")
    .maybeSingle()

  if (kErr || !k) return notFound()

  const content: any = k.content ?? {}
  const template: Template = (k.template as any) === "portrait" ? "portrait" : "square"
  const cols = template === "portrait" ? 2 : 3
  const images: any[] = Array.isArray(content.images) ? content.images : []

  const bg = String(content.backgroundColor ?? "#F7F7F7")
  const banner = String(content.bannerColor ?? "#FFFFFF")
  const displayName = String(content.displayName ?? "Name")
  const locationText = String(content.locationText ?? "")
  const profileImageUrl = String(content.profileImageUrl ?? "").trim()

  return (
    <main className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="w-full max-w-[900px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="rounded-[18px] p-5 mb-5" style={{ backgroundColor: banner }}>
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] rounded-full bg-[#e5e5e5] overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="text-[#262626] font-semibold text-[18px] leading-[1.2] truncate">
                {displayName}
              </div>
              <div className="text-[#666] text-[13px] truncate">{locationText}</div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {images.map((cell: any, i: number) => {
            const src = String(cell?.src ?? "").trim()
            const key = String(cell?.id ?? i)
            return (
              <div
                key={key}
                className="bg-white rounded-[16px] overflow-hidden aspect-square"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : null}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}