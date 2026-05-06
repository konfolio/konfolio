"use client"

import { useEffect, useState } from "react"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import type { KonfolioDraft } from "@/components/my-portfolios/editor/editorTypes"
import SquareEditor from "@/components/my-portfolios/editor/SquareEditor"
import PortraitEditor from "@/components/my-portfolios/editor/PortraitEditor"
import { supabase } from "@/lib/supabase/browser"

type Props = {
  konfolioId: string
  initialDraft?: KonfolioDraft
  /**
   * edit: normal editor experience (default)
   * preview: renders the portfolio preview (no edit affordances)
   */
  mode?: "edit" | "preview"
}

type SocialKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

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

function safeJsonParseObject(input: unknown): Record<string, any> {
  if (!input) return {}
  if (typeof input === "object") return input as Record<string, any>
  if (typeof input !== "string") return {}

  try {
    const parsed = JSON.parse(input)
    return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : {}
  } catch {
    return {}
  }
}

function normalizeUpdatedAt(data: any): number {
  const n = data?.updatedAt
  if (typeof n === "number" && Number.isFinite(n)) return n

  const s1 = data?.updatedAt
  if (typeof s1 === "string") {
    const t = new Date(s1).getTime()
    if (Number.isFinite(t)) return t
  }

  const s2 = data?.updated_at
  if (typeof s2 === "string") {
    const t = new Date(s2).getTime()
    if (Number.isFinite(t)) return t
  }

  return Date.now()
}

/**
 * Your GET route returns:
 * { id, template, status, updatedAt, content, explore_enabled, thumbnail_url }
 * content may be JSON object OR stringified JSON.
 */
function draftFromGetResponse(data: any): KonfolioDraft | null {
  const id = String(data?.id ?? "").trim()
  const template = data?.template

  if (!id) return null
  if (template !== "square" && template !== "portrait") return null

  const content = safeJsonParseObject(data?.content)

  const links =
    content.links &&
    typeof content.links === "object" &&
    Array.isArray((content.links as any).activeKeys) &&
    (content.links as any).linksByKey &&
    typeof (content.links as any).linksByKey === "object"
      ? (content.links as any)
      : defaultLinks()

  const merchTags = Array.isArray(content.merchTags) ? content.merchTags : []
  const previousVends = Array.isArray(content.previousVends) ? content.previousVends : []
  const images = Array.isArray(content.images) ? content.images : []

  const draft: KonfolioDraft = {
    id,
    template,
    status: data?.status === "published" ? "published" : "draft",
    updatedAt: normalizeUpdatedAt(data),

    explore_enabled: !!data?.explore_enabled,
    thumbnail_url: data?.thumbnail_url ?? null,

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

export default function KonfolioEditorShell({ konfolioId, initialDraft, mode = "edit" }: Props) {
  const draft = useKonfolioDraftStore((s) => s.draftsById[konfolioId])
  const setDraft = useKonfolioDraftStore((s) => s.setDraft)

  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let alive = true

    const boot = async () => {
      setBooting(true)

      if (initialDraft) {
        setDraft(konfolioId, initialDraft)
        if (!alive) return
        setBooting(false)
        return
      }

      if (draft) {
        if (!alive) return
        setBooting(false)
        return
      }

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
          console.log("[KonfolioEditorShell] GET failed", res.status)
        }
      } catch (e) {
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
  }, [konfolioId, initialDraft])

  const readyDraft = useKonfolioDraftStore((s) => s.draftsById[konfolioId])

  if (booting || !readyDraft) {
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

  const readOnly = mode === "preview"

  if (readyDraft.template === "square") {
    return <SquareEditor draftId={konfolioId} readOnly={readOnly} />
  }

  return <PortraitEditor draftId={konfolioId} readOnly={readOnly} />
}