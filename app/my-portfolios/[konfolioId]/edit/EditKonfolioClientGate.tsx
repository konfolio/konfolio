// app/my-portfolios/[konfolioId]/edit/EditKonfolioClientGate.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOnboardingDraft } from "@/stores/onboardingDraft"
import KonfolioEditorShell from "@/components/my-portfolios/editor/KonfolioEditorShell"

export default function EditKonfolioClientGate({ konfolioId }: { konfolioId: string }) {
  const router = useRouter()
  const hasHydrated = useOnboardingDraft((s) => s.hasHydrated)
  const mode = useOnboardingDraft((s) => s.mode)

  // Gate after hydration so we don't incorrectly redirect while mode is still undefined.
  useEffect(() => {
    if (!hasHydrated) return
    if (mode !== "artist") router.replace("/my-portfolios")
  }, [hasHydrated, mode, router])

  if (!hasHydrated) return null
  if (mode !== "artist") return null

  return <KonfolioEditorShell konfolioId={konfolioId} />
}
