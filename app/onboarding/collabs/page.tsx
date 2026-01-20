import AuthHeader from "@/components/onboarding/AuthHeader"
import CollabCard from "@/components/onboarding/CollabCard"

export default function CollabsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 py-[60px] pt-[100px] pb-[120px]">
        <CollabCard
          backHref="/onboarding/prev-cons"
          nextHref="/onboarding/profile-pic/artist"
        />
      </main>
    </div>
  )
}
