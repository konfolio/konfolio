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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" />

      <div
        ref={ref}
        className={[
          "relative w-[calc(100%-32px)] w-[532px] h-[561.01px]",
          "flex flex-col items-center",
          "p-[20px] gap-[20px] isolate",
          "bg-white rounded-[15px]",
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
          className="absolute right-[20px] top-[20px] cursor-pointer"
        >
          <DeleteIcon className="w-[26px] h-[26px] text-[#262626]" />
        </button>

        <div className="flex w-[492px] h-[371.01px] flex-col items-center gap-[20px]">
          <div className="flex w-[400px] h-[31px] flex-col items-center gap-[10px]">
            <div className="w-[400px] h-[9px] flex items-center justify-center text-center font-inter text-[12px] leading-[130%] font-normal text-[#A5A5A5]">
              Export
            </div>
            <div className="w-[400px] h-[12px] flex items-center justify-center text-center font-inter text-[17px] leading-[140%] font-normal text-[#262626]">
              {portfolioName}
            </div>
          </div>

          <div
            className={[
              "relative box-border w-[492px] h-[320.01px] rounded-[10px]",
              "overflow-hidden",
              "drop-shadow-[2px_4px_15px_rgba(0,0,0,0.1)]",
              "bg-[#F7F7F7]",
            ].join(" ")}
          >
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt={`${portfolioName} thumbnail`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-[linear-gradient(45deg,rgba(165,165,165,0.18)_25%,transparent_25%,transparent_50%,rgba(165,165,165,0.18)_50%,rgba(165,165,165,0.18)_75%,transparent_75%,transparent)] bg-[length:18px_18px]" />
            )}

            <div className="invisible absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <button
                type="button"
                className={[
                  "box-border flex h-[30px] min-w-[150px] w-[150px]",
                  "items-center justify-center gap-[7px]",
                  "rounded-full border border-[#262626]",
                  "bg-[rgba(255,255,255,0.5)]",
                  "px-[40px] py-[10px]",
                ].join(" ")}
              >
                <span className="font-inter text-[14px] leading-[130%] text-[#262626]">
                  Export
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-[492px] h-0 border-t border-t-[#A5A5A5]/50" />

        <div className="flex w-[492px] h-[110px] flex-col items-start gap-[10px]">
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
        "w-[492px] h-[30px] rounded-[10px]",
        "flex flex-row items-center justify-center",
        "px-[10px] gap-[10px]",
        "cursor-pointer",
        "hover:bg-[#F7F7F7] active:bg-[#F0F0F0]",
      ].join(" ")}
    >
      <div className="flex w-[472px] h-[14px] flex-row items-center gap-[10px] py-[2px]">
        <span className="hidden w-[14px] h-[14px]" />
        <span className="w-[472px] h-[10px] flex items-center justify-center text-center font-inter text-[14px] leading-[130%] font-normal text-[#262626]">
          {label}
        </span>
        <span className="hidden w-[29px] h-[10px] font-inter text-[14px] leading-[130%] text-[#A5A5A5]">
          Text
        </span>
      </div>
    </button>
  )
}