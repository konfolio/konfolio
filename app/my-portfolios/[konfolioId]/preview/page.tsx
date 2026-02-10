// app/my-portfolios/[konfolioId]/preview/page.tsx
"use client"

import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"

export default function PreviewPage({ params }: { params: { konfolioId: string } }) {
  const draft = useKonfolioDraftStore((s) => s.draftsById[params.konfolioId])

  if (!draft) return <div className="w-full min-h-screen bg-[#F7F7F7]" />

  return (
    <main className="w-full min-h-screen" style={{ backgroundColor: draft.template === "square" ? draft.backgroundColor : "#F7F7F7" }}>
      <div className="mx-auto max-w-[900px] py-[40px] px-[25px]">
        <h1 className="font-inter text-[22px] text-[#262626] mb-[10px]">Preview</h1>
        <pre className="bg-white rounded-[15px] p-[20px] overflow-auto text-[12px]">
          {JSON.stringify(draft, null, 2)}
        </pre>
      </div>
    </main>
  )
}
