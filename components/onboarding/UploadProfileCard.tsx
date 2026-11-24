"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import ArrowLeft from "@/components/icons/ArrowLeft"
import ArrowRight from "@/components/icons/ArrowRight"
import OpenTabIcon from "@/components/icons/OpenTabIcon"
import ImageIcon from "@/components/icons/ImageIcon"
import { useOnboardingDraft } from "@/stores/onboardingDraft"
import { supabase } from "@/lib/supabase/browser"

import type { MediaKey } from "@/stores/onboardingDraft"

type Props = {
  backHref: string

  /**
   * Optional override.
   * Recommended default: "/my-portfolios/new"
   */
  nextHref?: string

  title?: string
  displayName?: string
  locationText?: string
}

type OnboardingPayload = {
  mode: "artist" | "host"
  firstName: string
  lastName: string
  acceptedTerms: boolean

  preferredName?: string
  businessName?: string
  location?: string
  salesPermit?: "" | "yes" | "no"
  willApply?: boolean
  collabs?: string[]
  merchTags?: string[]
  firstVend?: boolean
  prevVends?: string[]

  organization?: string
  hostWebsite?: string
  orgSize?: string
  attendees?: string
  eventLocation?: string

  links?: Partial<Record<MediaKey, string>>
  profileImageUrl?: string | null
}

const MAX_PROFILE_IMAGE_DIMENSION = 1200
const PROFILE_IMAGE_QUALITY = 0.82

function nonEmptyTrimmed(s: string) {
  const t = (s ?? "").trim()
  return t.length ? t : ""
}

function pickActiveLinks(
  activeKeys: MediaKey[],
  links: Record<MediaKey, string>
): Partial<Record<MediaKey, string>> | undefined {
  const out: Partial<Record<MediaKey, string>> = {}

  for (const k of activeKeys) {
    const v = nonEmptyTrimmed(links[k] ?? "")
    if (v) out[k] = v
  }

  return Object.keys(out).length ? out : undefined
}

async function getAccessTokenOrThrow() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error("Auth error: " + error.message)
  }

  const token = data.session?.access_token

  if (!token) {
    throw new Error("Missing session. Please sign in again.")
  }

  return token
}

/**
 * Resize + compress the profile image in the browser BEFORE
 * sending it through our API route.
 *
 * This prevents large phone/camera images from creating
 * oversized requests.
 */
async function optimizeProfileImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a valid image file.")
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image()

      img.onload = () => resolve(img)

      img.onerror = () => {
        reject(
          new Error(
            "We couldn't read that image. Please try a JPG, PNG, or WebP image."
          )
        )
      }

      img.src = objectUrl
    })

    const originalWidth = image.naturalWidth
    const originalHeight = image.naturalHeight

    if (!originalWidth || !originalHeight) {
      throw new Error("Could not determine the image dimensions.")
    }

    let width = originalWidth
    let height = originalHeight

    if (
      width > MAX_PROFILE_IMAGE_DIMENSION ||
      height > MAX_PROFILE_IMAGE_DIMENSION
    ) {
      const scale = Math.min(
        MAX_PROFILE_IMAGE_DIMENSION / width,
        MAX_PROFILE_IMAGE_DIMENSION / height
      )

      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not process the profile image.")
    }

    ctx.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Could not compress the profile image."))
            return
          }

          resolve(result)
        },
        "image/webp",
        PROFILE_IMAGE_QUALITY
      )
    })

    return new File(
      [blob],
      `profile-${Date.now()}.webp`,
      {
        type: "image/webp",
        lastModified: Date.now(),
      }
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function uploadProfileImage(
  file: File,
  token: string
): Promise<string> {
  // Compress/resize BEFORE sending the request.
  const optimizedFile = await optimizeProfileImage(file)

  const form = new FormData()
  form.append("file", optimizedFile)

  const res = await fetch("/api/profile-image/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  if (!res.ok) {
    let detail = ""

    try {
      const json = (await res.json()) as {
        error?: string
      }

      detail = json.error || ""
    } catch {
      try {
        detail = await res.text()
      } catch {}
    }

    if (res.status === 401) {
      throw new Error("You’re signed out. Please log in again.")
    }

    if (res.status === 400) {
      throw new Error(detail || "Profile image missing or invalid.")
    }

    if (res.status === 413) {
      throw new Error(
        "That profile image is still too large. Please try another image."
      )
    }

    throw new Error(
      detail || "Could not upload profile image. Please try again."
    )
  }

  const json = (await res.json()) as {
    profileImageUrl?: string
  }

  if (!json.profileImageUrl) {
    throw new Error(
      "Upload succeeded but no profileImageUrl returned."
    )
  }

  return json.profileImageUrl
}

async function submitOnboarding(
  payload: OnboardingPayload,
  token: string
) {
  const res = await fetch("/api/onboarding/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let detail = ""

    try {
      detail = await res.text()
    } catch {}

    if (res.status === 401) {
      throw new Error("You’re signed out. Please log in again.")
    }

    if (res.status === 400) {
      throw new Error(
        detail || "Please check your info and try again."
      )
    }

    throw new Error(detail || "Server error. Please try again.")
  }
}

/**
 * Local button that matches PrimaryButton styling,
 * without changing PrimaryButton itself.
 */
function PrimaryButtonLike({
  children,
  className = "",
  icon = "arrow",
  disabled = false,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  icon?: "arrow" | "open" | "none"
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        group
        flex items-center justify-center
        gap-[7px]
        h-[39px] min-w-[150px]
        px-[40px] py-[13px]
        rounded-[100px]
        bg-[#262626]
        text-white
        text-[14px] leading-[140%]
        font-normal
        transition-all duration-100 ease-out
        hover:bg-[#262626CC]
        active:bg-[#262626B2]
        whitespace-nowrap
        disabled:pointer-events-none disabled:opacity-40
        ${className}
      `}
    >
      <span>{children}</span>

      {icon !== "none" && (
        <span className="flex items-center justify-center">
          {icon === "open" ? <OpenTabIcon /> : <ArrowRight />}
        </span>
      )}
    </button>
  )
}

export default function UploadProfileCard({
  backHref,
  nextHref = "/my-portfolios/new",
  title = "Last step!",
}: Props) {
  const router = useRouter()

  const inputRef = useRef<HTMLInputElement | null>(null)

  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")

  const mode = useOnboardingDraft((s) => s.mode)

  const firstName = useOnboardingDraft((s) => s.firstName)
  const lastName = useOnboardingDraft((s) => s.lastName)
  const acceptedTerms = useOnboardingDraft(
    (s) => s.acceptedTerms
  )

  // artist
  const preferredName = useOnboardingDraft(
    (s) => s.preferredName
  )
  const businessName = useOnboardingDraft(
    (s) => s.businessName
  )
  const location = useOnboardingDraft((s) => s.location)
  const salesPermit = useOnboardingDraft(
    (s) => s.salesPermit
  )
  const willApply = useOnboardingDraft((s) => s.willApply)
  const collabs = useOnboardingDraft((s) => s.collabs)
  const merchTags = useOnboardingDraft((s) => s.merchTags)
  const firstVend = useOnboardingDraft((s) => s.firstVend)
  const prevVends = useOnboardingDraft((s) => s.prevVends)

  // host
  const organization = useOnboardingDraft(
    (s) => s.organization
  )
  const hostWebsite = useOnboardingDraft(
    (s) => s.hostWebsite
  )
  const orgSize = useOnboardingDraft((s) => s.orgSize)
  const attendees = useOnboardingDraft((s) => s.attendees)
  const eventLocation = useOnboardingDraft(
    (s) => s.eventLocation
  )

  // links
  const activeLinkKeys = useOnboardingDraft(
    (s) => s.activeLinkKeys
  )
  const links = useOnboardingDraft((s) => s.links)

  // profile
  const file = useOnboardingDraft((s) => s.profileFile)
  const previewUrl = useOnboardingDraft(
    (s) => s.profilePreviewUrl
  )
  const setProfileFile = useOnboardingDraft(
    (s) => s.setProfileFile
  )

  const resetDraft = useOnboardingDraft((s) => s.resetDraft)

  const artistNameLine = useMemo(() => {
    const full = `${firstName} ${lastName}`.trim()

    return (preferredName || full || "").trim()
  }, [preferredName, firstName, lastName])

  const topLine = useMemo(() => {
    if (mode === "host") {
      return (organization || "").trim()
    }

    return (businessName || "").trim()
  }, [mode, organization, businessName])

  const bottomLine = useMemo(() => {
    if (mode === "host") {
      return (eventLocation || "").trim()
    }

    return artistNameLine
  }, [mode, eventLocation, artistNameLine])

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleFile(nextFile: File | null) {
    if (!nextFile) return

    if (!nextFile.type.startsWith("image/")) {
      setSubmitError("Please choose a valid image file.")
      return
    }

    setSubmitError("")

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const nextUrl = URL.createObjectURL(nextFile)

    setProfileFile(nextFile, nextUrl)
  }

  function onInputChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const f = e.target.files?.[0] ?? null

    handleFile(f)

    e.target.value = ""
  }

  function onDrop(
    e: React.DragEvent<HTMLButtonElement>
  ) {
    e.preventDefault()

    setDragOver(false)

    const f = e.dataTransfer.files?.[0] ?? null

    handleFile(f)
  }

  const canSubmit =
    Boolean(file) &&
    Boolean(mode) &&
    acceptedTerms &&
    !submitting

  function buildPayload(
    profileImageUrl: string | null
  ): OnboardingPayload {
    if (!mode) {
      throw new Error("Missing mode.")
    }

    const base: OnboardingPayload = {
      mode,
      firstName: nonEmptyTrimmed(firstName),
      lastName: nonEmptyTrimmed(lastName),
      acceptedTerms: Boolean(acceptedTerms),
      profileImageUrl,
    }

    const pickedLinks = pickActiveLinks(
      activeLinkKeys,
      links
    )

    if (pickedLinks) {
      base.links = pickedLinks
    }

    if (mode === "artist") {
      return {
        ...base,
        preferredName:
          nonEmptyTrimmed(preferredName) || undefined,
        businessName:
          nonEmptyTrimmed(businessName) || undefined,
        location:
          nonEmptyTrimmed(location) || undefined,
        salesPermit: salesPermit || undefined,
        willApply: Boolean(willApply),
        collabs: collabs.length ? collabs : undefined,
        merchTags: merchTags.length
          ? merchTags
          : undefined,
        firstVend: Boolean(firstVend),
        prevVends: prevVends.length
          ? prevVends
          : undefined,
      }
    }

    return {
      ...base,
      organization:
        nonEmptyTrimmed(organization) || undefined,
      hostWebsite:
        nonEmptyTrimmed(hostWebsite) || undefined,
      orgSize:
        nonEmptyTrimmed(orgSize) || undefined,
      attendees:
        nonEmptyTrimmed(attendees) || undefined,
      eventLocation:
        nonEmptyTrimmed(eventLocation) || undefined,
    }
  }

  async function handleFinalSubmit() {
    if (!mode) {
      setSubmitError(
        "Please select artist or host before submitting."
      )
      return
    }

    if (!file) {
      setSubmitError("Please upload a profile image.")
      return
    }

    if (!acceptedTerms) {
      setSubmitError(
        "Please accept the terms to continue."
      )
      return
    }

    setSubmitting(true)
    setSubmitError("")

    try {
      const token = await getAccessTokenOrThrow()

      /*
       * uploadProfileImage now automatically compresses
       * the image before sending it to the backend.
       */
      const profileImageUrl = await uploadProfileImage(
        file,
        token
      )

      const payload = buildPayload(profileImageUrl)

      if (!payload.firstName || !payload.lastName) {
        throw new Error(
          "Please enter your first and last name."
        )
      }

      await submitOnboarding(payload, token)

      // Clear local onboarding state
      resetDraft()

      // Use replace so back button doesn't re-submit onboarding
      router.replace(nextHref)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."

      setSubmitError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div
      className="
        relative
        w-[914px] h-[619px]
        flex flex-col justify-between items-center
        px-[45px] py-[50px]
        bg-white rounded-[15px]
        shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
        max-w-[calc(100vw-40px)]
      "
    >
      <ArrowLeft
        href={backHref}
        className="absolute left-[45px] top-[50px] w-[40px] h-[40px] flex items-center justify-center"
      />

      <div className="w-full flex justify-center">
        <div className="relative w-[824px] h-[18px] flex items-start justify-center">
          <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-black text-center">
            {title}
          </p>
        </div>
      </div>

      <div className="w-[480px] h-[268px] flex flex-col items-center gap-[30px]">
        <button
          type="button"
          onClick={openFilePicker}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => {
            setDragOver(false)
          }}
          onDrop={onDrop}
          className={`
            relative
            block
            w-[193px] h-[193px]
            min-w-[193px] min-h-[193px]
            max-w-[193px] max-h-[193px]
            shrink-0
            overflow-hidden
            rounded-full
            bg-white
            border border-[#A5A5A5]/50
            shadow-[4px_4px_15px_rgba(0,0,0,0.1)]
            ${dragOver ? "ring-2 ring-[#A5A5A5]/50" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onInputChange}
          />

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Profile preview"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[10px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center">
                <ImageIcon className="w-[39px] h-[39px] text-[#A5A5A5]" />
              </div>

              <p className="m-0 w-[110px] text-center font-inter font-normal text-[11px] leading-[13px] text-[#A5A5A5]">
                Drop image here or click to open files
              </p>
            </div>
          )}
        </button>

        <div className="w-[480px] flex flex-col items-center gap-[15px]">
          <p className="m-0 w-full text-center font-inter font-normal text-[25px] leading-[30px] text-black">
            {topLine}
          </p>

          <p className="m-0 w-full text-center font-inter font-normal text-[16px] leading-[19px] text-[#A5A5A5]">
            {bottomLine}
          </p>
        </div>

        {submitError ? (
          <p className="m-0 w-full text-center font-inter text-[13px] leading-[16px] text-red-500">
            {submitError}
          </p>
        ) : null}
      </div>

      <PrimaryButtonLike
        disabled={!canSubmit}
        icon="none"
        onClick={handleFinalSubmit}
      >
        {submitting ? "Finishing..." : "Finish"}
      </PrimaryButtonLike>
    </div>
  )
}