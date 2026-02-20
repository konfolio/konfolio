import AuthHeader from "@/components/onboarding/AuthHeader"
import MerchTypeCard from "@/components/onboarding/MerchTypeCard"

export default function ArtistMerchTypePage() {
  // TODO: replace with real onboarding state
  const businessName = "Business Name"

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 pt-[100px] pb-[120px]">
        <MerchTypeCard
          businessName={businessName}
          backHref="/onboarding/links/artist"
          nextHref="/onboarding/prev-vends"
        />
      </main>
    </div>
  )
}
