import { notFound } from "next/navigation";
import ProfileSidebar from "@/components/featured/ProfileSidebar";
import ImageGrid from "@/components/featured/ImageGrid";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const { portfolioId } = await params;
  const supabase = await createSupabaseServerClient();

  const cleanPortfolioId = decodeURIComponent(portfolioId).trim();

  let portfolioQuery = supabase
    .from("konfolios")
    .select("id, user_id, template, content, portfolio_slug")
    .eq("status", "published")
    .eq("explore_enabled", true);

  if (isValidUuid(cleanPortfolioId)) {
    portfolioQuery = portfolioQuery.eq("id", cleanPortfolioId);
  } else {
    portfolioQuery = portfolioQuery.eq("portfolio_slug", cleanPortfolioId);
  }

  const { data: portfolio, error: portfolioError } =
    await portfolioQuery.maybeSingle();

  if (portfolioError) {
    console.error("Portfolio query error:", portfolioError);
    notFound();
  }

  if (!portfolio) {
    console.error("Portfolio not found for:", cleanPortfolioId);
    notFound();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "display_name, business_name, location, profile_image_url, prev_vends",
    )
    .eq("id", portfolio.user_id)
    .maybeSingle();

  if (profileError) {
    console.error("Portfolio profile query error:", profileError);
  }

  const displayName =
    portfolio.content?.displayName ?? profile?.display_name ?? "";

  const businessName =
    portfolio.content?.businessName ?? profile?.business_name ?? "";

  const locationText =
    portfolio.content?.locationText ?? profile?.location ?? "";

  const profileImageUrl =
    portfolio.content?.profileImageUrl ?? profile?.profile_image_url ?? "";

  const email = portfolio.content?.email ?? "";

  const linksByKey = portfolio.content?.links?.linksByKey ?? {};

  const merchTags =
    portfolio.content?.merchTags ?? portfolio.content?.sidebar?.merchTags ?? [];

  const contentPreviousVends =
    portfolio.content?.previousVends ??
    portfolio.content?.sidebar?.previousVends;

  const previousVendsRaw =
    Array.isArray(contentPreviousVends) && contentPreviousVends.length > 0
      ? contentPreviousVends
      : (profile?.prev_vends ?? []);

  const previousVends = Array.isArray(previousVendsRaw)
    ? previousVendsRaw.map((vend: any, i: number) => {
        if (typeof vend === "string") {
          return { name: vend };
        }

        return {
          name: vend?.name ?? vend?.event_name ?? `Vend ${i + 1}`,
          year: vend?.year ?? vend?.event_year ?? undefined,
        };
      })
    : [];

  return (
    <main className="w-full min-h-screen bg-[#F7F7F7]">
      <div className="w-full px-[16px] sm:px-10 lg:px-[150px] py-[20px] sm:py-[40px]">
        <div className="mx-auto max-w-[1512px]">
          <div className="flex flex-col lg:flex-row items-start justify-center gap-[20px]">
            <div className="w-full lg:w-auto">
              <ProfileSidebar
                businessName={businessName}
                displayName={displayName}
                profileImageUrl={profileImageUrl}
                merchTags={merchTags}
                previousVends={previousVends}
                locationText={locationText}
                email={email}
                links={{
                  website: linksByKey.website ?? "",
                  shop: linksByKey.shop ?? "",
                  instagram: linksByKey.instagram ?? "",
                  x: linksByKey.x ?? "",
                  facebook: linksByKey.facebook ?? "",
                  tumblr: linksByKey.tumblr ?? "",
                  pixiv: linksByKey.pixiv ?? "",
                  bluesky: linksByKey.bluesky ?? "",
                }}
              />
            </div>

            <div className="w-full lg:flex-1 min-w-0">
              <ImageGrid
                content={portfolio.content}
                template={portfolio.template}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}