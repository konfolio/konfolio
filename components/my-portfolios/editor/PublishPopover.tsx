"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useClickOutside from "@/components/hooks/useClickOutside"

import CopyIcon from "@/components/icons/CopyIcon"
import OpenTabIcon from "@/components/icons/OpenTabIcon"
import ExportIcon from "@/components/icons/ExportIcon"
import DeleteIcon from "@/components/icons/DeleteIcon"
import ArrowRightIcon from "@/components/icons/ArrowRight"
import ExportPopover from "@/components/my-portfolios/dashboard/ExportPopover"

type ExportType = "pdf" | "png" | "jpeg"

type Props = {
  open: boolean
  onClose: () => void

  portfolioName: string
  liveUrl: string

  exportLabel?: string
  onExport?: (type: ExportType) => void
  thumbnailUrl?: string | null

  allowExploreSearch: boolean
  onToggleExploreSearch: (next: boolean) => void
  isTogglingExploreSearch?: boolean
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
  thumbnailUrl = null,
  allowExploreSearch,
  onToggleExploreSearch,
  isTogglingExploreSearch = false,
  onGoToExplore,
  status = "idle",
  errorMessage = "",
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const copyTimeoutRef = useRef<number | null>(null)

  const [copied, setCopied] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  useClickOutside(cardRef, () => {
    if (open && !exportOpen) onClose()
  })

  useEffect(() => {
    if (!open) return
    setCopied(false)
  }, [open])

  useEffect(() => {
    if (!open) setExportOpen(false)
  }, [open])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

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
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = safeLiveUrl
      textarea.setAttribute("readonly", "")
      textarea.style.position = "absolute"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    setCopied(true)

    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopied(false)
    }, 1200)
  }

  function handleOpenTab() {
    window.open(safeLiveUrl, "_blank", "noopener,noreferrer")
  }

  function handleOpenExportPopover() {
    setExportOpen(true)
  }

  function handleExportPick(type: ExportType) {
    onExport?.(type)
    setExportOpen(false)
  }

  function handleToggleExplore() {
    if (isTogglingExploreSearch) return
    onToggleExploreSearch(!allowExploreSearch)
  }

  if (!open) return null

  const isPublishing = status === "publishing"

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Publish popover"
      >
        <button
          type="button"
          aria-label="Close publish popover"
          onClick={onClose}
          className="absolute inset-0 bg-black/20"
        />

        <div
          ref={cardRef}
          className="
            relative isolate flex w-full max-w-[872px] flex-col items-center
            overflow-y-auto rounded-[15px] bg-white shadow-[5px_5px_25px_rgba(0,0,0,0.1)]
            max-h-[calc(100vh-32px)]
            px-5 py-[25px]
            sm:px-8
            lg:min-h-[444px] lg:px-[111px]
          "
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-[52px] w-[52px] cursor-pointer items-center justify-center sm:right-5 sm:top-5"
          >
            <span className="scale-200">
              <DeleteIcon />
            </span>
          </button>

          <div className="relative h-[18px] w-[81px] shrink-0 select-none">
            <div className="absolute left-[1.29px] top-[3.21px] font-[Inknut_Antiqua] text-[17.4721px] font-semibold leading-[45px] tracking-[-0.02em] text-[#262626]">
              konfolio
            </div>
          </div>

          {isPublishing ? (
            <div className="flex w-full max-w-[650px] flex-1 flex-col items-center justify-center py-24">
              <div className="flex items-center gap-3 text-[#262626]">
                <Spinner className="h-5 w-5 animate-spin" />
                <span className="text-[15px] leading-[150%]">Publishing...</span>
              </div>
            </div>
          ) : status === "error" ? (
            <div className="flex w-full max-w-[650px] flex-1 flex-col items-center justify-center gap-3 py-24">
              <div className="text-center text-[18px] font-semibold leading-[22px] text-[#262626]">
                Something went wrong
              </div>
              <div className="text-center text-[15px] leading-[150%] text-[#262626]">
                {errorMessage || "Publish failed."}
              </div>
            </div>
          ) : status === "success" ? (
            <div className="flex w-full max-w-[650px] flex-1 flex-col items-center justify-center gap-8 pt-12 sm:gap-[50px] sm:pt-[52px]">
              <div className="w-full text-center text-[22px] font-semibold leading-[27px] text-[#262626]">
                {captionName} has been published!
              </div>

              <div className="flex w-full flex-col items-start gap-5">
                {/* View */}
                <div className="flex min-h-[35px] w-full flex-col overflow-hidden rounded-[18px] border border-[#D3D3D3] bg-white sm:h-[35px] sm:flex-row sm:rounded-[100px]">
                  <button
                    type="button"
                    onClick={handleOpenTab}
                    className="flex h-[35px] w-full shrink-0 cursor-pointer items-center justify-center bg-[#F3F3FE] sm:h-full sm:w-[156px] sm:rounded-l-[100px]"
                  >
                    <span className="text-[15px] leading-[150%] text-[#262626]">
                      View it live
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenTab}
                    className="flex min-h-[35px] min-w-0 flex-1 cursor-pointer items-center px-4 text-left sm:h-full sm:px-5"
                    aria-label="Open live portfolio"
                    title="Open live portfolio"
                  >
                    <span className="min-w-0 flex-1 truncate text-[15px] leading-[150%] text-[#262626]">
                      {safeLiveUrl}
                    </span>

                    <span className="ml-[7px] flex h-4 w-4 shrink-0 items-center justify-center text-[#A5A5A5]">
                      <OpenTabIcon className="h-4 w-4" />
                    </span>
                  </button>
                </div>

                {/* Copy */}
                <div className="flex min-h-[35px] w-full flex-col overflow-hidden rounded-[18px] border border-[#D3D3D3] bg-white sm:h-[35px] sm:flex-row sm:rounded-[100px]">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-[35px] w-full shrink-0 cursor-pointer items-center justify-center bg-[#F3F3FE] sm:h-full sm:w-[156px] sm:rounded-l-[100px]"
                  >
                    <span className="text-[15px] leading-[150%] text-[#262626]">
                      Copy link
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex min-h-[35px] min-w-0 flex-1 cursor-pointer items-center px-4 text-left sm:h-full sm:px-5"
                    aria-label="Copy link"
                    title="Copy link"
                  >
                    <span className="min-w-0 flex-1 truncate text-[15px] leading-[150%] text-[#262626]">
                      {copied ? "Copied!" : safeLiveUrl}
                    </span>

                    <span className="ml-[7px] flex h-4 w-4 shrink-0 items-center justify-center text-[#A5A5A5]">
                      <CopyIcon className="h-4 w-4 text-[#A5A5A5] [&_path]:stroke-[#A5A5A5]" />
                    </span>
                  </button>
                </div>

                {/* Export */}
                <div className="flex min-h-[35px] w-full flex-col overflow-hidden rounded-[18px] border border-[#D3D3D3] bg-white sm:h-[35px] sm:flex-row sm:rounded-[100px]">
                  <button
                    type="button"
                    onClick={handleOpenExportPopover}
                    className="flex h-[35px] w-full shrink-0 cursor-pointer items-center justify-center bg-[#F3F3FE] sm:h-full sm:w-[156px] sm:rounded-l-[100px]"
                  >
                    <span className="text-[15px] leading-[150%] text-[#262626]">
                      Export
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenExportPopover}
                    className="flex min-h-[35px] min-w-0 flex-1 cursor-pointer items-center px-4 text-left sm:h-full sm:px-5"
                    aria-label="Open export options"
                    title="Open export options"
                  >
                    <span className="min-w-0 flex-1 truncate text-[15px] leading-[150%] text-[#262626]">
                      {derivedExportLabel}
                    </span>

                    <span className="ml-[7px] flex h-4 w-4 shrink-0 items-center justify-center text-[#A5A5A5]">
                      <ExportIcon className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex w-full max-w-[330px] flex-col items-center justify-center gap-[15px] pb-1">
                <button
                  type="button"
                  onClick={() => onGoToExplore?.()}
                  className="flex w-full cursor-pointer items-center justify-center px-[5px]"
                >
                  <div className="flex min-w-0 items-center justify-center gap-[5px] text-[#A5A5A5]">
                    <span className="text-center text-[15px] leading-[150%]">
                      Look for your portfolio in Explore
                    </span>
                    <ArrowRightIcon className="h-[11px] w-[11px] shrink-0" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleToggleExplore}
                  disabled={isTogglingExploreSearch}
                  className={[
                    "flex min-h-[18px] min-w-[120px] items-center justify-center gap-[7px]",
                    isTogglingExploreSearch ? "cursor-default opacity-70" : "cursor-pointer",
                  ].join(" ")}
                  aria-pressed={allowExploreSearch}
                  aria-busy={isTogglingExploreSearch}
                >
                  <span
                    className={[
                      "flex h-[13.5px] w-[22px] shrink-0 items-center rounded-[5832.75px] p-[1.5px] transition",
                      allowExploreSearch
                        ? "justify-end bg-[#262626]"
                        : "justify-start bg-[#D3D3D3]",
                    ].join(" ")}
                  >
                    <span className="h-[10.5px] w-[10.5px] rounded-full bg-white" />
                  </span>

                  <span className="text-[12px] leading-[130%] text-[#262626]">
                    {isTogglingExploreSearch ? "Saving..." : "Allow Explore Search"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex w-full max-w-[650px] flex-1 flex-col items-center justify-center py-24">
              <div className="text-[15px] leading-[150%] text-[#262626]">
                Preparing publish…
              </div>
            </div>
          )}
        </div>
      </div>

      <ExportPopover
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        portfolioName={captionName}
        thumbnailUrl={thumbnailUrl}
        onPick={handleExportPick}
      />
    </>
  )
}