"use client"

import { useState } from "react"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import ArrowLeft from "@/components/icons/ArrowLeft"
import OnboardingField from "@/components/onboarding/OnboardingField"

type Props = {
  orgName: string
  backHref: string
  nextHref: string
}

export default function BusinessInfoHostCard({ orgName, backHref, nextHref }: Props) {
  const [website, setWebsite] = useState("")
  const [orgSize, setOrgSize] = useState("")
  const [attendees, setAttendees] = useState("")
  const [eventLocation, setEventLocation] = useState("")

  const canContinue =
    website.trim() !== "" &&
    orgSize.trim() !== "" &&
    attendees.trim() !== "" &&
    eventLocation.trim() !== ""

  return (
    <div
      className="
        relative
        w-[914px] h-[636px]
        flex flex-col justify-between items-center
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Header */}
      <div className="relative w-full flex items-center justify-center h-[30px]">
        <ArrowLeft href={backHref} className="absolute left-0" />

        <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-black text-center">
          Tell us more about {orgName}!
        </p>
      </div>

      {/* Form */}
      <div className="w-[426px] flex flex-col gap-[20px]">
        <OnboardingField
          label="Website"
          value={website}
          onChange={setWebsite}
        />

        <OnboardingField
          label="Organization Size"
          value={orgSize}
          onChange={setOrgSize}
        />

        <OnboardingField
          label="Event Attendees"
          value={attendees}
          onChange={setAttendees}
        />

        <OnboardingField
          label="Event Location"
          value={eventLocation}
          onChange={setEventLocation}
          placeholder="Placeholder Text"
        />
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
