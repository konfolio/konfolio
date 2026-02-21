"use client"

import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import KonfolioExitGuard from "@/components/my-portfolios/KonfolioExitGuard"
import EditPortraitProfile from "@/components/my-portfolios/portrait/EditPortraitProfile"
import EditPortraitImageGrid from "@/components/my-portfolios/portrait/EditPortraitImageGrid"

type Props = { draftId: string }

export default function PortraitEditor({ draftId }: Props) {
  const draft = useKonfolioDraftStore((s) => s.draftsById[draftId])
  const patchDraft = useKonfolioDraftStore((s) => s.patchDraft)

  if (!draft || draft.template !== "portrait") return null

  const bannerSwatches = Array.isArray((draft as any).bannerSwatches) ? (draft as any).bannerSwatches : []
  const backgroundSwatches = Array.isArray((draft as any).backgroundSwatches) ? (draft as any).backgroundSwatches : []

  const exitGuardEnabled = draft.status === "draft"

  return (
    <KonfolioExitGuard enabled={exitGuardEnabled} draftId={draftId} backHref="/my-portfolios">
      <main className="w-full min-h-[982px]" style={{ backgroundColor: draft.backgroundColor }}>
        <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
          <div className="mx-auto max-w-[1512px]">
            <div className="flex flex-col items-center">
              <EditPortraitProfile
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
                onChangeBusinessName={(val) => patchDraft(draftId, { businessName: val })}
                displayName={draft.displayName}
                onChangeDisplayName={(val) => patchDraft(draftId, { displayName: val })}
                locationText={draft.locationText}
                onChangeLocationText={(val) => patchDraft(draftId, { locationText: val })}
                email={draft.email}
                onChangeEmail={(val) => patchDraft(draftId, { email: val })}
                linksValue={draft.links}
                onChangeLinks={(next) => patchDraft(draftId, { links: next })}
                merchTags={draft.merchTags}
                onChangeMerchTags={(next) => patchDraft(draftId, { merchTags: next })}
                publishLabel="Publish"
                onPublish={() => patchDraft(draftId, { status: "published" })}
                onOpenPreview={() => window.open(`/my-portfolios/${draftId}/preview`, "_blank")}
              />

              <EditPortraitImageGrid
                images={draft.images as any}
                onChangeImages={(images) => patchDraft(draftId, { images } as any)}
                previousVendsValue={(draft.previousVends ?? []).join(" | ")}
              />
            </div>
          </div>
        </div>
      </main>
    </KonfolioExitGuard>
  )
}