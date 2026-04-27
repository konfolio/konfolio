// app/login/page.tsx
"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import AuthHeader from "@/components/onboarding/AuthHeader"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"
import { supabase } from "@/lib/supabaseClient"

type Role = "vendor" | "artist" | "host" | "admin" | string

function roleHome(role: Role | null | undefined) {
  if (role === "vendor") return "/my-forms"
  return "/my-portfolios"
}

function isSafeInternalPath(v: string) {
  return v.startsWith("/") && !v.startsWith("//")
}

function safeReturnTo(raw: string | null, role: Role | null | undefined) {
  const fallback = roleHome(role)
  const v = (raw || "").trim()

  if (!v) return fallback
  if (!isSafeInternalPath(v)) return fallback
  if (v === "/onboarding" || v.startsWith("/onboarding/")) return fallback

  if (role === "vendor" && (v === "/my-portfolios" || v.startsWith("/my-portfolios/"))) {
    return "/my-forms"
  }

  if (role !== "vendor" && (v === "/my-forms" || v.startsWith("/my-forms/"))) {
    return "/my-portfolios"
  }

  return v
}

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    ;(async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,onboarding_complete")
        .eq("id", user.id)
        .maybeSingle()

      const complete = Boolean(profile?.onboarding_complete)

      if (!complete) {
        router.replace("/onboarding/audience")
        return
      }

      const role = (profile?.role ?? null) as Role | null
      const next = safeReturnTo(params.get("returnTo"), role)

      router.replace(next)
    })()
  }, [router, params])

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <AuthHeader />

      <main className="min-h-[calc(100vh-61px)] flex items-center justify-center px-4">
        <GoogleSignInButton />
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F7]">
          <AuthHeader />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  )
}