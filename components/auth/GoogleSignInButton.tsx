"use client"

import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

function sanitizeReturnTo(raw: string | null) {
  const v = (raw || "").trim()
  if (!v) return "/my-portfolios"
  if (!v.startsWith("/")) return "/my-portfolios"
  // Never allow returnTo to force onboarding; callback will decide onboarding for first-time users
  if (v === "/onboarding" || v.startsWith("/onboarding/")) return "/my-portfolios"
  return v
}

export default function GoogleSignInButton() {
  const params = useSearchParams()
  const returnTo = sanitizeReturnTo(params.get("returnTo"))

  return (
    <button
      className="px-6 py-3 rounded-full bg-black text-white"
      onClick={async () => {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(
              returnTo
            )}`,
          },
        })
      }}
    >
      Continue with Google
    </button>
  )
}
