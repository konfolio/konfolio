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

export default function BusinessInfoArtistCard({ displayName, backHref, nextHref }: Props) {
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
          placeholder=""
        />

        <OnboardingField
          label="Your Location"
          value={location}
          onChange={setLocation}
          placeholder="City, State"
        />

        {/* Dropdown */}
        <div className="w-[426px] flex flex-col items-start gap-[10px]">
          <div className="w-full flex flex-col items-start gap-[10px] py-[5px]">
            <span className="font-inter text-[17px] leading-[140%] text-[#262626]">
              Valid Sales Permit
            </span>
          </div>

          <button
            type="button"
            className="
              w-[426px] h-[40px]
              rounded-[8px]
              border border-[#A5A5A5]/50
              bg-white
              px-[16px]
              flex items-center justify-between
              text-left
            "
            onClick={() => {
              setSalesPermit((prev) => (prev === "" ? "yes" : prev === "yes" ? "no" : ""))
            }}
          >
            {/* Use flex + items-center so text doesn't look cut off */}
            <span className="font-inter text-[15px] leading-[21px] text-[#A5A5A5] flex items-center">
              {salesPermit === "" ? "Select" : salesPermit === "yes" ? "Yes" : "No"}
            </span>
            <ArrowDown />
          </button>
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
