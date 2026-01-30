import AuthHeader from "@/components/onboarding/AuthHeader"
import PrevConsCard from "@/components/onboarding/PrevConsCard"

export default function PrevConsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 pt-[100px] pb-[120px]">
        <PrevConsCard
          backHref="/onboarding/merch" 
          nextHref="/onboarding/collabs"
        />
      </main>
    </div>
  )
}
