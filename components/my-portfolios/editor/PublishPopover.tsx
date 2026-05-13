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
    if (!open) {
      setExportOpen(false)
    }
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
          className="relative isolate flex max-h-[calc(100vh-32px)] w-full max-w-[872px] flex-col items-center justify-between overflow-y-auto rounded-[15px] bg-white px-5 py-[25px] shadow-[5px_5px_25px_rgba(0,0,0,0.1)] sm:px-10 lg:h-[444px] lg:px-[111px]"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 w-[52px] h-[52px] flex items-center justify-center cursor-pointer"
          >
            <span className="scale-200">
              <DeleteIcon />
            </span>
          </button>

          <div className="relative h-[18px] w-[81px] select-none">
            <div className="absolute left-[1.29px] top-[3.21px] font-[Inknut_Antiqua] font-semibold text-[17.4721px] leading-[45px] tracking-[-0.02em] text-[#262626]">
              konfolio
            </div>
          </div>

          {isPublishing ? (
            <div className="flex w-full max-w-[650px] flex-1 flex-col items-center justify-center">
              <div className="flex items-center gap-3 text-[#262626]">
                <Spinner className="h-5 w-5 animate-spin" />
                <span className="text-[15px] leading-[150%]">Publishing...</span>
              </div>
            </div>
          ) : status === "error" ? (
            <div className="flex w-full max-w-[650px] flex-1 flex-col items-center justify-center gap-3">
              <div className="text-center font-semibold text-[18px] leading-[22px] text-[#262626]">
                Something went wrong
              </div>
              <div className="text-center text-[15px] leading-[150%] text-[#262626]">
                {errorMessage || "Publish failed."}
              </div>
            </div>
          ) : status === "success" ? (
            <>
              <div className="w-full max-w-[650px] h-[211px] flex flex-col items-center gap-[50px]">
                <div className="w-full max-w-[650px] h-[16px] text-center font-semibold text-[22px] leading-[27px] text-[#262626]">
                  {captionName} has been published!
                </div>

                <div className="w-full max-w-[650px] h-[145px] flex flex-col items-start gap-5">
                  {/* View */}
                  <div className="w-full max-w-[650px] h-[35px] flex items-center overflow-hidden rounded-[100px] border border-[#D3D3D3] bg-white">
                    <button
                      type="button"
                      onClick={handleOpenTab}
                      className="h-full w-[156px] bg-[#F3F3FE] rounded-l-[100px] flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-[15px] leading-[150%] text-[#262626]">View it live</span>
                    </button>

                    <div className="h-full flex-1 flex items-center pl-5 pr-5">
                      <span className="text-[15px] leading-[150%] text-[#262626] truncate">
                        {safeLiveUrl}
                      </span>

                      <button
                        type="button"
                        onClick={handleOpenTab}
                        aria-label="Open in new tab"
                        className="ml-[7px] h-4 w-4 flex items-center justify-center text-[#A5A5A5] cursor-pointer"
                      >
                        <OpenTabIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Copy */}
                  <div className="w-full max-w-[650px] h-[35px] flex items-center overflow-hidden rounded-[100px] border border-[#D3D3D3] bg-white">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="h-full w-[156px] bg-[#F3F3FE] rounded-l-[100px] flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-[15px] leading-[150%] text-[#262626]">Copy link</span>
                    </button>

                    <div className="h-full flex-1 flex items-center pl-5 pr-5">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="w-full h-full flex items-center gap-[7px] cursor-pointer text-left"
                        aria-label="Copy link"
                        title="Copy link"
                      >
                        <span className="min-w-0 truncate text-[15px] leading-[150%] text-[#262626]">
                          {copied ? "Copied!" : safeLiveUrl}
                        </span>

                        <span className="relative flex items-center flex-shrink-0 text-[#A5A5A5]">
                          <CopyIcon className="h-4 w-4 text-[#A5A5A5] [&_path]:stroke-[#A5A5A5]" />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Export */}
                  <div className="w-full max-w-[650px] h-[35px] flex items-center overflow-hidden rounded-[100px] border border-[#D3D3D3] bg-white">
                    <button
                      type="button"
                      onClick={handleOpenExportPopover}
                      className="h-full w-[156px] bg-[#F3F3FE] rounded-l-[100px] flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-[15px] leading-[150%] text-[#262626]">Export</span>
                    </button>

                    <div className="h-full flex-1 flex items-center pl-5 pr-5">
                      <button
                        type="button"
                        onClick={handleOpenExportPopover}
                        className="w-full h-full flex items-center text-left cursor-pointer"
                        aria-label="Open export options"
                        title="Open export options"
                      >
                        <span className="min-w-0 truncate text-[15px] leading-[150%] text-[#262626]">
                          {derivedExportLabel}
                        </span>

                        <span className="ml-[7px] h-4 w-4 flex items-center justify-center text-[#A5A5A5] flex-shrink-0">
                          <ExportIcon className="h-4 w-4" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-[258px] h-[49.5px] flex flex-col items-center justify-center gap-[15px]">
                <button
                  type="button"
                  onClick={() => onGoToExplore?.()}
                  className="w-[258px] h-[21px] flex items-center px-[5px] cursor-pointer"
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
                  onClick={handleToggleExplore}
                  disabled={isTogglingExploreSearch}
                  className={[
                    "h-[13.5px] min-w-[120px] flex items-center gap-[7px]",
                    isTogglingExploreSearch ? "cursor-default opacity-70" : "cursor-pointer",
                  ].join(" ")}
                  aria-pressed={allowExploreSearch}
                  aria-busy={isTogglingExploreSearch}
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
                    {isTogglingExploreSearch ? "Saving..." : "Allow Explore Search"}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex w-full max-w-[650px] flex-1 flex-col items-center justify-center">
              <div className="text-[15px] leading-[150%] text-[#262626]">Preparing publish…</div>
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