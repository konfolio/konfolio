// components/my-portfolios/portrait/PortraitEditor.tsx
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
type ExportType = "pdf" | "png" | "jpeg"

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

function isDarkHexColor(hex: string) {
  const cleaned = cleanString(hex).replace("#", "")
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return false

  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 150
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
  const linksByKey =
    links?.linksByKey && typeof links.linksByKey === "object" ? links.linksByKey : null

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
    explore_enabled: !!draft?.explore_enabled,
    thumbnail_url: draft?.thumbnail_url ?? null,
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
    "idle",
  )
  const [publishError, setPublishError] = useState("")
  const [publishedUrl, setPublishedUrl] = useState("")
  const [publishedPortfolioName, setPublishedPortfolioName] = useState("")
  const [allowExploreSearch, setAllowExploreSearch] = useState<boolean>(!!draft?.explore_enabled)
  const [isTogglingExploreSearch, setIsTogglingExploreSearch] = useState(false)
  const [mobileProfileExpanded, setMobileProfileExpanded] = useState(false)

  const [savedSnapshot, setSavedSnapshot] = useState("")

  const [missingOpen, setMissingOpen] = useState(false)
  const [missingRequired, setMissingRequired] = useState<string[]>([])
  const [missingOptional, setMissingOptional] = useState<string[]>([])

  if (!draft || draft.template !== "portrait") return null

  useEffect(() => {
    setAllowExploreSearch(!!draft.explore_enabled)
  }, [draft.explore_enabled])

  useEffect(() => {
    if (!draft) return
    if (savedSnapshot) return
    setSavedSnapshot(JSON.stringify(snapshotForDirtyCheck(draft)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, !!draft])

  const currentSnapshot = useMemo(() => JSON.stringify(snapshotForDirtyCheck(draft)), [draft])
  const hasUnsavedChanges = Boolean(savedSnapshot) && currentSnapshot !== savedSnapshot

  const bannerSwatches = Array.isArray(draft.bannerSwatches) ? draft.bannerSwatches : []
  const backgroundSwatches = Array.isArray(draft.backgroundSwatches) ? draft.backgroundSwatches : []
  const backgroundIsDark = isDarkHexColor(draft.backgroundColor)

  const liveUrl = useMemo(() => {
    if (publishedUrl) return publishedUrl
    if (typeof window === "undefined") return `/my-portfolios/${draftId}/preview`
    return `${window.location.origin}/my-portfolios/${draftId}/preview`
  }, [publishedUrl, draftId])

  const exitGuardEnabled = !readOnly && (draft.status === "draft" || hasUnsavedChanges)

  async function handleToggleExploreSearch(next: boolean) {
    if (isTogglingExploreSearch || readOnly) return

    const prev = allowExploreSearch

    setAllowExploreSearch(next)
    patchDraft(draftId, { explore_enabled: next })
    setIsTogglingExploreSearch(true)

    try {
      const token = await getAccessToken()
      if (!token) throw new Error("You must be signed in to update this setting.")

      const res = await fetch(`/api/konfolios/${draftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          explore_enabled: next,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error ?? "Failed to update explore setting.")
      }
    } catch (e) {
      console.error("[EXPLORE TOGGLE] Failed:", e)
      setAllowExploreSearch(prev)
      patchDraft(draftId, { explore_enabled: prev })
    } finally {
      setIsTogglingExploreSearch(false)
    }
  }

  function handleExport(type: ExportType) {
    console.log("[EXPORT] Picked type:", type)
  }

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

      const images = Array.isArray(draft.images) ? [...draft.images] : []
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

      patchDraft(draftId, {
        images,
        profileImageUrl,
        explore_enabled: allowExploreSearch,
      })

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
        body: JSON.stringify({
          template: draft.template,
          content,
          explore_enabled: allowExploreSearch,
        }),
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
            explore_enabled: allowExploreSearch,
          }),
        ),
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

      const businessSlug = slugify(cleanString(content.businessName)) || "business"
      const origin = typeof window === "undefined" ? "" : window.location.origin
      setPublishedUrl(`${origin}/${businessSlug}/${portfolioSlug}`)

      patchDraft(draftId, {
        status: "published",
        explore_enabled: allowExploreSearch,
        thumbnail_url: getJson?.thumbnail_url ?? null,
      })

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
  }, [draft, readOnly, allowExploreSearch])

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

  const profileProps = {
    backHref: "/my-portfolios",
    bannerColor: draft.bannerColor,
    backgroundColor: draft.backgroundColor,
    backgroundIsDark,
    bannerSwatches,
    backgroundSwatches,
    profileImageUrl: draft.profileImageUrl,
    businessName: draft.businessName,
    displayName: draft.displayName,
    locationText: draft.locationText,
    email: draft.email,
    linksValue: draft.links,
    merchTags: draft.merchTags,
    publishLabel: readOnly ? "" : "Publish",
  }

  const content = (
    <main className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: draft.backgroundColor }}>
      <div className="w-full px-0 py-0">
        <div className="mx-auto w-full max-w-[1512px]">
          {readOnly ? (
            <>
              <div className="hidden w-full flex-col max-[900px]:flex">
                <EditPortraitProfile
                  editable={false}
                  mobileCollapsed={true}
                  mobileExpanded={mobileProfileExpanded}
                  onToggleMobile={() => setMobileProfileExpanded((v) => !v)}
                  showAddLink={false}
                  {...profileProps}
                />

                <EditPortraitImageGrid
                  editable={false}
                  backgroundIsDark={backgroundIsDark}
                  images={draft.images}
                  previousVendsValue={(draft.previousVends ?? []).join(" | ")}
                />
              </div>

              <div className="hidden w-full flex-col items-center justify-center gap-[20px] min-[901px]:flex">
                <EditPortraitProfile editable={false} showAddLink={false} {...profileProps} />

                <div className="w-full px-[16px] sm:px-6 md:px-10 lg:px-[80px] xl:px-[120px]">
                  <EditPortraitImageGrid
                    editable={false}
                    backgroundIsDark={backgroundIsDark}
                    images={draft.images}
                    previousVendsValue={(draft.previousVends ?? []).join(" | ")}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-[20px]">
              <EditPortraitProfile
                editable={true}
                mobileCollapsed={true}
                mobileExpanded={mobileProfileExpanded}
                onToggleMobile={() => setMobileProfileExpanded((v) => !v)}
                onBack={() => {
                  const fn = (window as any).__konfolio_attempt_exit
                  if (typeof fn === "function") {
                    fn("/my-portfolios")
                    return
                  }
                  window.location.href = "/my-portfolios"
                }}
                onChangeBannerColor={(hex) => patchDraft(draftId, { bannerColor: hex })}
                onChangeBackgroundColor={(hex) => patchDraft(draftId, { backgroundColor: hex })}
                onChangeBannerSwatches={(next) => patchDraft(draftId, { bannerSwatches: next })}
                onChangeBackgroundSwatches={(next) => patchDraft(draftId, { backgroundSwatches: next })}
                onChangeProfileImage={(_file, objectUrl) => patchDraft(draftId, { profileImageUrl: objectUrl })}
                onChangeBusinessName={(val) => patchDraft(draftId, { businessName: val })}
                onChangeDisplayName={(val) => patchDraft(draftId, { displayName: val })}
                onChangeLocationText={(val) => patchDraft(draftId, { locationText: val })}
                onChangeEmail={(val) => patchDraft(draftId, { email: val })}
                onChangeLinks={(next) => patchDraft(draftId, { links: next })}
                onChangeMerchTags={(next) => patchDraft(draftId, { merchTags: next })}
                onPublish={() => onPressPublishWithValidation()}
                onOpenPreview={() =>
                  window.open(`/my-portfolios/${draftId}/preview`, "_blank", "noopener,noreferrer")
                }
                {...profileProps}
              />

              <div className="w-full px-[16px] sm:px-6 md:px-10 lg:px-[80px] xl:px-[120px]">
                <EditPortraitImageGrid
                  editable={true}
                  backgroundIsDark={backgroundIsDark}
                  images={draft.images}
                  onChangeImages={(images) => patchDraft(draftId, { images })}
                  previousVendsValue={(draft.previousVends ?? []).join(" | ")}
                  onChangePreviousVends={(vals) => patchDraft(draftId, { previousVends: vals })}
                />
              </div>
            </div>
          )}
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
            onExport={handleExport}
            thumbnailUrl={draft.thumbnail_url ?? null}
            allowExploreSearch={allowExploreSearch}
            onToggleExploreSearch={handleToggleExploreSearch}
            isTogglingExploreSearch={isTogglingExploreSearch}
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