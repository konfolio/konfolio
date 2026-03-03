// components/my-portfolios/KonfolioExitGuard.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"

type PendingNav = { kind: "href"; href: string } | { kind: "back" }

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export default function KonfolioExitGuard({
  enabled,
  draftId,
  backHref = "/my-portfolios",
  children,
}: {
  enabled: boolean
  draftId: string
  backHref?: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const draft = useKonfolioDraftStore((s) => s.draftsById[draftId])
  const deleteDraft = useKonfolioDraftStore((s) => s.deleteDraft)

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<PendingNav | null>(null)
  const blockingRef = useRef(false)

  function requestExit(next: PendingNav) {
    if (!enabled) return false
    setPending(next)
    setOpen(true)
    return true
  }

  function cancelExit() {
    setOpen(false)
    setPending(null)

    try {
      history.pushState({ konfolio_guard: true }, "", pathname)
    } catch {}
  }

  async function discardUnsavedChangesAndMaybeDeleteDraft() {
    // If draft: delete the row so it does not persist
    if (draft?.status === "draft") {
      const token = await getAccessToken()
      if (!token) {
        deleteDraft?.(draftId)
        return
      }

      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 4000)

      try {
        const res = await fetch(`/api/konfolios/${draftId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          keepalive: true,
        })
        const json = await res.json().catch(() => ({}))
        console.log("[KonfolioExitGuard] DELETE", res.status, json)
      } catch (e) {
        console.log("[KonfolioExitGuard] delete failed", e)
      } finally {
        clearTimeout(t)
        deleteDraft?.(draftId)
      }

      return
    }

    // If published: do not delete the row. Discard local unsaved edits only.
    deleteDraft?.(draftId)
  }

  async function confirmExit() {
    setOpen(false)
    const next = pending
    setPending(null)

    await discardUnsavedChangesAndMaybeDeleteDraft()

    const target = next?.kind === "href" ? next.href : backHref
    router.replace(target)
  }

  useEffect(() => {
    if (!enabled) return

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    try {
      history.pushState({ konfolio_guard: true }, "", pathname)
    } catch {}

    const onPopState = () => {
      if (blockingRef.current) return
      blockingRef.current = true

      requestExit({ kind: "back" })

      try {
        history.pushState({ konfolio_guard: true }, "", pathname)
      } catch {}

      setTimeout(() => {
        blockingRef.current = false
      }, 0)
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [enabled, pathname])

  useEffect(() => {
    if (!enabled) {
      try {
        delete (window as any).__konfolio_attempt_exit
      } catch {}
      return
    }

    ;(window as any).__konfolio_attempt_exit = (href?: string) => {
      return requestExit(href ? { kind: "href", href } : { kind: "back" })
    }

    return () => {
      try {
        delete (window as any).__konfolio_attempt_exit
      } catch {}
    }
  }, [enabled])

  return (
    <>
      {children}

      {open ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={cancelExit} />
          <div className="relative w-[420px] rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="text-[18px] font-semibold text-[#262626]">Leave editor?</div>
            <div className="mt-2 text-[14px] leading-[140%] text-[#6B6B6B]">
              If you leave now, your unsaved changes will be discarded.
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelExit}
                className="h-[40px] rounded-[999px] border border-[#DADADA] px-4 text-[14px] text-[#262626]"
              >
                Cancel
              </button>
              <button
                type="button"
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