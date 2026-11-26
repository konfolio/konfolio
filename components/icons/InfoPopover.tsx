"use client"

import { useEffect, useRef } from "react"
import PopoverArrow from "@/components/icons/PopoverArrow"

type Props = {
  open: boolean
  onClose: () => void
  text?: string
  children?: React.ReactNode
  className?: string
  width?: number
}

export default function InfoPopover({ open, onClose, text, children, className = "" }: Props) {
  const popoverRef = useRef<HTMLDivElement | null>(null)

  // close on escape
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
    <div
      ref={popoverRef}
      className={`
        relative
        w-full h-full
        bg-white
        rounded-[10px]
        shadow-[2px_2px_15px_rgba(0,0,0,0.1)]
        px-[15px] py-[15px]
        flex items-center
        ${className}
        style={{ width: width ?? undefined
      `}
      role="dialog"
      aria-label="Info"
    >
      {/* Arrow stays centered like before */}
      <PopoverArrow className="absolute top-[-8px] left-1/2 -translate-x-1/2" />

      {children ? (
        <div className="w-full h-full">{children}</div>
      ) : (
        <p className="m-0 w-full h-full font-inter font-normal text-[12px] leading-[130%] text-black">
          {text ?? ""}
        </p>
      )}
    </div>
  )
}

