// components/my-portfolios/dashboard/PortfolioDeleteConfirm.tsx
"use client"

import { useEffect, useRef, useState } from "react"

import useClickOutside from "@/components/hooks/useClickOutside"
import DeleteIcon from "@/components/icons/DeleteIcon"

type Props = {
  open: boolean

  onClose: () => void
  onCancel: () => void
  onConfirmDelete: () => void

  title?: string
  subtitle?: string

  confirmLabel?: string
  cancelLabel?: string

  isDeleting?: boolean
}

const ANIM_MS = 160

export default function PortfolioDeleteConfirm({
  open,
  onClose,
  onCancel,
  onConfirmDelete,
  title = "Are you sure to delete?",
  subtitle = "This portfolio cannot be recovered after deletion.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDeleting = false,
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null)

  // Keep rendering during exit animation even after `open` becomes false.
  const [mounted, setMounted] = useState<boolean>(open)
  const [visible, setVisible] = useState<boolean>(open)

  useClickOutside(cardRef, () => {
    if (!mounted) return
    onClose()
  })

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Next frame to ensure transitions apply.
      requestAnimationFrame(() => setVisible(true))
      return
    }

    // If parent closes, animate out then unmount.
    setVisible(false)
    const t = window.setTimeout(() => setMounted(false), ANIM_MS)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!mounted) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mounted, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop (dim overlay) */}
      <div
        className={[
          "absolute inset-0 bg-black/20 transition-opacity duration-[160ms]",
          visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        className={[
          "relative flex h-[310px] w-[calc(100%-32px)] max-w-[745px] flex-col items-center justify-center gap-[50px]",
          "rounded-[15px] bg-white px-[25px] py-[50px]",
          "shadow-[5px_5px_25px_rgba(0,0,0,0.1)]",
          "transition-[opacity,transform] duration-[160ms] ease-out",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]",
        ].join(" ")}
      >
        {/* Close (X) */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-[20px] top-[20px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DeleteIcon className="h-[26px] w-[26px] text-[#262626]" />
        </button>

        {/* Title + Subtitle */}
        <div className="flex w-[695px] flex-col items-center text-center">
          <div className="font-inter text-[22px] font-normal leading-[140%] text-[#262626]">
            {title}
          </div>

          <div className="mt-[50px] font-inter text-[15px] font-normal leading-[150%] text-[#A5A5A5]">
            {subtitle}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex h-[30px] w-[350px] gap-[50px]">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex h-[30px] min-w-[150px] cursor-pointer items-center justify-center rounded-full border border-[#262626] px-[40px] py-[10px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-inter text-[14px] font-normal leading-[130%] text-[#262626]">
              {cancelLabel}
            </span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="flex h-[30px] min-w-[150px] cursor-pointer items-center justify-center rounded-full bg-[#FF4603] px-[40px] py-[10px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-inter text-[14px] font-normal leading-[130%] text-white">
              {confirmLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}