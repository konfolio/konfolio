// app/my-portfolios/[konfolioId]/preview/page.tsx
"use client"

import { use, useEffect } from "react"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"

import SquareEditor from "@/components/my-portfolios/editor/SquareEditor"
import PortraitEditor from "@/components/my-portfolios/editor/PortraitEditor"

export default function Page({
  params,
}: {
  params: Promise<{ konfolioId: string }>
}) {
  const { konfolioId } = use(params)

  const hasHydrated = useKonfolioDraftStore((s) => s.hasHydrated)
  const forceHydrate = useKonfolioDraftStore((s) => s.forceHydrate)
  const draft = useKonfolioDraftStore((s) => s.draftsById[konfolioId])

  useEffect(() => {
    if (hasHydrated) return
    void forceHydrate()
  }, [hasHydrated, forceHydrate])

  if (!hasHydrated) return null
  if (!draft) return null

  if (draft.template === "square") {
    return <SquareEditor draftId={konfolioId} readOnly />
  }

  if (draft.template === "portrait") {
    return <PortraitEditor draftId={konfolioId} readOnly />
  }

  return null
}