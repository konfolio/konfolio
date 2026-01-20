import AuthHeader from "@/components/onboarding/AuthHeader"
import UploadProfileCard from "@/components/onboarding/UploadProfileCard"

export default function UploadProfilePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-[25px] sm:px-10 pt-[100px] pb-[120px]">
        <UploadProfileCard
          backHref="/onboarding/collabs" 
          nextHref="/onboarding/finish"
          title="Last step!"
          displayName="Business Name"
          locationText="First Last (Preferred)"
        />
      </main>
    </div>
  )
}
