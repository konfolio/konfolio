"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useClickOutside from "@/components/hooks/useClickOutside"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import DeleteIcon from "@/components/icons/DeleteIcon"

function hasLetterOrNumber(s: string) {
  return /[a-z0-9]/i.test(s)
}

function slugifyForUrl(input: string) {
  const raw = input.trim().toLowerCase()

  const slug = raw
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)

  return slug
}

function normalizeName(input: string) {
  return input.trim().toLowerCase()
}

type Props = {
  isOpen: boolean
  businessSlug?: string
  existingNames?: string[]
  onClose: () => void
  onContinue: (portfolioName: string) => void
}

export default function PortfolioNameCard({
  isOpen,
  businessSlug = "businessname",
  existingNames = [],
  onClose,
  onContinue,
}: Props) {
  const [name, setName] = useState("")
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) setName("")
    if (!isOpen) setName("")
  }, [isOpen])

  useClickOutside(cardRef, () => {
    if (isOpen) onClose()
  })

  const typed = name.trim()
  const isNameValid = typed.length > 0 && hasLetterOrNumber(typed)

  const isDuplicateName = useMemo(() => {
    const normalizedTyped = normalizeName(typed)
    if (!normalizedTyped) return false

    return existingNames.some(
      (existingName) => normalizeName(existingName) === normalizedTyped
    )
  }, [existingNames, typed])

  const nameSlug = useMemo(() => {
    if (!isNameValid) return "portfolio-name"
    const s = slugifyForUrl(typed)
    return s.length ? s : "portfolio-name"
  }, [typed, isNameValid])

  const canContinue = isNameValid && !isDuplicateName

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/25" />

      <div
        ref={cardRef}
        className="relative z-[1] flex h-[450px] w-[756px] flex-col items-center justify-between rounded-[15px] bg-white p-[50px] shadow-[5px_5px_25px_rgba(0,0,0,0.1)]"
      >
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

        <div className="w-[656px] h-[15px] flex items-center justify-center">
          <h2 className="text-center text-[20px] leading-[140%] font-normal text-black">
            Portfolio Name
          </h2>
        </div>

        <div className="flex w-[380px] flex-col items-center gap-[15px]">
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

          <div className="w-full text-center text-[14px] leading-[130%] font-normal text-[#D3D3D3]">
            {`konfolio.com/${businessSlug}/${nameSlug}`}
          </div>

          {!isNameValid && typed.length > 0 ? (
            <div className="h-[10px] text-[14px] leading-[130%] font-normal text-[#FF4603]">
              Please include at least one letter or number.
            </div>
          ) : isDuplicateName ? (
            <div className="h-[10px] text-[14px] leading-[130%] font-normal text-[#FF4603]">
              Duplicate Name
            </div>
          ) : (
            <div className="h-[10px]" />
          )}
        </div>

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