"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type PendingNav =
  | { kind: "href"; href: string }
  | { kind: "back" }

export default function OnboardingExitGuard({
  enabled,
  children,
}: {
  enabled: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<PendingNav | null>(null)
  const blockingRef = useRef(false)

  function requestExit(next: PendingNav) {
    if (!enabled) return false
    setPending(next)
    setOpen(true)
    return true
  }

  async function leaveOnboarding() {
    // 1) abandon onboarding (server signs out + deletes user if incomplete)
    await fetch("/api/auth/abandon-onboarding", { method: "POST" }).catch(() => {})

    // 2) also sign out client-side (extra safety)
    await supabase.auth.signOut().catch(() => {})

    // 3) go home (or wherever you want)
    router.replace("/")
  }

  function cancelExit() {
    setOpen(false)
    setPending(null)

    // If we intercepted browser back, keep user on the same page
    // by re-pushing current state.
    try {
      history.pushState({ onboarding_guard: true }, "", pathname)
    } catch {}
  }

  // Intercept refresh/close (native browser prompt)
  useEffect(() => {
    if (!enabled) return

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // native dialog; custom modal not allowed here
      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [enabled])

  // Intercept browser back button with popstate
  useEffect(() => {
    if (!enabled) return

    // Put a guard state so the first "back" triggers popstate we can catch
    try {
      history.pushState({ onboarding_guard: true }, "", pathname)
    } catch {}

    const onPopState = () => {
      if (blockingRef.current) return
      blockingRef.current = true

      // Show modal, then immediately re-push state to “stay”
      requestExit({ kind: "back" })
      try {
        history.pushState({ onboarding_guard: true }, "", pathname)
      } catch {}

      // allow future events
      setTimeout(() => {
        blockingRef.current = false
      }, 0)
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [enabled, pathname])

  // Expose a global function so your header/nav can call it before routing
  // (simple + effective)
  useEffect(() => {
    ;(window as any).__konfolio_onboarding_attempt_nav = (href: string) => {
      return requestExit({ kind: "href", href })
    }
    return () => {
      delete (window as any).__konfolio_onboarding_attempt_nav
    }
  }, [enabled])

  async function confirmExit() {
    setOpen(false)
    const next = pending
    setPending(null)

    await leaveOnboarding()

    // If you ever want to navigate to a specific href instead of home:
    // if (next?.kind === "href") router.replace(next.href)
  }

  return (
    <>
      {children}

      {open ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={cancelExit} />
          <div className="relative w-[420px] rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="text-[18px] font-semibold text-[#262626]">
              Leave onboarding?
            </div>
            <div className="mt-2 text-[14px] leading-[140%] text-[#6B6B6B]">
              Your changes won’t be saved. If you leave now, your sign-in session
              will be cleared.
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelExit}
                className="h-[40px] rounded-[999px] border border-[#DADADA] px-4 text-[14px] text-[#262626]"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="h-[40px] rounded-[999px] bg-[#262626] px-4 text-[14px] text-white"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}