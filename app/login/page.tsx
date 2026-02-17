"use client"

import AuthHeader from "@/components/onboarding/AuthHeader"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <AuthHeader />

      <main className="min-h-[calc(100vh-61px)] flex items-center justify-center px-4">
        <GoogleSignInButton />
      </main>
    </div>
  )
}
