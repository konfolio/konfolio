"use client"

import { useState } from "react"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import ArrowLeft from "@/components/icons/ArrowLeft"
import ArrowDown from "@/components/icons/ArrowDown"
import CheckIcon from "@/components/icons/CheckIcon"
import OnboardingField from "@/components/onboarding/OnboardingField"

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
  const [businessName, setBusinessName] = useState("")
  const [location, setLocation] = useState("")
  const [salesPermit, setSalesPermit] = useState<"" | "yes" | "no">("")
  const [willApply, setWillApply] = useState(false)

  const canContinue =
    businessName.trim() !== "" &&
    location.trim() !== "" &&
    (salesPermit !== "" || willApply)

  return (
    <div
      className="
        relative
        w-[914px] h-[630px]
        flex flex-col items-center justify-between
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
        {/* Header */}
        <div className="relative w-full flex items-center justify-center h-[30px]">
        <ArrowLeft
            href="/onboarding/name/artist"
            className="absolute left-0"
        />

        <p className="font-inter text-[25px] leading-[30px] text-black">
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

        {/* Sales Permit */}
        <div className="w-[426px] flex flex-col gap-[10px]">
          <span className="font-inter text-[14px] text-[#262626]">
            Valid Sales Permit
          </span>

          <button
            type="button"
            className="
              w-full h-[40px]
              flex items-center justify-between
              px-[16px]
              rounded-[8px]
              border border-[#A5A5A5]/50
              bg-white
              font-inter text-[15px] leading-[21px]
            "
            onClick={() =>
              setSalesPermit((p) => (p === "" ? "yes" : p === "yes" ? "no" : ""))
            }
          >
            <span className={salesPermit === "" ? "text-[#A5A5A5]" : "text-[#262626]"}>
              {salesPermit === "" ? "Select" : salesPermit === "yes" ? "Yes" : "No"}
            </span>
            <ArrowDown />
          </button>
        </div>

        {/* Checkbox */}
        <label className="w-full h-[23px] flex items-center gap-[7px] cursor-pointer">
          <span
            className={[
              "relative w-[13px] h-[13px] rounded-[3.25px] flex-shrink-0",
              willApply ? "bg-[#262626]" : "bg-white border border-[#262626]",
            ].join(" ")}
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

      {/* Next */}
      <PrimaryButton
        href={canContinue ? nextHref : "#"}
        className={!canContinue ? "pointer-events-none opacity-40" : ""}
      >
        Next
      </PrimaryButton>
    </div>
  )
}
