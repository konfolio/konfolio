import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SearchBar from "@/components/explore/SearchBar"
import ExploreGrid from "@/components/explore/ExploreGrid"
import { createSupabaseServerClient } from "@/lib/supabase/server"
//test
export const dynamic = "force-dynamic"

type ExploreItem = {
  id: string
  template: "square" | "portrait"
  updated_at: string | null
  thumbnailUrl: string
  businessName: string
  displayName: string
  locationText: string
  profileImageUrl: string
  merchTags: string[]
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filters?: string }>
}) {
  const { q = "", filters = "" } = await searchParams
  const searchQuery = q.trim().toLowerCase()
  const selectedFilters = filters
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)

  const supabase = await createSupabaseServerClient()

  const { data: konfolios, error: konfoliosError } = await supabase
    .from("konfolios")
    .select("id, user_id, template, updated_at")
    .eq("status", "published")
    .eq("explore_enabled", true)
    .order("updated_at", { ascending: false })

  if (konfoliosError) {
    console.error("Explore konfolios query error:", konfoliosError)
  }

  const userIds = Array.from(
    new Set((konfolios ?? []).map((k) => k.user_id).filter(Boolean))
  )

  let profilesById: Record<
    string,
    {
      display_name?: string | null
      business_name?: string | null
      location?: string | null
      profile_image_url?: string | null
      merch_tags?: string[] | null
    }
  > = {}

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, business_name, location, profile_image_url, merch_tags")
      .in("id", userIds)

    if (profilesError) {
      console.error("Explore profiles query error:", profilesError)
    } else {
      profilesById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
    }
  }

  let items: ExploreItem[] = (konfolios ?? []).map((row) => {
    const profile = profilesById[row.user_id] ?? {}

    const thumbnailUrl = supabase.storage
      .from("konfolio-images")
      .getPublicUrl(`${row.user_id}/${row.id}/thumbnail.png`).data.publicUrl

    return {
      id: row.id,
      template: row.template,
      updated_at: row.updated_at ?? null,
      thumbnailUrl,
      businessName: profile.business_name ?? "",
      displayName: profile.display_name ?? "",
      locationText: profile.location ?? "",
      profileImageUrl: profile.profile_image_url ?? "",
      merchTags: Array.isArray(profile.merch_tags) ? profile.merch_tags : [],
    }
  })

  if (searchQuery) {
    items = items.filter((item) => {
      const business = item.businessName.toLowerCase()
      const display = item.displayName.toLowerCase()
      const location = item.locationText.toLowerCase()

      return (
        business.includes(searchQuery) ||
        display.includes(searchQuery) ||
        location.includes(searchQuery)
      )
    })
  }

  if (selectedFilters.length > 0) {
    items = items.filter((item) => {
      const wantsSquare = selectedFilters.includes("square")
      const wantsPortrait = selectedFilters.includes("portrait")
      const wantsStamp = selectedFilters.includes("stamp")
      const wantsShare = selectedFilters.includes("share")
      const wantsOther = selectedFilters.includes("other")

      const templateMatch =
        (!wantsSquare && !wantsPortrait) ||
        (wantsSquare && item.template === "square") ||
        (wantsPortrait && item.template === "portrait")

      const merchTagsLower = item.merchTags.map((tag) => tag.toLowerCase())

      const merchMatch =
        (!wantsStamp && !wantsShare && !wantsOther) ||
        (wantsStamp && merchTagsLower.includes("stamp rally")) ||
        (wantsShare && merchTagsLower.includes("share table")) ||
        (wantsOther && merchTagsLower.includes("other collabs"))

      return templateMatch && merchMatch
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />

      <main
        className="
          flex flex-col items-center gap-[30px]
          py-[30px]
          px-[25px]
          sm:px-10
          lg:px-16
          xl:px-24
          2xl:px-[150px]
          flex-1
        "
      >
        <div className="w-full max-w-[1512px] flex flex-col items-center gap-[30px]">
          <SearchBar value={q} selectedFilters={selectedFilters} />

          <div className="w-full bg-transparent">
            <ExploreGrid items={items} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}