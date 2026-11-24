import AuthHeader from "@/components/onboarding/AuthHeader"
import BetaAccessHostCard from "@/components/onboarding/BetaAccessHostCard"

export default function BetaAccessHostPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 pt-[100px] pb-[120px]">
        <BetaAccessHostCard
          backHref="/onboarding/audience"     
          nextHref="/onboarding/name/host"
        />
      </main>
    </div>
  )
}