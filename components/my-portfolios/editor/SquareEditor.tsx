// components/my-portfolios/editor/SquareEditor.tsx — DEBUG VERSION (no fallback creation here)
"use client"

import { useEffect } from "react"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import EditSquareProfileSidebar from "@/components/my-portfolios/square/EditSquareProfileSidebar"
import EditSquareImageGrid from "@/components/my-portfolios/square/EditSquareImageGrid"

type Props = { draftId: string }

export default function SquareEditor({ draftId }: Props) {
  const hasHydrated = useKonfolioDraftStore((s) => s.hasHydrated)
  const draft = useKonfolioDraftStore((s) => s.draftsById[draftId])
  const patchDraft = useKonfolioDraftStore((s) => s.patchDraft)

  useEffect(() => {
    if (!hasHydrated) return
    console.log("[SQUARE] mount", { draftId })
    console.log("[SQUARE] store draft on mount:", useKonfolioDraftStore.getState().draftsById[draftId])
  }, [hasHydrated, draftId])

  useEffect(() => {
    if (!hasHydrated) return
    console.log("[SQUARE] draft changed:", draft)
    console.log("[SQUARE] draft source:", (draft as any)?._debugSource)
  }, [hasHydrated, draft])

  if (!hasHydrated) return <div className="w-full min-h-[982px] bg-[#F7F7F7]" />
  if (!draft) return <div className="w-full min-h-[982px] bg-[#F7F7F7]" />
  if (draft.template !== "square") return null

  const bannerSwatches = Array.isArray(draft.bannerSwatches) ? draft.bannerSwatches : []
  const backgroundSwatches = Array.isArray(draft.backgroundSwatches) ? draft.backgroundSwatches : []

  return (
    <main className="w-full min-h-[982px]" style={{ backgroundColor: draft.backgroundColor }}>
      <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
        <div className="mx-auto max-w-[1512px]">
          <div className="flex items-start justify-center gap-[20px]">
            <EditSquareProfileSidebar
              backHref="/my-portfolios"
              bannerColor={draft.bannerColor}
              backgroundColor={draft.backgroundColor}
              onChangeBannerColor={(hex) => patchDraft(draftId, { bannerColor: hex })}
              onChangeBackgroundColor={(hex) => patchDraft(draftId, { backgroundColor: hex })}
              bannerSwatches={bannerSwatches}
              backgroundSwatches={backgroundSwatches}
              onChangeBannerSwatches={(next) => patchDraft(draftId, { bannerSwatches: next })}
              onChangeBackgroundSwatches={(next) => patchDraft(draftId, { backgroundSwatches: next })}
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
              onPublish={() => patchDraft(draftId, { status: "published" })}
              onOpenPreview={() => window.open(`/my-portfolios/${draftId}/preview`, "_blank")}
            />

            <EditSquareImageGrid
              images={draft.images}
              onChangeImages={(images) => patchDraft(draftId, { images })}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
