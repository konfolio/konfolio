// /components/my-portfolios/dashboard/ExportPopover.tsx
"use client"

import * as React from "react"

import useClickOutside from "@/components/hooks/useClickOutside"
import DeleteIcon from "@/components/icons/DeleteIcon"

type ExportType = "pdf" | "png" | "jpeg"

type Props = {
  open: boolean
  onClose: () => void
  portfolioName: string
  thumbnailUrl?: string | null
  onPick?: (type: ExportType) => void
}

export default function ExportPopover({
  open,
  onClose,
  portfolioName,
  thumbnailUrl = null,
  onPick,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [imageFailed, setImageFailed] = React.useState(false)

  React.useEffect(() => {
    setImageFailed(false)
  }, [thumbnailUrl, open])

  useClickOutside(ref, () => {
    if (!open) return
    onClose()
  })

  React.useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const shouldShowImage = Boolean(thumbnailUrl) && !imageFailed

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-[16px] py-[20px]">
      <div className="absolute inset-0 bg-black/20" />

      <div
        ref={ref}
        className={[
          "relative isolate",
          "flex w-full max-w-[532px] flex-col items-center",
          "max-h-[calc(100vh-40px)] overflow-y-auto",
          "rounded-[15px] bg-white",
          "p-[20px] gap-[20px]",
          "shadow-[5px_5px_25px_rgba(0,0,0,0.1)]",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Export"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[20px] top-[20px] z-10 cursor-pointer"
        >
          <DeleteIcon className="h-[26px] w-[26px] text-[#262626]" />
        </button>

        <div className="flex w-full flex-col items-center gap-[20px] pt-[2px]">
          <div className="flex w-full max-w-[400px] flex-col items-center gap-[10px] pr-[34px] pl-[34px]">
            <div className="flex min-h-[9px] w-full items-center justify-center text-center font-inter text-[12px] font-normal leading-[130%] text-[#A5A5A5]">
              Export
            </div>

            <div className="flex min-h-[12px] w-full items-center justify-center text-center font-inter text-[17px] font-normal leading-[140%] text-[#262626] break-words">
              {portfolioName}
            </div>
          </div>

          <div
            className={[
              "relative box-border w-full max-w-[492px]",
              "aspect-[492/320]",
              "min-h-[180px] rounded-[10px]",
              "overflow-hidden bg-[#F7F7F7]",
              "drop-shadow-[2px_4px_15px_rgba(0,0,0,0.1)]",
            ].join(" ")}
          >
            {shouldShowImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl ?? ""}
                alt={`${portfolioName} thumbnail`}
                className="h-full w-full object-cover"
                draggable={false}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(45deg,rgba(165,165,165,0.18)_25%,transparent_25%,transparent_50%,rgba(165,165,165,0.18)_50%,rgba(165,165,165,0.18)_75%,transparent_75%,transparent)] bg-[length:18px_18px]">
                <span className="rounded-full bg-white/70 px-[16px] py-[7px] font-inter text-[12px] leading-[130%] text-[#A5A5A5]">
                  No preview image
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-[492px] border-t border-t-[#A5A5A5]/50" />

        <div className="flex w-full max-w-[492px] flex-col items-start gap-[10px]">
          <ExportRow label="PDF" onClick={() => onPick?.("pdf")} />
          <ExportRow label="PNG" onClick={() => onPick?.("png")} />
          <ExportRow label="JPEG" onClick={() => onPick?.("jpeg")} />
        </div>
      </div>
    </div>
  )
}

function ExportRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-[30px] w-full items-center justify-center",
        "rounded-[10px] px-[10px]",
        "cursor-pointer",
        "hover:bg-[#F7F7F7] active:bg-[#F0F0F0]",
      ].join(" ")}
    >
      <span className="flex w-full items-center justify-center text-center font-inter text-[14px] font-normal leading-[130%] text-[#262626]">
        {label}
      </span>
    </button>
  )
}