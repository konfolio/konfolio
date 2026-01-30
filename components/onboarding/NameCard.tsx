"use client"

import { useMemo, useState } from "react"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import CheckIcon from "@/components/icons/CheckIcon"
import ArrowLeft from "@/components/icons/ArrowLeft"
import OnboardingField from "@/components/onboarding/OnboardingField"
import { inknut } from "@/app/fonts"

type Mode = "artist" | "host"

type Props = {
  mode: Mode
  backHref: string
  onNextHref: string
}

function TermsRow({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <label className="w-[426px] h-[23px] flex items-center gap-[7px] py-[5px] cursor-pointer select-none">
      {/* Visual checkbox */}
      <span
        className={[
          "relative w-[13px] h-[13px] rounded-[3.25px] flex-shrink-0",
          checked ? "bg-[#262626]" : "bg-white border border-[#262626]",
        ].join(" ")}
        aria-hidden="true"
      >
        {/* Check */}
        {checked && (
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

      {/* Real checkbox (accessible) */}
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />

      {/* Only "Terms of Service" should be black + italic + underline */}
      <span className="flex-1 font-inter text-[12px] leading-[140%] text-[#A5A5A5]">
        I accept and agree to the{" "}
        <span className="text-black italic underline">Terms of Service</span> of Konfolio.
      </span>
    </label>
  )
}

export default function NameCard({ mode, backHref, onNextHref }: Props) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [preferredName, setPreferredName] = useState("")
  const [organization, setOrganization] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const thirdField = useMemo(() => {
    if (mode === "artist") {
      return (
        <OnboardingField
          label="Preferred Name"
          optional
          value={preferredName}
          onChange={setPreferredName}
        />
      )
    }

    return (
      <OnboardingField
        label="Organization"
        value={organization}
        onChange={setOrganization}
      />
    )
  }, [mode, organization, preferredName])

  const canContinue =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    (mode === "artist" ? true : organization.trim() !== "") &&
    acceptedTerms

  return (
    <div
      className="
        relative
        w-[914px]
        min-h-[630px]
        flex flex-col
        items-center
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Arrow pinned to the card corner (inside padding) */}
      <ArrowLeft
        href={backHref}
        className="absolute left-[45px] top-[50px]"
      />

      {/* Header content (824 wide, centered) */}
      <div className="w-full flex justify-center">
        <div className="w-[824px] flex flex-col items-center gap-[15px]">
          <p className="m-0 text-center font-inter text-[15px] leading-[18px] text-black whitespace-nowrap">
            Hello! Welcome to
          </p>

          <div className="relative w-[124px] h-[27.56px]">
            <span
              className={`absolute left-[1.97px] top-[4.92px] ${inknut.className} font-semibold text-[#262626] text-[26.7475px] tracking-[-0.02em]`}
              style={{ WebkitTextStroke: "1.05132px #262626" }}
            >
              konfolio
            </span>
          </div>
        </div>
      </div>

      {/* Middle block (shifted up) */}
      <div className="w-[426px] flex flex-col items-center gap-[22px] mt-[50px]">
        <OnboardingField label="First Name" value={firstName} onChange={setFirstName} />
        <OnboardingField label="Last Name" value={lastName} onChange={setLastName} />
        {thirdField}
        <TermsRow checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
      </div>

      {/* Bottom button */}
      <div className="mt-auto">
        <PrimaryButton
          href={canContinue ? onNextHref : "#"}
          className={!canContinue ? "pointer-events-none opacity-40" : ""}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
