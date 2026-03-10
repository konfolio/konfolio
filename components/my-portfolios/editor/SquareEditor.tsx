"use client"

import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import KonfolioExitGuard from "@/components/my-portfolios/KonfolioExitGuard"
import EditSquareProfileSidebar from "@/components/my-portfolios/square/EditSquareProfileSidebar"
import EditSquareImageGrid from "@/components/my-portfolios/square/EditSquareImageGrid"
import { supabase } from "@/lib/supabase/browser"

type Props = { draftId: string }

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function uploadBlobSrcToStorage(opts: {
  blobSrc: string
  konfolioId: string
  token: string
}): Promise<string> {
  const { blobSrc, konfolioId, token } = opts

  // Fetch blob bytes from the current browser context
  const blobRes = await fetch(blobSrc)
  if (!blobRes.ok) throw new Error("Failed to read local image blob")

  const blob = await blobRes.blob()

  const mime = blob.type || "application/octet-stream"
  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/jpeg"
        ? "jpeg"
        : mime === "image/webp"
          ? "webp"
          : "png"

  const file = new File([blob], `upload.${ext}`, { type: mime })

  const form = new FormData()
  form.append("file", file) 

  const upRes = await fetch(`/api/konfolios/${konfolioId}/images/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  const upJson = await upRes.json().catch(() => ({}))
  if (!upRes.ok) throw new Error(upJson?.error ?? "Image upload failed")

  const imageUrl = String(upJson?.imageUrl ?? "").trim()
  if (!imageUrl) throw new Error("Upload succeeded but no imageUrl returned")

  return imageUrl
}

export default function SquareEditor({ draftId }: Props) {
  const draft = useKonfolioDraftStore((s) => s.draftsById[draftId])
  const patchDraft = useKonfolioDraftStore((s) => s.patchDraft)

  if (!draft || draft.template !== "square") return null

  const bannerSwatches = Array.isArray((draft as any).bannerSwatches) ? (draft as any).bannerSwatches : []
  const backgroundSwatches = Array.isArray((draft as any).backgroundSwatches) ? (draft as any).backgroundSwatches : []

  const exitGuardEnabled = draft.status === "draft"

  async function handlePublish() {
  try {
    const token = await getAccessToken()
    if (!token) {
      console.error("[PUBLISH] Not signed in")
      return
    }

    //convert any blob: src into uploaded https URLs
    const images = Array.isArray(draft.images) ? [...(draft.images as any[])] : []

    for (let i = 0; i < images.length; i++) {
      const src = String(images[i]?.src ?? "")
      if (src.startsWith("blob:")) {
        const imageUrl = await uploadBlobSrcToStorage({
          blobSrc: src,
          konfolioId: draftId,
          token,
        })
        images[i] = { ...images[i], src: imageUrl }
      }
    }

    // Update local store so UI no longer holds blob: urls
    patchDraft(draftId, { images } as any)

    const content = {
      bannerColor: draft.bannerColor,
      backgroundColor: draft.backgroundColor,
      bannerSwatches,
      backgroundSwatches,
      profileImageUrl: draft.profileImageUrl,
      businessName: draft.businessName,
      displayName: draft.displayName,
      locationText: draft.locationText,
      email: draft.email,
      links: draft.links,
      merchTags: draft.merchTags,
      previousVends: draft.previousVends,
      images, //normalized images
    }

    //Save to DB
    const saveRes = await fetch(`/api/konfolios/${draftId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        template: draft.template,
        content,
      }),
    })

    const saveJson = await saveRes.json().catch(() => ({}))
    if (!saveRes.ok) {
      console.error("[PUBLISH] Save failed:", saveRes.status, saveJson)
      return
    }

    //Publish + generate thumbnail 
    const pubRes = await fetch(`/api/konfolios/${draftId}/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const pubJson = await pubRes.json().catch(() => ({}))
    if (!pubRes.ok) {
      console.error("[PUBLISH] Publish failed:", pubRes.status, pubJson)
      return
    }

    patchDraft(draftId, { status: "published" } as any)

    console.log("[PUBLISH] Success:", pubJson)
  } catch (e: any) {
    console.error("[PUBLISH] Unexpected error:", e?.message ?? e)
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
                onBack={() => (window as any).__konfolio_attempt_exit?.("/my-portfolios")}
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
      </main>
    </KonfolioExitGuard>
  )
}