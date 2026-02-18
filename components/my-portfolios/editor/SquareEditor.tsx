"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import EditSquareProfileSidebar from "@/components/my-portfolios/square/EditSquareProfileSidebar"
import EditSquareImageGrid from "@/components/my-portfolios/square/EditSquareImageGrid"

type Props = { draftId: string }

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export default function SquareEditor({ draftId }: Props) {
  const router = useRouter()
  const hasHydrated = useKonfolioDraftStore((s) => s.hasHydrated)
  const draft = useKonfolioDraftStore((s) => s.draftsById[draftId])
  const patchDraft = useKonfolioDraftStore((s) => s.patchDraft)
  const deleteLocalDraft = useKonfolioDraftStore((s) => s.deleteDraft)

  const [publishing, setPublishing] = useState(false)
  const [exiting, setExiting] = useState(false)

  if (!hasHydrated) return <div className="w-full min-h-[982px] bg-[#F7F7F7]" />
  if (!draft) return <div className="w-full min-h-[982px] bg-[#F7F7F7]" />
  if (draft.template !== "square") return null

  const bannerSwatches = useMemo(() => (Array.isArray(draft.bannerSwatches) ? draft.bannerSwatches : []), [draft])
  const backgroundSwatches = useMemo(
    () => (Array.isArray(draft.backgroundSwatches) ? draft.backgroundSwatches : []),
    [draft],
  )

  async function publishToSupabase() {
    if (publishing) return
    setPublishing(true)

    try {
      const token = await getAccessToken()
      if (!token) return

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
        images: draft.images,
      }

      const res = await fetch(`/api/konfolios/${draftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "published", content }),
      })

      if (!res.ok) return
      patchDraft(draftId, { status: "published" })
    } finally {
      setPublishing(false)
    }
  }

  async function handleExit() {
    if (exiting) return
    setExiting(true)

    try {
      // If still draft, abandon: delete row in DB + remove local draft.
      if (draft.status === "draft") {
        const token = await getAccessToken()
        if (token) {
          await fetch(`/api/konfolios/${draftId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        }
        deleteLocalDraft(draftId)
      }

      router.push("/my-portfolios")
      router.refresh()
    } finally {
      setExiting(false)
    }
  }

  return (
    <main className="w-full min-h-[982px]" style={{ backgroundColor: draft.backgroundColor }}>
      <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
        <div className="mx-auto max-w-[1512px]">
          <div className="flex items-start justify-center gap-[20px]">
            <EditSquareProfileSidebar
              backHref="/my-portfolios"
              onBack={handleExit}
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
              publishLabel={publishing ? "Publishing..." : "Publish"}
              onPublish={publishToSupabase}
              onOpenPreview={() => window.open(`/my-portfolios/${draftId}/preview`, "_blank")}
            />

            <EditSquareImageGrid images={draft.images} onChangeImages={(images) => patchDraft(draftId, { images })} />
          </div>
        </div>
      </div>
    </main>
  )
}
