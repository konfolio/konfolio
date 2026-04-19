import { notFound } from "next/navigation"
import ProfileSidebar from "@/components/featured/ProfileSidebar"
import ImageGrid from "@/components/featured/ImageGrid"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ portfolioId: string }>
}) {
  const { portfolioId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: portfolio, error: portfolioError } = await supabase
    .from("konfolios")
    .select("id, user_id, template, content")
    .eq("id", portfolioId)
    .eq("status", "published")
    .eq("explore_enabled", true)
    .single()

  if (portfolioError || !portfolio) {
    notFound()
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, business_name, location, profile_image_url, prev_vends")
    .eq("id", portfolio.user_id)
    .single()
    //console.log("portfolio.user_id:", portfolio.user_id)
    //console.log("profile:", profile)
    //console.log("portfolio.content:", portfolio.content)
  //console.log("profile:", profile)

  if (profileError) {
    console.error("Portfolio profile query error:", profileError)
  }

  const displayName =
  portfolio.content?.displayName ??
  profile?.display_name ??
  ""

const businessName =
  portfolio.content?.businessName ??
  profile?.business_name ??
  ""

const locationText =
  portfolio.content?.locationText ??
  profile?.location ??
  ""

const profileImageUrl =
  portfolio.content?.profileImageUrl ??
  profile?.profile_image_url ??
  ""

const email =
  portfolio.content?.email ??
  ""

const linksByKey =
  portfolio.content?.links?.linksByKey ?? {}

const merchTags =
  portfolio.content?.merchTags ??
  portfolio.content?.sidebar?.merchTags ??
  []

const contentPreviousVends =
  portfolio.content?.previousVends ??
  portfolio.content?.sidebar?.previousVends

const previousVendsRaw =
  Array.isArray(contentPreviousVends) && contentPreviousVends.length > 0
    ? contentPreviousVends
    : profile?.prev_vends ?? []

const previousVends = Array.isArray(previousVendsRaw)
  ? previousVendsRaw.map((vend: any, i: number) => {
      if (typeof vend === "string") {
        return { name: vend }
      }

      return {
        name: vend?.name ?? vend?.event_name ?? `Vend ${i + 1}`,
        year: vend?.year ?? vend?.event_year ?? undefined,
      }
    })
  : []
  

  return (
    
    <main className="w-full min-h-[982px] bg-[#F7F7F7]">
      <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
        <div className="mx-auto max-w-[1512px]">
          <div className="flex items-start justify-center gap-[20px]">
            <ProfileSidebar
              businessName={businessName}
              displayName={displayName}
              profileImageUrl={profileImageUrl}
              merchTags={merchTags}
              previousVends={previousVends}
              locationText={locationText}
              //email={profile?.email ?? ""}
              email={email}
              //links={{
              //  instagram: profile?.instagram ?? "",
              //  x: profile?.x ?? "",
              //}}
              links={{website: linksByKey.website ?? "",
    shop: linksByKey.shop ?? "",
    instagram: linksByKey.instagram ?? "",
    x: linksByKey.x ?? "",
    facebook: linksByKey.facebook ?? "",
    tumblr: linksByKey.tumblr ?? "",
    pixiv: linksByKey.pixiv ?? "",
    bluesky: linksByKey.bluesky ?? "",}}
            />

            <ImageGrid
              content={portfolio.content}
              template={portfolio.template}
            />
          </div>
        </div>
      </div>
    </main>
  )
}