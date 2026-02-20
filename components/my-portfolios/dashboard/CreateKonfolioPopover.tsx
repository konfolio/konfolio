"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import DeleteIcon from "@/components/icons/DeleteIcon"
import useClickOutside from "@/components/hooks/useClickOutside"
import CreateKonfolioCard from "@/components/my-portfolios/CreateKonfolioCard"

import { supabase } from "@/lib/supabase/browser"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import type { KonfolioDraft } from "@/components/my-portfolios/editor/editorTypes"

type TemplateType = "square" | "portrait"
type SocialKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

type Props = {
  open: boolean
  onClose: () => void
  onPickTemplate: (t: TemplateType) => void

  portfolioName?: string

  disabled?: boolean
  primaryLoadingLabel?: string
  viewportPadding?: number
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

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

// Convert create-from-template response -> KonfolioDraft (same shape your editor expects)
function draftFromCreateResponse(data: any): KonfolioDraft | null {
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

  return {
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
}

export default function CreateKonfolioPopover({
  open,
  onClose,
  onPickTemplate,
  portfolioName,
  disabled,
  primaryLoadingLabel,
  viewportPadding = 24,
}: Props) {
  const router = useRouter()

  const panelRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  const hasKonfolioHydrated = useKonfolioDraftStore((s) => s.hasHydrated)
  const forceKonfolioHydrate = useKonfolioDraftStore((s) => s.forceHydrate)
  const setDraft = useKonfolioDraftStore((s) => s.setDraft)

  const BASE_W = 1254
  const BASE_H = 766

  // header h-[18px] + gap-[41px]
  const WHITE_CARD_TOP = 59

  useLayoutEffect(() => {
    if (!open) return

    const compute = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight

      const availW = Math.max(0, vw - viewportPadding * 2)
      const availH = Math.max(0, vh - viewportPadding * 2)

      const sW = availW / BASE_W
      const sH = availH / BASE_H
      const next = Math.min(1, sW, sH)

      setScale(Math.max(0.6, next))
    }

    compute()
    window.addEventListener("resize", compute)
    return () => window.removeEventListener("resize", compute)
  }, [open, viewportPadding])

  useClickOutside(panelRef, () => {
    if (open) onClose()
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  async function handlePickTemplate(t: TemplateType) {
    if (isCreating) return
    setIsCreating(true)

    try {
      // Make sure draft store is ready before we seed it
      if (!hasKonfolioHydrated) {
        try {
          await forceKonfolioHydrate()
        } catch {}
      }

      const token = await getAccessToken()
      if (!token) return

      const res = await fetch("/api/konfolios/create-from-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          template: t,
          portfolioName: (portfolioName || "").trim() || null,
        }),
      })

      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.log(
          "[CreateKonfolioPopover] create-from-template failed:",
          res.status,
          await res.text(),
        )
        return
      }

      const data = await res.json()

      const draft = draftFromCreateResponse(data)
      if (!draft) return

      // Seed Zustand immediately so /edit renders instantly (no stuck skeleton)
      setDraft(draft.id, draft)

      // optional parent callback
      onPickTemplate(t)

      onClose()
      router.push(`/my-portfolios/${draft.id}/edit`)
      router.refresh()
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/25" />

      <div
        ref={panelRef}
        className="relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute
            right-[18px]
            z-[210]
            flex items-center justify-center
            hover:opacity-70
            active:opacity-50
            transition-opacity
          "
          style={{
            top: WHITE_CARD_TOP + 18,
          }}
        >
          <DeleteIcon className="w-[20px] h-[20px]" />
        </button>

        <CreateKonfolioCard
          title=""
          infoText="We work with templates to reduce variety and support our auto-fill system."
          disabled={disabled || isCreating}
          primaryLoadingLabel={primaryLoadingLabel}
          onPickTemplate={(t) => handlePickTemplate(t)}
        />
      </div>
    </div>
  )
}