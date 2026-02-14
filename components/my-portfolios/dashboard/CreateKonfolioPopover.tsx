"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import DeleteIcon from "@/components/icons/DeleteIcon"
import useClickOutside from "@/components/hooks/useClickOutside"

import CreateKonfolioCard from "@/components/my-portfolios/CreateKonfolioCard"

type TemplateType = "square" | "portrait"

type Props = {
  open: boolean
  onClose: () => void
  onPickTemplate: (t: TemplateType) => void

  disabled?: boolean
  primaryLoadingLabel?: string
  viewportPadding?: number
}

export default function CreateKonfolioPopover({
  open,
  onClose,
  onPickTemplate,
  disabled,
  primaryLoadingLabel,
  viewportPadding = 24,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  const BASE_W = 1254
  const BASE_H = 766

  // header h-[18px] + gap-[41px]
  const WHITE_CARD_TOP = 59

  useLayoutEffect(() => {
    if (!open) return

    const compute = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight

      const availW = Math.max(0, vw - viewportPadding * 2)
      const availH = Math.max(0, vh - viewportPadding * 2)

      const sW = availW / BASE_W
      const sH = availH / BASE_H
      const next = Math.min(1, sW, sH)

      setScale(Math.max(0.6, next))
    }

    compute()
    window.addEventListener("resize", compute)
    return () => window.removeEventListener("resize", compute)
  }, [open, viewportPadding])

  useClickOutside(panelRef, () => {
    if (open) onClose()
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/25" />

      <div
        ref={panelRef}
        className="relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute
            right-[18px]
            z-[210]
            flex items-center justify-center
            hover:opacity-70
            active:opacity-50
            transition-opacity
          "
          style={{
            top: WHITE_CARD_TOP + 18,
          }}
        >
          <DeleteIcon className="w-[20px] h-[20px]" />
        </button>

        <CreateKonfolioCard
          title="" 
          infoText="We work with templates to reduce variety and support our auto-fill system."
          disabled={disabled}
          primaryLoadingLabel={primaryLoadingLabel}
          onPickTemplate={(t) => onPickTemplate(t)}
        />
      </div>
    </div>
  )
}
