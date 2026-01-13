import AuthHeader from "@/components/onboarding/AuthHeader"
import NameCard from "@/components/onboarding/NameCard"

export default function ArtistNamePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex justify-center px-[25px] sm:px-10 pt-[100px] pb-[120px]">
        <NameCard
          mode="artist"
          onNextHref="/onboarding/business-info/artist"
        />
      </main>
    </div>
  )
}
