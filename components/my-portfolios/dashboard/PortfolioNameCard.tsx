"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useClickOutside from "@/components/hooks/useClickOutside"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import DeleteIcon from "@/components/icons/DeleteIcon"

function hasLetterOrNumber(s: string) {
  return /[a-z0-9]/i.test(s)
}

function slugifyForUrl(input: string) {
  // Make a URL-friendly slug (kebab-case).
  // Example: "Cute & Cozy Prints ✨" -> "cute-cozy-prints"
  const raw = input.trim().toLowerCase()

  // Remove quotes, then convert any run of non-alphanumerics into "-"
  const slug = raw
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)

  return slug
}

type Props = {
  isOpen: boolean
  businessSlug?: string
  onClose: () => void
  onContinue: (portfolioName: string) => void
}

export default function PortfolioNameCard({
  isOpen,
  businessSlug = "businessname",
  onClose,
  onContinue,
}: Props) {
  const [name, setName] = useState("")
  const cardRef = useRef<HTMLDivElement | null>(null)

  // Start empty every time it opens/closes (dismiss = reset)
  useEffect(() => {
    if (isOpen) setName("")
    if (!isOpen) setName("")
  }, [isOpen])

  useClickOutside(cardRef, () => {
    if (isOpen) onClose()
  })

  const typed = name.trim()
  const isNameValid = typed.length > 0 && hasLetterOrNumber(typed)

  const nameSlug = useMemo(() => {
    // If invalid/empty, keep placeholder slug in preview
    if (!isNameValid) return "portfolio-name"
    const s = slugifyForUrl(typed)
    return s.length ? s : "portfolio-name"
  }, [typed, isNameValid])

  const canContinue = isNameValid

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/25" />

      <div
        ref={cardRef}
        className="relative z-[1] flex h-[450px] w-[756px] flex-col items-center justify-between rounded-[15px] bg-white p-[50px] shadow-[5px_5px_25px_rgba(0,0,0,0.1)]"
      >
        {/* X (match CreateKonfolioPopover sizing) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute
            right-[18px]
            top-[18px]
            flex items-center justify-center
            hover:opacity-70
            active:opacity-50
            transition-opacity
          "
        >
          <DeleteIcon className="w-[20px] h-[20px]" />
        </button>

        {/* Header */}
        <div className="w-[656px] h-[15px] flex items-center justify-center">
          <h2 className="text-center text-[20px] leading-[140%] font-normal text-black">
            Portfolio Name
          </h2>
        </div>

        {/* Middle content */}
        <div className="flex w-[380px] flex-col items-center gap-[15px]">
          {/* Input */}
          <div className="flex w-[380px] flex-col items-center gap-[10px] pt-[10px]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Portfolio Name"
              className="w-[380px] text-center text-[17px] leading-[140%] font-normal text-black placeholder:text-[#D3D3D3] outline-none"
              autoFocus
            />
            <div className="w-[380px] border-t border-[#A5A5A5]" />
          </div>

          {/* URL preview (single centered string, no extra spacing) */}
          <div className="w-full text-center text-[14px] leading-[130%] font-normal text-[#D3D3D3]">
            {`konfolio.com/${businessSlug}/${nameSlug}`}
          </div>

          {/* Friendly validation message (no duplicate-name logic) */}
          {!isNameValid && typed.length > 0 ? (
            <div className="h-[10px] text-[14px] leading-[130%] font-normal text-[#FF4603]">
              Please include at least one letter or number.
            </div>
          ) : (
            <div className="h-[10px]" />
          )}
        </div>

        {/* Next */}
        <PrimaryButton
          href="#"
          icon="arrow"
          className={`h-[33px] min-w-[150px] px-[40px] py-[10px] ${
            canContinue ? "" : "pointer-events-none opacity-50"
          }`}
          onClick={(e) => {
            e.preventDefault()
            if (!canContinue) return
            onContinue(typed)
          }}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}