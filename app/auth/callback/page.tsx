// app/auth/callback/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    ;(async () => {
      // 1) Try exchange (best case)
      const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      )

      if (exchangeErr) {
        // Do NOT immediately fail.
        // If we already have a session in browser storage, continue.
        console.warn("[callback] exchange failed, trying session fallback:", exchangeErr)
      }

      // 2) Get whatever session we have
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      const session = sessionData.session
      const user = session?.user

      if (sessionErr) console.error("[callback] sessionErr:", sessionErr)

      if (!session || !user) {
        // Only now treat as not signed in
        const details = exchangeErr
          ? encodeURIComponent(`${exchangeErr.code ?? "unknown"}:${exchangeErr.message}`)
          : ""
        router.replace(details ? `/login?error=oauth&details=${details}` : "/login")
        return
      }

      // 3) Sync session to server cookies (so proxy.ts can see auth)
      // If refresh_token is missing (can happen), skip sync.
      if (session.refresh_token) {
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          })
        } catch (e) {
          console.error("[callback] sync error:", e)
        }
      } else {
        console.warn("[callback] no refresh_token available; skipping cookie sync")
      }

      // 4) Profile + onboarding + role redirect
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, onboarding_complete, role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileErr) console.error("[callback] profileErr:", profileErr)

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

  return <p className="p-6">Signing you in…</p>
}