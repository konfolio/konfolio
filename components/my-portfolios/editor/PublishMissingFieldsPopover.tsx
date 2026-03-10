// components/my-portfolios/editor/PublishMissingFieldsPopover.tsx
"use client"

import { useEffect, useMemo, useRef } from "react"

import useClickOutside from "@/components/hooks/useClickOutside"
import DeleteIcon from "@/components/icons/DeleteIcon"

import PrimaryButton from "@/components/buttons/PrimaryButton"
import SecondaryButton from "@/components/buttons/SecondaryButton"

type Props = {
  open: boolean
  requiredMissing: string[]
  optionalMissing: string[]
  onClose: () => void
  onKeepEditing: () => void
  onPublishAnyway?: () => void
}

export default function PublishMissingFieldsPopover({
  open,
  requiredMissing,
  optionalMissing,
  onClose,
  onKeepEditing,
  onPublishAnyway,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useClickOutside(ref, () => {
    if (!open) return
    onKeepEditing()
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onKeepEditing()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onKeepEditing])

  const allRequired = useMemo(
    () => requiredMissing.map((s) => String(s || "").trim()).filter(Boolean),
    [requiredMissing]
  )
  const allOptional = useMemo(
    () => optionalMissing.map((s) => String(s || "").trim()).filter(Boolean),
    [optionalMissing]
  )

  const hasRequired = allRequired.length > 0
  const hasOptional = allOptional.length > 0

  // If required exists: required-mode (no publish button)
  // If only optional exists: optional-mode (show publish + keep editing)
  const isOptionalOnlyMode = !hasRequired && hasOptional

  if (!open) return null

  // Match Figma sizes:
  // Optional Missing: 760x360
  // Required Missing: you previously used 425 height; keep that unless you have a specific Figma for required.
  const height = isOptionalOnlyMode ? 360 : 425

  const buttonsWidth = isOptionalOnlyMode ? 363 : 163
  const buttonsJustify = isOptionalOnlyMode ? "justify-between" : "justify-center"

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />

      <div
        ref={ref}
        className="relative flex flex-col items-center bg-white rounded-[15px] shadow-[5px_5px_25px_rgba(0,0,0,0.1)]"
        style={{ width: 760, height, padding: "50px 111px" }}
        role="dialog"
        aria-modal="true"
        aria-label="Missing fields"
      >
        {/* Close (2x) */}
        <button
          type="button"
          onClick={onKeepEditing}
          className="absolute right-5 top-5 w-[52px] h-[52px] flex items-center justify-center cursor-pointer"
          aria-label="Close"
        >
          <span className="scale-200">
            <DeleteIcon />
          </span>
        </button>

        {/* Header */}
        <div className="text-[22px] leading-[140%] font-normal text-[#262626] text-center">
          Something seems missing:
        </div>

        {/* Lists container */}
        <div className="mt-[50px] flex flex-col items-stretch gap-[10px]" style={{ width: 538 }}>
          {/* Required list (red) */}
          {hasRequired ? (
            <div className="flex flex-col gap-[10px]">
              {allRequired.map((item) => (
                <div key={`req-${item}`} className="text-[15px] leading-[150%] text-center text-[#FF4603]">
                  {item}
                </div>
              ))}
            </div>
          ) : null}

          {/* Optional list (red) */}
          {hasOptional ? (
            <div className="flex flex-col gap-[10px]">
              {allOptional.map((item) => (
                <div key={`opt-${item}`} className="text-[15px] leading-[150%] text-center text-[#FF4603]">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Optional confirmation line (Figma text, and only when optional-only mode) */}
        {isOptionalOnlyMode ? (
          <div className="mt-[50px] text-[15px] leading-[150%] text-center text-[#262626]" style={{ width: 538 }}>
            Are you sure to (publish/save) this version?
          </div>
        ) : null}

        {/* Buttons pinned bottom */}
        <div
          className={`mt-auto flex items-center gap-[50px] ${buttonsJustify}`}
          style={{ width: buttonsWidth }}
        >
          {isOptionalOnlyMode ? (
            <SecondaryButton onClick={() => onPublishAnyway?.()}>Publish</SecondaryButton>
          ) : null}

          {/* Keep editing centered + stays at bottom */}
          <div className="flex justify-center" style={{ width: isOptionalOnlyMode ? 150 : 163 }}>
            <PrimaryButton
              href="#"
              icon="none"
              onClick={(e) => {
                e.preventDefault()
                onKeepEditing()
              }}
            >
              Keep editing
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}