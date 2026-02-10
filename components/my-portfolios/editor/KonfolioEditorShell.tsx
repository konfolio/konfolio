// components/my-portfolios/editor/KonfolioEditorShell.tsx
"use client"

import { useEffect, useState } from "react"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import type { KonfolioDraft } from "@/components/my-portfolios/editor/editorTypes"
import SquareEditor from "@/components/my-portfolios/editor/SquareEditor"
import PortraitEditor from "@/components/my-portfolios/editor/PortraitEditor"

type Props = {
  konfolioId: string
  initialDraft?: KonfolioDraft
}

export default function KonfolioEditorShell({ konfolioId, initialDraft }: Props) {
  const draftsHydrated = useKonfolioDraftStore((s) => s.hasHydrated)

  const draft = useKonfolioDraftStore((s) => s.draftsById[konfolioId])
  const setDraft = useKonfolioDraftStore((s) => s.setDraft)

  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let alive = true

    const boot = async () => {
      if (!draftsHydrated) return

      // 1) If a server-provided initialDraft exists, prefer it
      if (initialDraft) {
        setDraft(konfolioId, initialDraft)
        if (!alive) return
        setBooting(false)
        return
      }

      // 2) If store already has it, we're good
      if (draft) {
        if (!alive) return
        setBooting(false)
        return
      }

      // 3) Load from backend
      try {
        const res = await fetch(`/api/konfolios/${konfolioId}`, { method: "GET" })
        if (res.ok) {
          const data = (await res.json()) as { draft: KonfolioDraft }
          if (data?.draft) {
            setDraft(konfolioId, data.draft)
          }
        }
      } catch {
        // ignore; UI will still show skeleton until we have a draft
      }

      if (!alive) return
      setBooting(false)
    }

    boot()

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [konfolioId, initialDraft, draftsHydrated])

  const readyDraft = useKonfolioDraftStore((s) => s.draftsById[konfolioId])

  if (booting || !draftsHydrated || !readyDraft) {
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

  if (readyDraft.template === "square") return <SquareEditor draftId={konfolioId} />
  return <PortraitEditor draftId={konfolioId} />
}
