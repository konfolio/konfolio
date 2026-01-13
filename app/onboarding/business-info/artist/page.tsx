import AuthHeader from "@/components/onboarding/AuthHeader"
import BusinessInfoArtistCard from "@/components/onboarding/BusinessInfoArtistCard"

export default function ArtistBusinessInfoPage() {
  // TODO: swap this with whatever you store from NameCard (preferredName -> firstName fallback)
  const displayName = "there"

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 py-[60px] pt-[100px] pb-[120px]">
        <BusinessInfoArtistCard
          displayName={displayName}
          backHref="/onboarding/name/artist"
          nextHref="/onboarding/next-step" // change to your real next route
        />
      </main>
    </div>
  )
}
