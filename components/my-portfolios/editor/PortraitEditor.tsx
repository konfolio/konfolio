// components/my-portfolios/editor/PortraitEditor.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import KonfolioExitGuard from "@/components/my-portfolios/KonfolioExitGuard"
import EditPortraitProfile from "@/components/my-portfolios/portrait/EditPortraitProfile"
import EditPortraitImageGrid from "@/components/my-portfolios/portrait/EditPortraitImageGrid"
import PublishPopover from "@/components/my-portfolios/editor/PublishPopover"
import PublishMissingFieldsPopover from "@/components/my-portfolios/editor/PublishMissingFieldsPopover"

import { supabase } from "@/lib/supabase/browser"

type Props = { draftId: string; readOnly?: boolean }

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function cleanString(x: any): string {
  return String(x ?? "").trim()
}

function isMeaningfulText(x: any): boolean {
  const v = cleanString(x)
  if (!v) return false

  const lower = v.toLowerCase()

  const bannedExact = new Set([
    "your name",
    "business name",
    "city",
    "state",
    "city, state",
    "myemailaddress@konfolio.com",
    "email",
    "email address",
    "location",
    "your location",
    "add link",
    "link",
    "http://",
    "https://",
    "www.",
  ])

  if (bannedExact.has(lower)) return false

  if (lower === "https://" || lower === "http://" || lower === "www.") return false
  if (lower.startsWith("https://") && lower.length <= "https://".length + 2) return false
  if (lower.startsWith("http://") && lower.length <= "http://".length + 2) return false

  return true
}

function looksLikeRealUrl(x: any): boolean {
  const v = cleanString(x)
  if (!v) return false
  const lower = v.toLowerCase()

  if (lower === "https://" || lower === "http://" || lower === "www.") return false

  const hasDot = v.includes(".")
  const hasAlphaNum = /[a-z0-9]/i.test(v)
  if (!hasDot || !hasAlphaNum) return false

  if (lower.endsWith("instagram.com") || lower.endsWith("instagram.com/")) return false
  if (lower.endsWith("tiktok.com") || lower.endsWith("tiktok.com/")) return false

  return true
}

function looksLikeRealEmail(x: any): boolean {
  const v = cleanString(x)
  if (!v) return false
  const lower = v.toLowerCase()

  if (lower === "myemailaddress@konfolio.com") return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function isRealImageSrc(src: any): boolean {
  const v = cleanString(src)
  if (!v) return false

  const lower = v.toLowerCase()
  if (lower.includes("placeholder")) return false
  if (lower === "about:blank") return false

  return true
}

function hasAnyBusinessLink(links: any): boolean {
  if (!links) return false

  const activeKeys = Array.isArray(links?.activeKeys) ? links.activeKeys : []
  const linksByKey = links?.linksByKey && typeof links.linksByKey === "object" ? links.linksByKey : null

  if (activeKeys.length > 0 && linksByKey) {
    for (const k of activeKeys) {
      const url = (linksByKey as any)[k]
      if (looksLikeRealUrl(url)) return true
    }
    return false
  }

  if (Array.isArray(links)) {
    return links.some((l) => looksLikeRealUrl(l?.url) || looksLikeRealUrl(l))
  }

  if (typeof links === "object") {
    for (const v of Object.values(links)) {
      if (looksLikeRealUrl(v)) return true
      if (v && typeof v === "object" && looksLikeRealUrl((v as any).url)) return true
    }
  }

  return false
}

function isGridFilled(images: any, requiredSlots: number): boolean {
  const arr = Array.isArray(images) ? images : []
  const n = Math.max(0, Math.floor(requiredSlots))
  if (n === 0) return false
  if (arr.length < n) return false

  for (let i = 0; i < n; i++) {
    if (!isRealImageSrc(arr[i]?.src)) return false
  }
  return true
}

function computeMissingLabelsPortrait(draft: any) {
  const required: string[] = []
  const optional: string[] = []

  if (!isRealImageSrc(draft?.profileImageUrl)) required.push("Profile Image")
  if (!isMeaningfulText(draft?.businessName)) required.push("Business Name")
  if (!isMeaningfulText(draft?.displayName)) required.push("Your Name")
  if (!hasAnyBusinessLink(draft?.links)) required.push("Business Link")

  const merch = Array.isArray(draft?.merchTags)
    ? draft.merchTags.map((t: any) => cleanString(t)).filter(Boolean)
    : []
  if (merch.length === 0) required.push("Merchandise")

  if (!isGridFilled(draft?.images, 8)) required.push("Featured Image")

  const prev = Array.isArray(draft?.previousVends) ? draft.previousVends : []
  if (prev.length === 0) optional.push("Previous Vends")

  if (!isMeaningfulText(draft?.locationText)) optional.push("Your Location")
  if (!looksLikeRealEmail(draft?.email)) optional.push("Email Address")

  return { required, optional }
}

function snapshotForDirtyCheck(draft: any) {
  const bannerSwatches = Array.isArray(draft?.bannerSwatches) ? draft.bannerSwatches : []
  const backgroundSwatches = Array.isArray(draft?.backgroundSwatches) ? draft.backgroundSwatches : []

  return {
    template: draft?.template ?? "portrait",
    bannerColor: draft?.bannerColor ?? "",
    backgroundColor: draft?.backgroundColor ?? "",
    bannerSwatches,
    backgroundSwatches,
    profileImageUrl: draft?.profileImageUrl ?? "",
    businessName: draft?.businessName ?? "",
    displayName: draft?.displayName ?? "",
    locationText: draft?.locationText ?? "",
    email: draft?.email ?? "",
    links: draft?.links ?? null,
    merchTags: draft?.merchTags ?? [],
    previousVends: draft?.previousVends ?? [],
    images: Array.isArray(draft?.images) ? draft.images : [],
  }
}

async function uploadBlobSrcToStorage(opts: {
  blobSrc: string
  konfolioId: string
  token: string
}): Promise<string> {
  const { blobSrc, konfolioId, token } = opts

  const blobRes = await fetch(blobSrc)
  if (!blobRes.ok) throw new Error("Failed to read local image blob")
  const blob = await blobRes.blob()

  const mime = blob.type || "application/octet-stream"
  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/jpeg"
        ? "jpg"
        : mime === "image/webp"
          ? "webp"
          : "png"

  const file = new File([blob], `upload.${ext}`, { type: mime })
  const form = new FormData()
  form.append("file", file)

  const upRes = await fetch(`/api/konfolios/${konfolioId}/images/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  const upJson = await upRes.json().catch(() => ({}))
  if (!upRes.ok) throw new Error(upJson?.error ?? "Image upload failed")

  const imageUrl = String(upJson?.imageUrl ?? "").trim()
  if (!imageUrl) throw new Error("Upload succeeded but no imageUrl returned")

  return imageUrl
}

export default function PortraitEditor({ draftId, readOnly = false }: Props) {
  const draft = useKonfolioDraftStore((s) => s.draftsById[draftId])
  const patchDraft = useKonfolioDraftStore((s) => s.patchDraft)

  const [publishOpen, setPublishOpen] = useState(false)
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "success" | "error">(
    "idle"
  )
  const [publishError, setPublishError] = useState("")
  const [publishedUrl, setPublishedUrl] = useState<string>("")
  const [publishedPortfolioName, setPublishedPortfolioName] = useState<string>("")
  const [allowExploreSearch, setAllowExploreSearch] = useState(true)

  const [savedSnapshot, setSavedSnapshot] = useState<string>("")

  const [missingOpen, setMissingOpen] = useState(false)
  const [missingRequired, setMissingRequired] = useState<string[]>([])
  const [missingOptional, setMissingOptional] = useState<string[]>([])

  if (!draft || draft.template !== "portrait") return null

  useEffect(() => {
    if (!draft) return
    if (savedSnapshot) return
    setSavedSnapshot(JSON.stringify(snapshotForDirtyCheck(draft)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, !!draft])

  const currentSnapshot = useMemo(() => JSON.stringify(snapshotForDirtyCheck(draft)), [draft])
  const hasUnsavedChanges = Boolean(savedSnapshot) && currentSnapshot !== savedSnapshot

  const bannerSwatches = Array.isArray((draft as any).bannerSwatches) ? (draft as any).bannerSwatches : []
  const backgroundSwatches = Array.isArray((draft as any).backgroundSwatches)
    ? (draft as any).backgroundSwatches
    : []

  const liveUrl = useMemo(() => {
    if (publishedUrl) return publishedUrl
    if (typeof window === "undefined") return `/my-portfolios/${draftId}/preview`
    return `${window.location.origin}/my-portfolios/${draftId}/preview`
  }, [publishedUrl, draftId])

  const exitGuardEnabled = !readOnly && (draft.status === "draft" || hasUnsavedChanges)

  async function handlePublish() {
    if (readOnly) return

    setPublishOpen(true)
    setPublishStatus("publishing")
    setPublishError("")
    setPublishedUrl("")

    const initialName =
      cleanString((draft as any).portfolioName ?? (draft as any).portfolio_name) ||
      cleanString(draft.displayName) ||
      "Portfolio"
    setPublishedPortfolioName(initialName)

    try {
      const token = await getAccessToken()
      if (!token) {
        setPublishStatus("error")
        setPublishError("You must be signed in to publish.")
        return
      }

      const images = Array.isArray(draft.images) ? [...(draft.images as any[])] : []
      for (let i = 0; i < images.length; i++) {
        const src = cleanString(images[i]?.src)
        if (src.startsWith("blob:")) {
          const imageUrl = await uploadBlobSrcToStorage({ blobSrc: src, konfolioId: draftId, token })
          images[i] = { ...images[i], src: imageUrl }
        }
      }

      let profileImageUrl = cleanString(draft.profileImageUrl)
      if (profileImageUrl.startsWith("blob:")) {
        profileImageUrl = await uploadBlobSrcToStorage({
          blobSrc: profileImageUrl,
          konfolioId: draftId,
          token,
        })
      }

      patchDraft(draftId, { images, profileImageUrl } as any)

      const content = {
        bannerColor: draft.bannerColor,
        backgroundColor: draft.backgroundColor,
        bannerSwatches,
        backgroundSwatches,
        profileImageUrl,
        businessName: draft.businessName,
        displayName: draft.displayName,
        locationText: draft.locationText,
        email: draft.email,
        links: draft.links,
        merchTags: draft.merchTags,
        previousVends: draft.previousVends,
        images: images.slice(0, 8),
      }

      const saveRes = await fetch(`/api/konfolios/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ template: draft.template, content }),
      })

      const saveJson = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok) {
        setPublishStatus("error")
        setPublishError(saveJson?.error ?? "Save failed.")
        return
      }

      setSavedSnapshot(
        JSON.stringify(
          snapshotForDirtyCheck({
            ...draft,
            ...content,
            images: content.images,
            profileImageUrl,
          })
        )
      )

      const pubRes = await fetch(`/api/konfolios/${draftId}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      const pubJson = await pubRes.json().catch(() => ({}))
      if (!pubRes.ok) {
        setPublishStatus("error")
        setPublishError(pubJson?.error ?? "Publish failed.")
        return
      }

      const getRes = await fetch(`/api/konfolios/${draftId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
      const getJson = await getRes.json().catch(() => ({}))

      const portfolioNameFromDb = cleanString(getJson?.portfolioName ?? getJson?.portfolio_name)

      const portfolioSlug =
        cleanString(getJson?.portfolioSlug ?? getJson?.portfolio_slug) ||
        slugify(portfolioNameFromDb) ||
        slugify(cleanString(draft.displayName)) ||
        "portfolio"

      setPublishedPortfolioName(portfolioNameFromDb || initialName)

      const businessSlug = slugify(cleanString((content as any).businessName)) || "business"
      const origin = typeof window === "undefined" ? "" : window.location.origin
      setPublishedUrl(`${origin}/${businessSlug}/${portfolioSlug}`)

      patchDraft(draftId, { status: "published" } as any)
      setPublishStatus("success")
      console.log("[PUBLISH] Success:", pubJson)
    } catch (e: any) {
      setPublishStatus("error")
      setPublishError(e?.message ?? "Publish failed.")
    }
  }

  const onPressPublishWithValidation = useCallback(() => {
    if (readOnly) return

    const missing = computeMissingLabelsPortrait(draft)

    const hasRequired = missing.required.length > 0
    const hasOptional = missing.optional.length > 0

    if (hasRequired || hasOptional) {
      setMissingRequired(missing.required)
      setMissingOptional(missing.optional)
      setMissingOpen(true)
      return
    }

    void handlePublish()
  }, [draft, readOnly])

  useEffect(() => {
    if (readOnly) return

    ;(window as any).__konfolio_attempt_publish = () => {
      onPressPublishWithValidation()
    }

    return () => {
      try {
        delete (window as any).__konfolio_attempt_publish
      } catch {}
    }
  }, [onPressPublishWithValidation, readOnly])

  const isOptionalOnlyMode =
    !readOnly && missingOpen && missingRequired.length === 0 && missingOptional.length > 0

  const content = (
    <main className="w-full min-h-[982px]" style={{ backgroundColor: draft.backgroundColor }}>
      <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
        <div className="mx-auto max-w-[1512px]">
          <div className="flex flex-col items-center">
            <EditPortraitProfile
              editable={!readOnly}
              backHref="/my-portfolios"
              onBack={() => {
                if (readOnly) {
                  const editHref = `/my-portfolios/${draftId}/edit`
                  if (typeof window === "undefined") return
                  if (window.history.length > 1) window.history.back()
                  else window.location.href = editHref
                  return
                }

                const fn = (window as any).__konfolio_attempt_exit
                if (typeof fn === "function") {
                  fn("/my-portfolios")
                  return
                }
                window.location.href = "/my-portfolios"
              }}
              bannerColor={draft.bannerColor}
              backgroundColor={draft.backgroundColor}
              onChangeBannerColor={readOnly ? undefined : (hex) => patchDraft(draftId, { bannerColor: hex })}
              onChangeBackgroundColor={readOnly ? undefined : (hex) => patchDraft(draftId, { backgroundColor: hex })}
              bannerSwatches={bannerSwatches}
              backgroundSwatches={backgroundSwatches}
              onChangeBannerSwatches={readOnly ? undefined : (next) => patchDraft(draftId, { bannerSwatches: next } as any)}
              onChangeBackgroundSwatches={readOnly ? undefined : (next) => patchDraft(draftId, { backgroundSwatches: next } as any)}
              profileImageUrl={draft.profileImageUrl}
              onChangeProfileImage={readOnly ? undefined : (_file, objectUrl) => patchDraft(draftId, { profileImageUrl: objectUrl })}
              businessName={draft.businessName}
              onChangeBusinessName={readOnly ? undefined : (val) => patchDraft(draftId, { businessName: val })}
              displayName={draft.displayName}
              onChangeDisplayName={readOnly ? undefined : (val) => patchDraft(draftId, { displayName: val })}
              locationText={draft.locationText}
              onChangeLocationText={readOnly ? undefined : (val) => patchDraft(draftId, { locationText: val })}
              email={draft.email}
              onChangeEmail={readOnly ? undefined : (val) => patchDraft(draftId, { email: val })}
              linksValue={draft.links}
              onChangeLinks={readOnly ? undefined : (next) => patchDraft(draftId, { links: next } as any)}
              merchTags={draft.merchTags}
              onChangeMerchTags={readOnly ? undefined : (next) => patchDraft(draftId, { merchTags: next } as any)}
              publishLabel={readOnly ? "" : "Publish"}
              onPublish={readOnly ? undefined : () => onPressPublishWithValidation()}
              onOpenPreview={
                readOnly
                  ? undefined
                  : () => window.open(`/my-portfolios/${draftId}/preview`, "_blank", "noopener,noreferrer")
              }
            />

            <EditPortraitImageGrid
              editable={!readOnly}
              images={draft.images as any}
              onChangeImages={readOnly ? undefined : (images) => patchDraft(draftId, { images } as any)}
              previousVendsValue={(draft.previousVends ?? []).join(" | ")}
              onChangePreviousVends={readOnly ? undefined : (vals) => patchDraft(draftId, { previousVends: vals } as any)}
            />
          </div>
        </div>
      </div>

      {!readOnly && (
        <>
          <PublishMissingFieldsPopover
            open={missingOpen}
            requiredMissing={missingRequired}
            optionalMissing={missingOptional}
            onClose={() => setMissingOpen(false)}
            onKeepEditing={() => setMissingOpen(false)}
            onPublishAnyway={
              isOptionalOnlyMode
                ? () => {
                    setMissingOpen(false)
                    void handlePublish()
                  }
                : undefined
            }
          />

          <PublishPopover
            open={publishOpen}
            onClose={() => {
              setPublishOpen(false)
              setPublishStatus("idle")
              setPublishError("")
            }}
            portfolioName={publishedPortfolioName || cleanString(draft.displayName) || "Portfolio"}
            liveUrl={liveUrl}
            onExport={() => {}}
            allowExploreSearch={allowExploreSearch}
            onToggleExploreSearch={(next) => setAllowExploreSearch(next)}
            onGoToExplore={() => window.open("/explore", "_blank")}
            status={publishStatus}
            errorMessage={publishError}
          />
        </>
      )}
    </main>
  )

  if (readOnly) return content

  return (
    <KonfolioExitGuard enabled={exitGuardEnabled} draftId={draftId} backHref="/my-portfolios">
      {content}
    </KonfolioExitGuard>
  )
}