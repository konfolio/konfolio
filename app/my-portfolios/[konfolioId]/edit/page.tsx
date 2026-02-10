// app/my-portfolios/[konfolioId]/edit/page.tsx
"use client"

import { use } from "react"
import KonfolioEditorShell from "@/components/my-portfolios/editor/KonfolioEditorShell"

export default function Page({ params }: { params: Promise<{ konfolioId: string }> }) {
  const { konfolioId } = use(params)
  return <KonfolioEditorShell konfolioId={konfolioId} />
}
