import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/explore/SearchBar";
import ExploreGrid from "@/components/explore/ExploreGrid";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ExploreItem = {
  id: string;
  template: "square" | "portrait";
  updated_at: string | null;
  thumbnailUrl: string;
  businessName: string;
  businessSlug: string | null;
  portfolioName: string;
  portfolioSlug: string | null;
  displayName: string;
  locationText: string;
  profileImageUrl: string;
  collabs: string[];
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filters?: string }>;
}) {
  const { q = "", filters = "" } = await searchParams;
  const searchQuery = q.trim().toLowerCase();

  const selectedFilters = filters
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const supabase = await createSupabaseServerClient();

  const { data: konfolios, error: konfoliosError } = await supabase
    .from("konfolios")
    .select(
      "id, user_id, template, updated_at, portfolio_name, portfolio_slug, thumbnail_url"
    )
    .eq("status", "published")
    .eq("explore_enabled", true)
    .order("updated_at", { ascending: false });

  if (konfoliosError) {
    console.error("Explore konfolios query error:", konfoliosError);
  }

  const userIds = Array.from(
    new Set((konfolios ?? []).map((k) => k.user_id).filter(Boolean))
  );

  let profilesById: Record<
    string,
    {
      display_name?: string | null;
      business_name?: string | null;
      business_slug?: string | null;
      location?: string | null;
      profile_image_url?: string | null;
      collabs?: string[] | null;
    }
  > = {};

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("explore_profiles")
      .select(
        "id, display_name, business_name, business_slug, location, profile_image_url, collabs"
      )
      .in("id", userIds);

    if (profilesError) {
      console.error("Explore profiles query error:", profilesError);
    } else {
      profilesById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
    }
  }

  let items: ExploreItem[] = (konfolios ?? []).map((row) => {
    const profile = profilesById[row.user_id] ?? {};

    const fallbackThumbnailUrl = supabase.storage
      .from("konfolio-images")
      .getPublicUrl(`${row.user_id}/${row.id}/thumbnail.png`).data.publicUrl;

    const rawThumbnailUrl = row.thumbnail_url || fallbackThumbnailUrl;

    const thumbnailUrl = row.updated_at
      ? `${rawThumbnailUrl}?t=${encodeURIComponent(row.updated_at)}`
      : rawThumbnailUrl;

    return {
      id: row.id,
      template: row.template,
      updated_at: row.updated_at ?? null,
      thumbnailUrl,
      businessName: profile.business_name ?? "",
      businessSlug: profile.business_slug ?? null,
      portfolioName: row.portfolio_name ?? "",
      portfolioSlug: row.portfolio_slug ?? null,
      displayName: profile.display_name ?? "",
      locationText: profile.location ?? "",
      profileImageUrl: profile.profile_image_url ?? "",
      collabs: Array.isArray(profile.collabs) ? profile.collabs : [],
    };
  });

  if (searchQuery) {
    items = items.filter((item) => {
      const business = item.businessName.toLowerCase();
      const portfolio = item.portfolioName.toLowerCase();
      const display = item.displayName.toLowerCase();
      const location = item.locationText.toLowerCase();

      return (
        business.includes(searchQuery) ||
        portfolio.includes(searchQuery) ||
        display.includes(searchQuery) ||
        location.includes(searchQuery)
      );
    });
  }

  if (selectedFilters.length > 0) {
    items = items.filter((item) => {
      const wantsSquare = selectedFilters.includes("square");
      const wantsPortrait = selectedFilters.includes("portrait");
      const wantsStamp = selectedFilters.includes("stamp");
      const wantsShare = selectedFilters.includes("share");
      const wantsOther = selectedFilters.includes("other");

      const templateMatch =
        (!wantsSquare && !wantsPortrait) ||
        (wantsSquare && item.template === "square") ||
        (wantsPortrait && item.template === "portrait");

      const collabsLower = item.collabs.map((tag) => tag.toLowerCase());

      const collabMatch =
        (!wantsStamp && !wantsShare && !wantsOther) ||
        (wantsStamp && collabsLower.includes("stamp rally")) ||
        (wantsShare && collabsLower.includes("share table")) ||
        (wantsOther && collabsLower.includes("other collabs"));

      return templateMatch && collabMatch;
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7]">
      <Navbar />

      <main
        className="
          flex flex-1 flex-col items-center gap-[30px]
          px-[25px] py-[30px]
          sm:px-10
          lg:px-16
          xl:px-24
          2xl:px-[150px]
        "
      >
        <div className="flex w-full max-w-[1512px] flex-col items-center gap-[30px]">
          <SearchBar value={q} selectedFilters={selectedFilters} />
          <div className="w-full bg-transparent">
            <ExploreGrid items={items} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}