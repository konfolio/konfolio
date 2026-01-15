import AuthHeader from "@/components/onboarding/AuthHeader"
import LinksCard from "@/components/onboarding/LinksCard"

export default function HostLinksPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 pt-[100px] pb-[120px]">
        <LinksCard
          mode="host"
          backHref="/onboarding/business-info/host"
          nextHref="/onboarding/next-step" // change to your real next route
        />
      </main>
    </div>
  )
}
