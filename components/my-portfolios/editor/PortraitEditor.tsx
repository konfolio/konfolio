// components/my-portfolios/editor/PortraitEditor.tsx
"use client"

export default function PortraitEditor({ draftId }: { draftId: string }) {
  return (
    <div className="w-full min-h-[982px] bg-[#F7F7F7] flex items-center justify-center">
      <p className="font-inter text-[#A5A5A5]">Portrait editor coming soon (draft {draftId})</p>
    </div>
  )
}
