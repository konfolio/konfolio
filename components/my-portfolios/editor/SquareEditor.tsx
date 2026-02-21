"use client"

import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import KonfolioExitGuard from "@/components/my-portfolios/KonfolioExitGuard"
import EditSquareProfileSidebar from "@/components/my-portfolios/square/EditSquareProfileSidebar"
import EditSquareImageGrid from "@/components/my-portfolios/square/EditSquareImageGrid"

type Props = { draftId: string }

export default function SquareEditor({ draftId }: Props) {
  const draft = useKonfolioDraftStore((s) => s.draftsById[draftId])
  const patchDraft = useKonfolioDraftStore((s) => s.patchDraft)

  if (!draft || draft.template !== "square") return null

  const bannerSwatches = Array.isArray((draft as any).bannerSwatches) ? (draft as any).bannerSwatches : []
  const backgroundSwatches = Array.isArray((draft as any).backgroundSwatches) ? (draft as any).backgroundSwatches : []

  const exitGuardEnabled = draft.status === "draft"

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
                onPublish={() => patchDraft(draftId, { status: "published" })}
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