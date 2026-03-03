// components/my-portfolios/square/SquareEditor.tsx
"use client"

import { useEffect, useMemo, useState } from "react"

import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import KonfolioExitGuard from "@/components/my-portfolios/KonfolioExitGuard"
import EditSquareProfileSidebar from "@/components/my-portfolios/square/EditSquareProfileSidebar"
import EditSquareImageGrid from "@/components/my-portfolios/square/EditSquareImageGrid"
import PublishPopover from "@/components/my-portfolios/editor/PublishPopover"

import { supabase } from "@/lib/supabase/browser"

type Props = { draftId: string }

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

function snapshotForDirtyCheck(draft: any) {
  const bannerSwatches = Array.isArray(draft?.bannerSwatches) ? draft.bannerSwatches : []
  const backgroundSwatches = Array.isArray(draft?.backgroundSwatches) ? draft.backgroundSwatches : []

  return {
    template: draft?.template ?? "square",
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

export default function SquareEditor({ draftId }: Props) {
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

  if (!draft || draft.template !== "square") return null

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

  // IMPORTANT:
  // - If status is draft: always guard on exit (arrow press/back/refresh)
  // - If status is published: guard only when there are unsaved edits after publish
  const exitGuardEnabled = draft.status === "draft" || hasUnsavedChanges

  async function handlePublish() {
    setPublishOpen(true)
    setPublishStatus("publishing")
    setPublishError("")
    setPublishedUrl("")

    const initialName =
      String((draft as any).portfolioName ?? (draft as any).portfolio_name ?? "").trim() ||
      String(draft.displayName ?? "").trim() ||
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
        const src = String(images[i]?.src ?? "")
        if (src.startsWith("blob:")) {
          const imageUrl = await uploadBlobSrcToStorage({ blobSrc: src, konfolioId: draftId, token })
          images[i] = { ...images[i], src: imageUrl }
        }
      }

      let profileImageUrl = String(draft.profileImageUrl ?? "").trim()
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
        images,
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

      // After PATCH, this is now the saved baseline (publish flow always saves)
      setSavedSnapshot(JSON.stringify(snapshotForDirtyCheck({ ...draft, ...content, images, profileImageUrl })))

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

      const portfolioNameFromDb = String(getJson?.portfolioName ?? getJson?.portfolio_name ?? "").trim()

      const portfolioSlug =
        String(getJson?.portfolioSlug ?? getJson?.portfolio_slug ?? "").trim() ||
        slugify(portfolioNameFromDb) ||
        slugify(String(draft.displayName ?? "")) ||
        "portfolio"

      setPublishedPortfolioName(portfolioNameFromDb || initialName)

      const businessSlug = slugify(String((content as any).businessName ?? "")) || "business"
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

  return (
    <KonfolioExitGuard enabled={exitGuardEnabled} draftId={draftId} backHref="/my-portfolios">
      <main className="w-full min-h-[982px]" style={{ backgroundColor: draft.backgroundColor }}>
        <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
          <div className="mx-auto max-w-[1512px]">
            <div className="flex items-start justify-center gap-[20px]">
              <EditSquareProfileSidebar
                backHref="/my-portfolios"
                onBack={() => {
                  const fn = (window as any).__konfolio_attempt_exit
                  if (typeof fn === "function") {
                    fn("/my-portfolios")
                    return
                  }
                  window.location.href = "/my-portfolios"
                }}
                bannerColor={draft.bannerColor}
                backgroundColor={draft.backgroundColor}
                onChangeBannerColor={(hex) => patchDraft(draftId, { bannerColor: hex })}
                onChangeBackgroundColor={(hex) => patchDraft(draftId, { backgroundColor: hex })}
                bannerSwatches={bannerSwatches}
                backgroundSwatches={backgroundSwatches}
                onChangeBannerSwatches={(next) => patchDraft(draftId, { bannerSwatches: next } as any)}
                onChangeBackgroundSwatches={(next) => patchDraft(draftId, { backgroundSwatches: next } as any)}
                profileImageUrl={draft.profileImageUrl}
                onChangeProfileImage={(_file, objectUrl) => patchDraft(draftId, { profileImageUrl: objectUrl })}
                businessName={draft.businessName}
                displayName={draft.displayName}
                onChangeBusinessName={(val) => patchDraft(draftId, { businessName: val })}
                onChangeDisplayName={(val) => patchDraft(draftId, { displayName: val })}
                locationText={draft.locationText}
                onChangeLocationText={(val) => patchDraft(draftId, { locationText: val })}
                email={draft.email}
                onChangeEmail={(val) => patchDraft(draftId, { email: val })}
                previousVends={draft.previousVends}
                onChangePreviousVends={(vals) => patchDraft(draftId, { previousVends: vals })}
                linksValue={draft.links}
                onChangeLinks={(next) => patchDraft(draftId, { links: next })}
                merchTags={draft.merchTags}
                onChangeMerchTags={(next) => patchDraft(draftId, { merchTags: next })}
                publishLabel="Publish"
                onPublish={() => void handlePublish()}
                onOpenPreview={() => window.open(`/my-portfolios/${draftId}/preview`, "_blank")}
              />

              <EditSquareImageGrid
                images={draft.images as any}
                onChangeImages={(images) => patchDraft(draftId, { images } as any)}
              />
            </div>
          </div>
        </div>

        <PublishPopover
          open={publishOpen}
          onClose={() => {
            setPublishOpen(false)
            setPublishStatus("idle")
            setPublishError("")
          }}
          portfolioName={publishedPortfolioName || String(draft.displayName ?? "").trim() || "Portfolio"}
          liveUrl={liveUrl}
          onExport={() => {}}
          allowExploreSearch={allowExploreSearch}
          onToggleExploreSearch={(next) => setAllowExploreSearch(next)}
          onGoToExplore={() => window.open("/explore", "_blank")}
          status={publishStatus}
          errorMessage={publishError}
        />
      </main>
    </KonfolioExitGuard>
  )
}