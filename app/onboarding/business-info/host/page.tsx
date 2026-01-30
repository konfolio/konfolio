import AuthHeader from "@/components/onboarding/AuthHeader"
import BusinessInfoHostCard from "@/components/onboarding/BusinessInfoHostCard"

export default function HostBusinessInfoPage() {
  // TODO: replace with real value from your stored onboarding state
  const orgName = "Organization Name"

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 pt-[100px] pb-[120px]">
        <BusinessInfoHostCard
          orgName={orgName}
          backHref="/onboarding/name/host"   
          nextHref="/onboarding/links/host"   
        />
      </main>
    </div>
  )
}
