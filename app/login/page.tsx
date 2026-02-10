"use client"

import GoogleSignInButton from "@/components/auth/GoogleSignInButton"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
      <GoogleSignInButton />
    </main>
  )
}
