"use client"

import { useState, useRef, useEffect } from "react"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import ArrowLeft from "@/components/icons/ArrowLeft"
import ArrowDown from "@/components/icons/ArrowDown"
import CheckIcon from "@/components/icons/CheckIcon"
import OnboardingField from "@/components/onboarding/OnboardingField"
import { useOnboardingDraft } from "@/stores/onboardingDraft"

type Props = {
  displayName: string
  backHref: string
  nextHref: string
}

export default function BusinessInfoArtistCard({
  displayName,
  backHref,
  nextHref,
}: Props) {
  // Zustand state
  const businessName = useOnboardingDraft((s) => s.businessName)
  const location = useOnboardingDraft((s) => s.location)
  const salesPermit = useOnboardingDraft((s) => s.salesPermit)
  const willApply = useOnboardingDraft((s) => s.willApply)

  // Zustand setters
  const setBusinessName = useOnboardingDraft((s) => s.setBusinessName)
  const setLocation = useOnboardingDraft((s) => s.setLocation)
  const setSalesPermit = useOnboardingDraft((s) => s.setSalesPermit)
  const setWillApply = useOnboardingDraft((s) => s.setWillApply)

  const canContinue =
    businessName.trim() !== "" &&
    location.trim() !== "" &&
    (salesPermit !== "" || willApply)

  // dropdown open state
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  // close on outside click / esc
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onDocDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  return (
    <div
      className="
        relative
        w-[914px] h-[630px]
        flex flex-col justify-between items-center
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Header Row */}
      <div className="relative w-full flex items-center justify-center h-[30px]">
        <ArrowLeft href={backHref} className="absolute left-0" />

        <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-black text-center">
          Hello, {displayName}!
        </p>
      </div>

      {/* Form */}
      <div className="w-[426px] flex flex-col gap-[30px]">
        <OnboardingField
          label="Business Name"
          value={businessName}
          onChange={setBusinessName}
        />

        <OnboardingField
          label="Your Location"
          value={location}
          onChange={setLocation}
          placeholder="City, State"
        />

        {/* Sales Permit Dropdown */}
        <div
          className="w-[426px] flex flex-col items-start gap-[10px] relative"
          ref={wrapRef}
        >
          <div className="w-full flex flex-col items-start gap-[10px] py-[5px]">
            <span className="font-inter text-[17px] leading-[140%] text-[#262626]">
              Valid Sales Permit
            </span>
          </div>

          {/* Trigger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="
              w-[426px] h-[40px]
              rounded-[8px]
              border border-[#A5A5A5]/50
              bg-white
              px-[16px]
              flex items-center justify-between
              text-left
            "
          >
            <span
              className={`font-inter text-[15px] leading-[21px] ${
                salesPermit ? "text-[#262626]" : "text-[#A5A5A5]"
              }`}
            >
              {salesPermit === ""
                ? "Select"
                : salesPermit === "yes"
                ? "Yes"
                : "No"}
            </span>
            <ArrowDown />
          </button>

          {/* Menu */}
          {open && (
            <div
              className="
                absolute top-[72px]
                left-0
                w-[426px]
                bg-white
                border border-[#A5A5A5]/50
                rounded-[8px]
                shadow-[0_8px_20px_rgba(0,0,0,0.08)]
                z-50
              "
            >
              {["yes", "no"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSalesPermit(opt as "yes" | "no")
                    setOpen(false)
                  }}
                  className="
                    w-full
                    px-[16px]
                    py-[10px]
                    text-left
                    hover:bg-[#F7F7F7]
                    font-inter text-[14px]
                  "
                >
                  {opt === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Checkbox row */}
        <label className="w-[426px] h-[23px] flex items-center gap-[7px] py-[5px] cursor-pointer select-none">
          <span
            className={[
              "relative w-[13px] h-[13px] rounded-[3.25px] flex-shrink-0",
              willApply ? "bg-[#262626]" : "bg-white border border-[#262626]",
            ].join(" ")}
            aria-hidden="true"
          >
            {willApply && (
              <span
                className="absolute"
                style={{
                  left: "2.17px",
                  top: "3.6px",
                  transform: "scale(0.78)",
                  transformOrigin: "top left",
                }}
              >
                <CheckIcon className="[&_path]:stroke-white" />
              </span>
            )}
          </span>

          <input
            type="checkbox"
            className="sr-only"
            checked={willApply}
            onChange={(e) => setWillApply(e.target.checked)}
          />

          <span className="font-inter text-[14px] leading-[140%] text-[#A5A5A5] whitespace-nowrap">
            I will apply for a sales permit.
          </span>
        </label>
      </div>

      {/* Next Button */}
      <PrimaryButton
        href={canContinue ? nextHref : "#"}
        className={!canContinue ? "pointer-events-none opacity-40" : ""}
      >
        Next
      </PrimaryButton>
    </div>
  )
}
