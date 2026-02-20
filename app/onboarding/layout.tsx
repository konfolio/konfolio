import OnboardingExitGuard from "@/components/onboarding/OnboardingExitGuard"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingExitGuard enabled={true}>
      {children}
    </OnboardingExitGuard>
  )
}