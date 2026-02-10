"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

function safeReturnTo(raw: string | null) {
  const v = (raw || "").trim()
  if (!v) return "/my-portfolios"
  if (!v.startsWith("/")) return "/my-portfolios"
  // IMPORTANT: never send returning users into onboarding
  if (v === "/onboarding" || v.startsWith("/onboarding/")) return "/my-portfolios"
  return v
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    ;(async () => {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      console.log("[callback] sessionErr:", sessionErr)
      console.log("[callback] user:", user?.id)

      if (sessionErr || !user) {
        router.replace("/login")
        return
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, onboarding_complete")
        .eq("id", user.id)
        .maybeSingle()

      console.log("[callback] profileErr:", profileErr)
      console.log("[callback] profile:", profile)

      const complete = Boolean(profile?.onboarding_complete)

      if (!complete) {
        router.replace("/onboarding/audience")
        return
      }

      router.replace(safeReturnTo(params.get("returnTo")))
    })()
  }, [router, params])

  return <p className="p-6">Signing you in…</p>
}
