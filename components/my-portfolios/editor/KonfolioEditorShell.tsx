// components/my-portfolios/editor/KonfolioEditorShell.tsx
"use client"

import { useEffect, useState } from "react"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import type { KonfolioDraft } from "@/components/my-portfolios/editor/editorTypes"
import SquareEditor from "@/components/my-portfolios/editor/SquareEditor"
import PortraitEditor from "@/components/my-portfolios/editor/PortraitEditor"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  konfolioId: string
  initialDraft?: KonfolioDraft
}

type SocialKey = "website" | "shop" | "instagram" | "x" | "facebook" | "tumblr" | "pixiv" | "bluesky"

function defaultLinks() {
  return {
    activeKeys: [] as SocialKey[],
    linksByKey: {
      website: "",
      shop: "",
      instagram: "",
      x: "",
      facebook: "",
      tumblr: "",
      pixiv: "",
      bluesky: "",
    } as Record<SocialKey, string>,
  }
}

/**
 * Your GET route returns:
 * { id, template, status, updatedAt, content }
 * We normalize that into a KonfolioDraft for the editor.
 */
function draftFromGetResponse(data: any): KonfolioDraft | null {
  const id = String(data?.id ?? "").trim()
  const template = data?.template

  if (!id) return null
  if (template !== "square" && template !== "portrait") return null

  const content = data?.content && typeof data.content === "object" ? data.content : {}

  const links =
    content.links && typeof content.links === "object" && Array.isArray(content.links.activeKeys)
      ? content.links
      : defaultLinks()

  const merchTags = Array.isArray(content.merchTags) ? content.merchTags : []
  const previousVends = Array.isArray(content.previousVends) ? content.previousVends : []
  const images = Array.isArray(content.images) ? content.images : []

  const draft: KonfolioDraft = {
    id,
    template,
    status: data?.status === "published" ? "published" : "draft",
    updatedAt: typeof data?.updatedAt === "number" ? data.updatedAt : Date.now(),

    bannerColor: String(content.bannerColor ?? "#FFFFFF"),
    backgroundColor: String(content.backgroundColor ?? "#F7F7F7"),
    bannerSwatches: Array.isArray(content.bannerSwatches) ? content.bannerSwatches : [],
    backgroundSwatches: Array.isArray(content.backgroundSwatches) ? content.backgroundSwatches : [],

    profileImageUrl: String(content.profileImageUrl ?? ""),
    businessName: String(content.businessName ?? "Business Name"),
    displayName: String(content.displayName ?? "Name"),
    locationText: String(content.locationText ?? "City, State"),
    email: String(content.email ?? "myemailaddress@konfolio.com"),

    links,
    merchTags,
    previousVends,
    images,
  } as KonfolioDraft

  return draft
}

export default function KonfolioEditorShell({ konfolioId, initialDraft }: Props) {
  const draftsHydrated = useKonfolioDraftStore((s) => s.hasHydrated)
  const draft = useKonfolioDraftStore((s) => s.draftsById[konfolioId])
  const setDraft = useKonfolioDraftStore((s) => s.setDraft)

  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let alive = true

    const boot = async () => {
      if (!draftsHydrated) return

      // 1) If a server-provided initialDraft exists, prefer it
      if (initialDraft) {
        setDraft(konfolioId, initialDraft)
        if (!alive) return
        setBooting(false)
        return
      }

      // 2) If store already has it, we're good
      if (draft) {
        if (!alive) return
        setBooting(false)
        return
      }

      // 3) Load from backend (AUTHED)
      try {
        const sessionRes = await supabase.auth.getSession()
        const token = sessionRes.data.session?.access_token
        if (!token) {
          if (!alive) return
          setBooting(false)
          return
        }

        const res = await fetch(`/api/konfolios/${konfolioId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          const nextDraft = draftFromGetResponse(data)
          if (nextDraft) setDraft(konfolioId, nextDraft)
        } else {
          // eslint-disable-next-line no-console
          console.log("[KonfolioEditorShell] GET failed", res.status)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("[KonfolioEditorShell] GET error", e)
      }

      if (!alive) return
      setBooting(false)
    }

    boot()

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [konfolioId, initialDraft, draftsHydrated])

  const readyDraft = useKonfolioDraftStore((s) => s.draftsById[konfolioId])

  if (booting || !draftsHydrated || !readyDraft) {
    return (
      <main className="w-full min-h-[982px] bg-[#F7F7F7]">
        <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
          <div className="mx-auto max-w-[1512px]">
            <div className="flex items-start justify-center gap-[20px]">
              <div className="w-[316px] h-[982px] rounded-[15px] bg-white/60 animate-pulse" />
              <div className="w-[922px] h-[982px] flex items-center justify-center">
                <div className="w-[922px] h-[922px] grid grid-cols-3 gap-[15px]">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-[15px] bg-white/60 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (readyDraft.template === "square") return <SquareEditor draftId={konfolioId} />
  return <PortraitEditor draftId={konfolioId} />
}
