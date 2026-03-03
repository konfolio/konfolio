// /components/my-portfolios/editor/PublishPopover.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useClickOutside from "@/components/hooks/useClickOutside"

import CopyIcon from "@/components/icons/CopyIcon"
import OpenTabIcon from "@/components/icons/OpenTabIcon"
import ExportIcon from "@/components/icons/ExportIcon"
import DeleteIcon from "@/components/icons/DeleteIcon"
import ArrowRightIcon from "@/components/icons/ArrowRight"

type Props = {
  open: boolean
  onClose: () => void

  portfolioName: string
  liveUrl: string

  exportLabel?: string
  onExport?: () => void

  allowExploreSearch: boolean
  onToggleExploreSearch: (next: boolean) => void
  onGoToExplore?: () => void

  status?: "idle" | "publishing" | "success" | "error"
  errorMessage?: string
}

function safeFilenameBase(name: string) {
  const base = (name || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "portfolio"
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.5C6.753 2.5 2.5 6.753 2.5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function PublishPopover({
  open,
  onClose,
  portfolioName,
  liveUrl,
  exportLabel,
  onExport,
  allowExploreSearch,
  onToggleExploreSearch,
  onGoToExplore,
  status = "idle",
  errorMessage = "",
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  useClickOutside(cardRef, () => {
    if (open) onClose()
  })

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setCopied(false)
  }, [open])

  const captionName = (portfolioName || "").trim() || "Portfolio"

  const safeLiveUrl = useMemo(() => {
    try {
      return new URL(liveUrl).toString()
    } catch {
      return liveUrl
    }
  }, [liveUrl])

  const derivedExportLabel = useMemo(() => {
    if (exportLabel && exportLabel.trim()) return exportLabel.trim()
    return `${safeFilenameBase(captionName)}.pdf / .png / .jpg`
  }, [exportLabel, captionName])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(safeLiveUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // no-op
    }
  }

  function handleOpenTab() {
    window.open(safeLiveUrl, "_blank", "noopener,noreferrer")
  }

  function handleExport() {
    onExport?.()
  }

  if (!open) return null

  // Show spinner while we’re not in a terminal state.
  // This allows an initial "idle" render to still show loading until SquareEditor flips to success/error.
  const isPublishing = status !== "success" && status !== "error"

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Publish popover"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close publish popover"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
      />

      {/* Card: fixed size, NO SCROLL */}
      <div
        ref={cardRef}
        className={[
          "relative isolate",
          "bg-white rounded-[15px]",
          "shadow-[5px_5px_25px_rgba(0,0,0,0.1)]",
          "w-[872px] h-[444px]",
          "px-[111px] py-[25px]",
          "flex flex-col items-center justify-between",
        ].join(" ")}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 h-[26px] w-[26px] flex items-center justify-center"
        >
          <DeleteIcon className="h-[26px] w-[26px]" />
        </button>

        {/* Logo */}
        <div className="relative h-[18px] w-[81px] select-none">
          <div
            className={[
              "absolute left-[1.29px] top-[3.21px]",
              "font-[Inknut_Antiqua] font-semibold",
              "text-[17.4721px] leading-[45px] tracking-[-0.02em]",
              "text-[#262626]",
            ].join(" ")}
          >
            konfolio
          </div>
        </div>

        {/* Middle: Loading / Error / Success */}
        {isPublishing ? (
          <div className="w-[650px] flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 text-[#262626]">
              <Spinner className="h-5 w-5 animate-spin" />
              <span className="text-[15px] leading-[150%]">Publishing...</span>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="w-[650px] flex-1 flex flex-col items-center justify-center gap-3">
            <div className="text-center font-semibold text-[18px] leading-[22px] text-[#262626]">
              Something went wrong
            </div>
            <div className="text-center text-[15px] leading-[150%] text-[#262626]">
              {errorMessage || "Publish failed."}
            </div>
          </div>
        ) : (
          <>
            {/* Success (full components) */}
            <div className="w-[650px] h-[211px] flex flex-col items-center gap-[50px]">
              <div className="w-[650px] h-[16px] text-center font-semibold text-[22px] leading-[27px] text-[#262626]">
                {captionName} has been published!
              </div>

              <div className="w-[650px] h-[145px] flex flex-col items-start gap-5">
                {/* View it live */}
                <div className="w-[650px] h-[35px] flex items-center overflow-hidden rounded-[100px] border border-[#D3D3D3] bg-white">
                  <button
                    type="button"
                    onClick={handleOpenTab}
                    className="h-full w-[156px] bg-[#F3F3FE] rounded-l-[100px] flex items-center justify-center"
                  >
                    <span className="text-[15px] leading-[150%] text-[#262626]">
                      View it live
                    </span>
                  </button>

                  <div className="h-full flex-1 flex items-center pl-5 pr-5">
                    <span className="text-[15px] leading-[150%] text-[#262626] truncate flex-1">
                      {safeLiveUrl}
                    </span>

                    <button
                      type="button"
                      onClick={handleOpenTab}
                      aria-label="Open in new tab"
                      className="ml-[7px] h-4 w-4 shrink-0 flex items-center justify-center text-[#A5A5A5]"
                    >
                      <OpenTabIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Copy link */}
                <div className="w-[650px] h-[35px] flex items-center overflow-hidden rounded-[100px] border border-[#D3D3D3] bg-white">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-full w-[156px] bg-[#F3F3FE] rounded-l-[100px] flex items-center justify-center"
                  >
                    <span className="text-[15px] leading-[150%] text-[#262626]">
                      {copied ? "Copied" : "Copy link"}
                    </span>
                  </button>

                  <div className="h-full flex-1 flex items-center pl-5 pr-5">
                    <span className="text-[15px] leading-[150%] text-[#262626] truncate flex-1">
                      {safeLiveUrl}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopy}
                      aria-label="Copy link"
                      className="ml-[7px] h-4 w-4 shrink-0 flex items-center justify-center text-[#A5A5A5]"
                    >
                      <CopyIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Export */}
                <div className="w-[650px] h-[35px] flex items-center overflow-hidden rounded-[100px] border border-[#D3D3D3] bg-white">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="h-full w-[156px] bg-[#F3F3FE] rounded-l-[100px] flex items-center justify-center"
                  >
                    <span className="text-[15px] leading-[150%] text-[#262626]">
                      Export
                    </span>
                  </button>

                  <div className="h-full flex-1 flex items-center pl-5 pr-5">
                    <span className="text-[15px] leading-[150%] text-[#262626] truncate flex-1">
                      {derivedExportLabel}
                    </span>

                    <button
                      type="button"
                      onClick={handleExport}
                      aria-label="Export"
                      className="ml-[7px] h-4 w-4 shrink-0 flex items-center justify-center text-[#A5A5A5]"
                    >
                      <ExportIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle section */}
            <div className="w-[258px] h-[49.5px] flex flex-col items-center justify-center gap-[15px]">
              <button
                type="button"
                onClick={() => onGoToExplore?.()}
                className="w-[258px] h-[21px] flex items-center px-[5px]"
              >
                <div className="flex items-center gap-[5px] text-[#A5A5A5]">
                  <span className="text-[15px] leading-[150%]">
                    Look for your portfolio in Explore
                  </span>
                  <ArrowRightIcon className="h-[11px] w-[11px]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onToggleExploreSearch(!allowExploreSearch)}
                className="h-[13.5px] min-w-[120px] flex items-center gap-[7px]"
                aria-pressed={allowExploreSearch}
              >
                <span
                  className={[
                    "w-[22px] h-[13.5px] rounded-[5832.75px] p-[1.5px] flex items-center transition",
                    allowExploreSearch
                      ? "bg-[#262626] justify-end"
                      : "bg-[#D3D3D3] justify-start",
                  ].join(" ")}
                >
                  <span className="w-[10.5px] h-[10.5px] rounded-full bg-white" />
                </span>

                <span className="text-[12px] leading-[130%] text-[#262626]">
                  Allow Explore Search
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}