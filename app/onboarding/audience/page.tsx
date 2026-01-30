import AuthHeader from "@/components/onboarding/AuthHeader"
import AudienceCard from "@/components/onboarding/AudienceCard"

export default function AudiencePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex justify-center px-[25px] sm:px-10 pt-[120px] pb-[120px]">
        <AudienceCard />
      </main>
    </div>
  )
}
