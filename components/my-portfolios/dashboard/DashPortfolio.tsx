// /components/my-portfolios/dashboard/DashPortfolio.tsx
"use client"

import * as React from "react"

import EyeIcon from "@/components/icons/EyeIcon"
import UserIcon from "@/components/icons/UserIcon"
import HandPointingIcon from "@/components/icons/HandPointingIcon"
import TimeIcon from "@/components/icons/TimeIcon"

import CopyIcon from "@/components/icons/CopyIcon"
import OpenTabIcon from "@/components/icons/OpenTabIcon"
import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon"
import CheckIcon from "@/components/icons/CheckIcon"

import PortfolioMoreMenu, {
  type PortfolioMoreAction,
} from "@/components/my-portfolios/dashboard/PortfolioMoreMenu"
import PortfolioDeleteConfirm from "@/components/my-portfolios/dashboard/PortfolioDeleteConfirm"
import ExportPopover from "@/components/my-portfolios/dashboard/ExportPopover"
import HoverTag from "@/components/my-portfolios/dashboard/HoverTag"

import PencilIcon from "@/components/icons/PencilIcon"
import LinkIcon from "@/components/icons/LinkIcon"
import ExportIcon from "@/components/icons/ExportIcon"
import TrashIcon from "@/components/icons/TrashIcon"

type Props = {
  id: string

  portfolioName: string
  publicUrl: string

  thumbnailUrl?: string | null

  views: number
  viewers: number
  linkClicks: number

  exploreEnabled: boolean
  lastUpdatedLabel: string

  onView?: () => void
  onEdit?: () => void
  onMore?: () => void

  onCopyUrl?: () => void

  onEditName?: () => void
  onLinkAccessOnly?: () => void
  onDuplicate?: () => void
  onEditUrl?: () => void
  onExportPick?: (type: "pdf" | "png" | "jpeg") => void

  onDelete?: (id: string) => Promise<void> | void
}

function formatCompact(n: number) {
  if (!Number.isFinite(n)) return "0"
  const abs = Math.abs(n)
  if (abs >= 1_000_000)
    return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`
  return String(Math.round(n))
}

function normalizePublicUrl(url: string) {
  const trimmed = String(url ?? "").trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
  if (trimmed.startsWith("/")) return trimmed
  return `/${trimmed}`
}

export default function DashPortfolio({
  id,
  portfolioName,
  publicUrl,
  thumbnailUrl,

  views,
  viewers,
  linkClicks,

  exploreEnabled,
  lastUpdatedLabel,

  onView,
  onEdit,
  onMore,
  onCopyUrl,

  onEditName,
  onLinkAccessOnly,
  onDuplicate,
  onEditUrl,
  onExportPick,

  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [exportOpen, setExportOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const copyTimeoutRef = React.useRef<number | null>(null)

  const closeMenu = React.useCallback(() => setMenuOpen(false), [])
  const closeDelete = React.useCallback(() => setDeleteOpen(false), [])
  const closeExport = React.useCallback(() => setExportOpen(false), [])

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const resolvedPublicUrl = React.useMemo(() => normalizePublicUrl(publicUrl), [publicUrl])

  const handleOpenPublished = React.useCallback(() => {
    if (!resolvedPublicUrl) return
    window.open(resolvedPublicUrl, "_blank", "noopener,noreferrer")
  }, [resolvedPublicUrl])

  const handleCopyLink = React.useCallback(async () => {
    const url = resolvedPublicUrl
    if (!url) return

    const fullUrl =
      typeof window !== "undefined" && url.startsWith("/")
        ? `${window.location.origin}${url}`
        : url

    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = fullUrl
      textarea.setAttribute("readonly", "")
      textarea.style.position = "absolute"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    onCopyUrl?.()

    setCopied(true)
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopied(false)
    }, 1500)
  }, [resolvedPublicUrl, onCopyUrl])

  const handleMenuAction = React.useCallback(
    (action: PortfolioMoreAction) => {
      closeMenu()

      switch (action) {
        case "editName":
          onEditName?.()
          return
        case "linkAccessOnly":
          onLinkAccessOnly?.()
          return
        case "duplicate":
          onDuplicate?.()
          return
        case "editUrl":
          onEditUrl?.()
          return
        case "export":
          setExportOpen(true)
          return
        case "delete":
          setDeleteOpen(true)
          return
        default:
          return
      }
    },
    [closeMenu, onEditName, onLinkAccessOnly, onDuplicate, onEditUrl]
  )

  const handleConfirmDelete = React.useCallback(async () => {
    if (!onDelete) {
      setDeleteOpen(false)
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(id)
      setDeleteOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }, [onDelete, id])

  return (
    <div
      className={[
        "group relative w-[390px] h-[384.12px] bg-white rounded-[15px]",
        "flex flex-col items-start p-[13px] gap-[15px]",
        "transition-shadow",
        "hover:shadow-[2px_4px_25px_rgba(165,165,165,0.2)]",
      ].join(" ")}
    >
      <div
        className={[
          "relative w-full h-[236.12px] rounded-[10px] overflow-hidden",
          "shadow-[inset_2.21021px_2.05988px_9.51447px_rgba(165,165,165,0.126),inset_1.25341px_1.16816px_4.75724px_rgba(165,165,165,0.126)]",
          "drop-shadow-[2.05941px_4.11882px_25.7426px_rgba(165,165,165,0.1)]",
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

        <button
          type="button"
          onClick={onEdit}
          className={[
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "h-[30px] min-w-[150px] px-[40px] py-[10px] rounded-[100px]",
            "flex items-center justify-center gap-[7px]",
            "border border-[#262626] bg-[rgba(255,255,255,0.5)] backdrop-blur-[7.80516px]",
            "opacity-0 pointer-events-none",
            "group-hover:opacity-100 group-hover:pointer-events-auto",
            "transition-opacity",
            "text-[#262626] text-[14px] leading-[130%] font-normal",
            "cursor-pointer",
          ].join(" ")}
          aria-label="Edit"
        >
          Edit
        </button>
      </div>

      <div className="w-full h-[17px] flex items-center justify-between">
        <div className="flex items-center gap-[25px]">
          <div className="relative group/views flex items-center gap-[5px]">
            <EyeIcon className="text-[#262626]" />
            <span className="text-[#262626] text-[14px] leading-[130%] font-normal">
              {formatCompact(views)}
            </span>

            <div className="absolute left-1/2 -translate-x-1/2 top-[-31px] opacity-0 pointer-events-none group-hover/views:opacity-100 transition-opacity duration-150 z-20">
              <HoverTag label="Views" />
            </div>
          </div>

          <div className="relative group/visitors flex items-center gap-[5px]">
            <UserIcon className="text-[#262626]" />
            <span className="text-[#262626] text-[14px] leading-[130%] font-normal">
              {formatCompact(viewers)}
            </span>

            <div className="absolute left-1/2 -translate-x-1/2 top-[-31px] opacity-0 pointer-events-none group-hover/visitors:opacity-100 transition-opacity duration-150 z-20">
              <HoverTag label="Visitors" />
            </div>
          </div>

          <div className="relative group/clicks flex items-center gap-[5px]">
            <HandPointingIcon className="text-[#262626]" />
            <span className="text-[#262626] text-[14px] leading-[130%] font-normal">
              {formatCompact(linkClicks)}
            </span>

            <div className="absolute left-1/2 -translate-x-1/2 top-[-31px] opacity-0 pointer-events-none group-hover/clicks:opacity-100 transition-opacity duration-150 z-20">
              <HoverTag label="Link clicks" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[5px]">
          <CheckIcon className="text-[#262626]" />
          <span className="text-[#262626] text-[14px] leading-[130%] font-normal">
            {exploreEnabled ? "Explore" : "Private"}
          </span>
        </div>
      </div>

      <div className="w-full h-[38px] flex flex-col items-start gap-[10px]">
        <div className="w-full h-[18px] flex items-center py-[3px]">
          <div className="flex-1 text-[#262626] text-[17px] leading-[140%] font-normal truncate">
            {portfolioName}
          </div>
        </div>

        <div className="w-full h-[10px] relative">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center gap-[5px] cursor-pointer"
            aria-label="Copy published link"
            title="Copy published link"
          >
            <span className="min-w-0 truncate text-[#A5A5A5] text-[14px] leading-[130%] font-normal">
              {publicUrl}
            </span>

            {/* ICON + TOOLTIP ANCHOR */}
            <span className="relative flex items-center flex-shrink-0">
              <CopyIcon className="w-[10px] h-[10px] text-[#A5A5A5]" />

              <div
                className={[
                  "absolute left-1/2 -translate-x-1/2 top-[-38px] z-30",
                  "transition-opacity duration-200",
                  copied ? "opacity-100" : "opacity-0 pointer-events-none",
                ].join(" ")}
              >
                <HoverTag label="Copied link" />
              </div>
            </span>
          </button>
        </div>
      </div>

      <div className="w-full h-[22px] flex items-center justify-between">
        <div className="flex items-center justify-end gap-[5px]">
          <TimeIcon className="text-[#A5A5A5]" />
          <span className="text-[#A5A5A5] text-[14px] leading-[130%] font-normal">
            {lastUpdatedLabel}
          </span>
        </div>

        <div className="flex items-center justify-end gap-[5.33px]">
          <button
            type="button"
            onClick={handleOpenPublished}
            className={[
              "h-[22px] min-w-[120px] px-[20px] py-[5px] rounded-[100px]",
              "bg-[#262626] text-white",
              "inline-flex items-center justify-center gap-[5px]",
              "cursor-pointer",
            ].join(" ")}
            aria-label="View"
          >
            <span className="text-[12px] leading-[130%] font-normal">View</span>
            <OpenTabIcon className="text-white w-[12px] h-[12px]" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v)
                onMore?.()
              }}
              className="w-[22px] h-[22px] inline-flex items-center justify-center cursor-pointer"
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <ThreeDotsIcon className="text-[#262626]" />
            </button>

            <PortfolioMoreMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onAction={handleMenuAction}
              icons={{
                editName: PencilIcon,
                linkAccessOnly: LinkIcon,
                duplicate: CopyIcon,
                editUrl: PencilIcon,
                export: ExportIcon,
                delete: TrashIcon,
              }}
              figmaOffset={{ rightPx: 325, topPx: 97 }}
            />
          </div>
        </div>
      </div>

      <PortfolioDeleteConfirm
        open={deleteOpen}
        onClose={closeDelete}
        onCancel={closeDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Are you sure to delete?"
        subtitle="This portfolio cannot be recovered after deletion."
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
      />

      <ExportPopover
        open={exportOpen}
        onClose={closeExport}
        portfolioName={portfolioName}
        thumbnailUrl={thumbnailUrl ?? null}
        onPick={(type) => {
          closeExport()
          onExportPick?.(type)
        }}
      />
    </div>
  )
}