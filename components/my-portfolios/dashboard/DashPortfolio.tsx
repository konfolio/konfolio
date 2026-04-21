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
import PortfolioSlugDuplicatePopup from "@/components/my-portfolios/dashboard/PortfolioSlugDuplicatePopup"
import PortfolioNameDuplicatePopup from "@/components/my-portfolios/dashboard/PortfolioNameDuplicatePopup"

import PencilIcon from "@/components/icons/PencilIcon"
import LinkIcon from "@/components/icons/LinkIcon"
import ExportIcon from "@/components/icons/ExportIcon"
import TrashIcon from "@/components/icons/TrashIcon"

export type EditNameResult =
  | { ok: true }
  | { ok: false; reason: "duplicate"; message: string }
  | { ok: false; reason: "error"; message: string }

export type EditUrlResult =
  | { ok: true }
  | { ok: false; reason: "duplicate"; message: string }
  | { ok: false; reason: "error"; message: string }

type Props = {
  id: string

  portfolioName: string
  portfolioSlug: string
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

  onEditName?: (nextName: string) => Promise<EditNameResult> | EditNameResult
  onLinkAccessOnly?: () => void
  onDuplicate?: () => void
  onEditUrl?: (nextSlug: string) => Promise<EditUrlResult> | EditUrlResult
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

function normalizeSlugInput(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function getLockedUrlPrefix(publicUrl: string, portfolioSlug: string) {
  const normalizedUrl = normalizePublicUrl(publicUrl)
  const normalizedSlug = String(portfolioSlug ?? "").trim()

  if (!normalizedUrl) return ""
  if (!normalizedSlug) return normalizedUrl

  const suffix = `/${normalizedSlug}`
  if (normalizedUrl.endsWith(suffix)) {
    return normalizedUrl.slice(0, -normalizedSlug.length)
  }

  const lastSlash = normalizedUrl.lastIndexOf("/")
  if (lastSlash === -1) return ""
  return normalizedUrl.slice(0, lastSlash + 1)
}

export default function DashPortfolio({
  id,
  portfolioName,
  portfolioSlug,
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

  const [isEditingName, setIsEditingName] = React.useState(false)
  const [draftName, setDraftName] = React.useState(portfolioName)
  const [isSavingName, setIsSavingName] = React.useState(false)

  const [isEditingUrl, setIsEditingUrl] = React.useState(false)
  const [draftSlug, setDraftSlug] = React.useState(portfolioSlug)
  const [isSavingUrl, setIsSavingUrl] = React.useState(false)

  const [urlPopupOpen, setUrlPopupOpen] = React.useState(false)
  const [urlPopupTitle, setUrlPopupTitle] = React.useState("URL already in use")
  const [urlPopupMessage, setUrlPopupMessage] = React.useState(
    "This portfolio URL is already taken. Please choose a different URL."
  )
  const [attemptedSlug, setAttemptedSlug] = React.useState("")

  const [namePopupOpen, setNamePopupOpen] = React.useState(false)
  const [namePopupTitle, setNamePopupTitle] = React.useState(
    "Konfolio name already in use"
  )
  const [namePopupMessage, setNamePopupMessage] = React.useState(
    "You already have a Konfolio with this name. Please choose a different name."
  )
  const [attemptedName, setAttemptedName] = React.useState("")

  const copyTimeoutRef = React.useRef<number | null>(null)
  const nameInputRef = React.useRef<HTMLInputElement | null>(null)
  const slugInputRef = React.useRef<HTMLInputElement | null>(null)

  const closeDelete = React.useCallback(() => setDeleteOpen(false), [])
  const closeExport = React.useCallback(() => setExportOpen(false), [])

  React.useEffect(() => {
    setDraftName(portfolioName)
  }, [portfolioName])

  React.useEffect(() => {
    setDraftSlug(portfolioSlug)
  }, [portfolioSlug])

  React.useEffect(() => {
    if (!isEditingName) return
    const id = window.setTimeout(() => {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(id)
  }, [isEditingName])

  React.useEffect(() => {
    if (!isEditingUrl) return
    const id = window.setTimeout(() => {
      slugInputRef.current?.focus()
      slugInputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(id)
  }, [isEditingUrl])

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const resolvedPublicUrl = React.useMemo(() => normalizePublicUrl(publicUrl), [publicUrl])

  const lockedUrlPrefix = React.useMemo(
    () => getLockedUrlPrefix(resolvedPublicUrl, portfolioSlug),
    [resolvedPublicUrl, portfolioSlug]
  )

  const openUrlPopup = React.useCallback(
    (title: string, message: string, slug?: string) => {
      setUrlPopupTitle(title)
      setUrlPopupMessage(message)
      setAttemptedSlug(slug ?? "")
      setUrlPopupOpen(true)
    },
    []
  )

  const openNamePopup = React.useCallback(
    (title: string, message: string, name?: string) => {
      setNamePopupTitle(title)
      setNamePopupMessage(message)
      setAttemptedName(name ?? "")
      setNamePopupOpen(true)
    },
    []
  )

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

  const startEditingName = React.useCallback(() => {
    if (isSavingName || isSavingUrl) return
    setDraftName(portfolioName)
    setIsEditingUrl(false)
    setIsEditingName(true)
    setMenuOpen(false)
  }, [isSavingName, isSavingUrl, portfolioName])

  const cancelEditingName = React.useCallback(() => {
    setDraftName(portfolioName)
    setIsEditingName(false)
  }, [portfolioName])

  const saveName = React.useCallback(async () => {
    const trimmed = draftName.trim()

    if (!trimmed) {
      setDraftName(portfolioName)
      setIsEditingName(false)
      return
    }

    if (trimmed === portfolioName.trim()) {
      setIsEditingName(false)
      return
    }

    if (!onEditName) {
      setIsEditingName(false)
      return
    }

    try {
      setIsSavingName(true)

      const result = await onEditName(trimmed)

      if (!result.ok) {
        setDraftName(portfolioName)
        setIsEditingName(false)

        if (result.reason === "duplicate") {
          openNamePopup(
            "Konfolio name already in use",
            "You already have a Konfolio with this name. Please choose a different name.",
            trimmed
          )
          return
        }

        openNamePopup(
          "Unable to update name",
          result.message || "Something went wrong while updating the Konfolio name.",
          trimmed
        )
        return
      }

      setIsEditingName(false)
    } finally {
      setIsSavingName(false)
    }
  }, [draftName, onEditName, openNamePopup, portfolioName])

  const startEditingUrl = React.useCallback(() => {
    if (isSavingName || isSavingUrl) return
    setDraftSlug(portfolioSlug)
    setIsEditingName(false)
    setIsEditingUrl(true)
    setMenuOpen(false)
  }, [isSavingName, isSavingUrl, portfolioSlug])

  const cancelEditingUrl = React.useCallback(() => {
    setDraftSlug(portfolioSlug)
    setIsEditingUrl(false)
  }, [portfolioSlug])

  const saveUrl = React.useCallback(async () => {
    const normalized = normalizeSlugInput(draftSlug)

    if (!normalized) {
      setDraftSlug(portfolioSlug)
      setIsEditingUrl(false)
      return
    }

    if (normalized === portfolioSlug.trim()) {
      setIsEditingUrl(false)
      return
    }

    if (!onEditUrl) {
      setIsEditingUrl(false)
      return
    }

    try {
      setIsSavingUrl(true)

      const result = await onEditUrl(normalized)

      if (!result.ok) {
        setDraftSlug(portfolioSlug)
        setIsEditingUrl(false)

        if (result.reason === "duplicate") {
          openUrlPopup(
            "URL already in use",
            "This portfolio URL is already taken. Please choose a different URL.",
            normalized
          )
          return
        }

        openUrlPopup(
          "Unable to update URL",
          result.message || "Something went wrong while updating the portfolio URL.",
          normalized
        )
        return
      }

      setIsEditingUrl(false)
    } finally {
      setIsSavingUrl(false)
    }
  }, [draftSlug, onEditUrl, openUrlPopup, portfolioSlug])

  const handleMenuAction = React.useCallback(
    (action: PortfolioMoreAction) => {
      setMenuOpen(false)

      switch (action) {
        case "editName":
          startEditingName()
          return
        case "linkAccessOnly":
          onLinkAccessOnly?.()
          return
        case "duplicate":
          onDuplicate?.()
          return
        case "editUrl":
          startEditingUrl()
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
    [onDuplicate, onLinkAccessOnly, startEditingName, startEditingUrl]
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
          {isEditingName ? (
            <input
              ref={nameInputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={() => void saveName()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void saveName()
                }
                if (e.key === "Escape") {
                  e.preventDefault()
                  cancelEditingName()
                }
              }}
              disabled={isSavingName}
              className={[
                "flex-1 h-[18px] px-0 py-0",
                "bg-transparent border-0 rounded-none shadow-none",
                "text-[#262626] text-[17px] leading-[140%] font-normal",
                "outline-none ring-0 focus:outline-none focus:ring-0",
                "disabled:opacity-60",
              ].join(" ")}
              aria-label="Edit portfolio name"
            />
          ) : (
            <button
              type="button"
              onClick={startEditingName}
              className={[
                "flex-1 text-left truncate",
                "text-[#262626] text-[17px] leading-[140%] font-normal",
                "cursor-pointer hover:opacity-70 transition-opacity",
              ].join(" ")}
              title="Click to edit name"
              aria-label="Edit portfolio name"
            >
              {portfolioName}
            </button>
          )}
        </div>

        <div className="w-full min-h-[10px] relative">
          {isEditingUrl ? (
            <div className="w-full flex items-center gap-[5px]">
              <span className="min-w-0 truncate text-[#A5A5A5] text-[14px] leading-[130%] font-normal">
                {lockedUrlPrefix}
              </span>

              <input
                ref={slugInputRef}
                value={draftSlug}
                onChange={(e) => setDraftSlug(e.target.value)}
                onBlur={() => void saveUrl()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void saveUrl()
                  }
                  if (e.key === "Escape") {
                    e.preventDefault()
                    cancelEditingUrl()
                  }
                }}
                disabled={isSavingUrl}
                className={[
                  "min-w-0 flex-1 h-[18px] px-0 py-0",
                  "bg-transparent border-0 rounded-none shadow-none",
                  "text-[#A5A5A5] text-[14px] leading-[130%] font-normal",
                  "outline-none ring-0 focus:outline-none focus:ring-0",
                  "disabled:opacity-60",
                ].join(" ")}
                aria-label="Edit portfolio URL slug"
              />
            </div>
          ) : (
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
          )}
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

      <PortfolioSlugDuplicatePopup
        open={urlPopupOpen}
        onClose={() => setUrlPopupOpen(false)}
        title={urlPopupTitle}
        message={urlPopupMessage}
        attemptedSlug={attemptedSlug}
      />

      <PortfolioNameDuplicatePopup
        open={namePopupOpen}
        onClose={() => setNamePopupOpen(false)}
        title={namePopupTitle}
        message={namePopupMessage}
        attemptedName={attemptedName}
      />
    </div>
  )
}