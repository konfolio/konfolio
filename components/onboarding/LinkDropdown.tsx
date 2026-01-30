"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ArrowDown from "@/components/icons/ArrowDown"
import LinkIcon from "@/components/icons/LinkIcon"

import HomeIcon from "@/components/icons/HomeIcon"
import ShopIcon from "@/components/icons/ShopIcon"
import InstagramIcon from "@/components/icons/InstagramIcon"
import XIcon from "@/components/icons/XIcon"
import FacebookIcon from "@/components/icons/FacebookIcon"
import TumblrIcon from "@/components/icons/TumblrIcon"
import PixivIcon from "@/components/icons/PixivIcon"
import BlueskyIcon from "@/components/icons/BlueskyIcon"

import RemovableLinkInput from "@/components/onboarding/RemovableLinkInput"

type MediaKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

type LinkRow = {
  key: MediaKey
  label: string
  recommended?: boolean
  icon: React.ReactNode
  placeholder: string
}

type Props = {
  noteText?: string
  maxLinks?: number
  onHasAnyValidLinkChange?: (hasAnyValid: boolean) => void
}

function normalizeUrlInput(raw: string) {
  const v = raw.trim()
  if (!v) return ""

  // If it already starts with a scheme, keep it
  if (/^https?:\/\//i.test(v)) return v

  // Otherwise assume https
  return `https://${v}`
}

function safeParseUrl(raw: string) {
  try {
    const normalized = normalizeUrlInput(raw)
    if (!normalized) return null
    return new URL(normalized)
  } catch {
    return null
  }
}

function hostnameMatches(hostname: string, allowed: string[]) {
  const h = hostname.toLowerCase()

  return allowed.some((domain) => {
    const d = domain.toLowerCase()
    return h === d || h.endsWith(`.${d}`)
  })
}

function isValidLinkForKey(key: MediaKey, raw: string) {
  const url = safeParseUrl(raw)
  if (!url) return false

  // Must be http/https
  if (url.protocol !== "http:" && url.protocol !== "https:") return false

  // Must have a real-ish host (dot helps avoid "https://localhost" etc.)
  const host = url.hostname
  if (!host || !host.includes(".")) return false

  // No spaces anywhere
  if (/\s/.test(raw)) return false

  // Platform/domain rules
  switch (key) {
    case "website":
    case "shop":
      // Any valid domain is fine
      return true

    case "instagram":
      return hostnameMatches(host, ["instagram.com"])

    case "x":
      return hostnameMatches(host, ["x.com", "twitter.com"])

    case "facebook":
      return hostnameMatches(host, ["facebook.com"])

    case "tumblr":
      return hostnameMatches(host, ["tumblr.com"])

    case "pixiv":
      return hostnameMatches(host, ["pixiv.net"])

    case "bluesky":
      // bluesky commonly uses bsky.app / bsky.social domains
      return hostnameMatches(host, ["bsky.app", "bsky.social"])

    default:
      return false
  }
}

export default function LinkDropdown({
  noteText = "Recommended: 1 website, 2 social media, and 1 shop",
  maxLinks = 8,
  onHasAnyValidLinkChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<Record<MediaKey, string>>({
    website: "",
    shop: "",
    instagram: "",
    x: "",
    facebook: "",
    tumblr: "",
    pixiv: "",
    bluesky: "",
  })
  const [activeKeys, setActiveKeys] = useState<MediaKey[]>([])

  const wrapRef = useRef<HTMLDivElement | null>(null)

  const options: LinkRow[] = useMemo(
    () => [
      {
        key: "website",
        label: "Main Website",
        recommended: true,
        icon: <HomeIcon className="text-[#262626]" />,
        placeholder: "https://yourwebsite.com",
      },
      {
        key: "shop",
        label: "Main Shop",
        recommended: true,
        icon: <ShopIcon className="text-[#262626]" />,
        placeholder: "https://yourshop.com",
      },
      {
        key: "instagram",
        label: "Instagram",
        recommended: true,
        icon: <InstagramIcon className="text-[#262626]" />,
        placeholder: "https://instagram.com/username",
      },
      {
        key: "x",
        label: "X / Twitter",
        icon: <XIcon className="text-[#262626]" />,
        placeholder: "https://x.com/username",
      },
      {
        key: "facebook",
        label: "Facebook",
        icon: <FacebookIcon className="text-[#262626]" />,
        placeholder: "https://facebook.com/...",
      },
      {
        key: "tumblr",
        label: "Tumblr",
        icon: <TumblrIcon className="text-[#262626]" />,
        placeholder: "https://tumblr.com/...",
      },
      {
        key: "pixiv",
        label: "Pixiv",
        icon: <PixivIcon className="text-[#262626]" />,
        placeholder: "https://pixiv.net/...",
      },
      {
        key: "bluesky",
        label: "Bluesky",
        icon: <BlueskyIcon className="text-[#262626]" />,
        placeholder: "https://bsky.app/profile/...",
      },
    ],
    []
  )

  function addKey(key: MediaKey) {
    setActiveKeys((prev) => {
      if (prev.includes(key)) return prev
      if (prev.length >= maxLinks) return prev
      return [...prev, key]
    })
    setOpen(false)
  }

  function removeKey(key: MediaKey) {
    setActiveKeys((prev) => prev.filter((k) => k !== key))
    setLinks((prev) => ({ ...prev, [key]: "" }))
  }

  // ✅ Tell parent whether at least ONE active link is valid
  useEffect(() => {
    const anyValid = activeKeys.some((k) => isValidLinkForKey(k, links[k]))
    onHasAnyValidLinkChange?.(anyValid)
  }, [activeKeys, links, onHasAnyValidLinkChange])

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
    <div className="w-[426px] flex flex-col items-start gap-[10px]" ref={wrapRef}>
      {/* Top row: link icon + dropdown */}
      <div className="w-[397px] h-[40px] flex items-center gap-[13px]">
        <div className="w-[24px] h-[24px] flex items-center justify-center text-[#A5A5A5]">
          <LinkIcon />
        </div>

        <div className="relative w-[360px]">
          {/* Collapsed input */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="
              w-[360px] h-[40px]
              flex items-center justify-between
              px-[10px] py-[12px]
              border border-[#A5A5A5]/50
              rounded-[8px]
              bg-white text-left
            "
          >
            <span className="font-inter text-[12px] leading-[140%] text-[#A5A5A5]">
              Select a media
            </span>
            <span className={open ? "text-[#262626]" : "text-[#A5A5A5]"}>
              <ArrowDown />
            </span>
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="
                absolute left-0 top-[44px]
                w-[360px] h-[273px]
                bg-white
                border border-[#A5A5A5]/50
                rounded-[8px]
                px-[10px] py-[11px]
                flex flex-col gap-[11px]
                z-50
              "
            >
              {/* Header row inside dropdown */}
              <div className="w-[340px] h-[18px] flex items-center justify-between">
                <span className="font-inter text-[12px] leading-[140%] text-[#A5A5A5]">
                  Select a media
                </span>
                <span className="text-[#262626]">
                  <ArrowDown />
                </span>
              </div>

              {/* Options */}
              <div className="w-[340px] flex flex-col gap-[10px]">
                {options.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => addKey(opt.key)}
                    className="
                      w-[340px] h-[19px]
                      flex items-center justify-between
                      px-[5px]
                      hover:bg-[#F7F7F7]
                      rounded-[4px]
                      text-left
                    "
                  >
                    <span className="font-inter text-[12px] leading-[15px] text-[#262626]">
                      {opt.label}
                    </span>

                    {opt.recommended ? (
                      <span className="font-inter text-[9px] leading-[11px] text-[#A5A5A5]">
                        Recommended
                      </span>
                    ) : (
                      <span />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note under dropdown */}
      <div className="w-[426px] h-[9px] flex items-center pl-[37px]">
        <span className="font-inter text-[12px] leading-[140%] text-[#A5A5A5]">
          {noteText}
        </span>
      </div>

      {/* Spawned link inputs */}
      {activeKeys.length > 0 && (
        <div className="w-[426px] flex flex-col gap-[16px] pt-[6px]">
          {activeKeys.map((key) => {
            const opt = options.find((o) => o.key === key)!
            const value = links[key]
            const valid = isValidLinkForKey(key, value)

            return (
              <RemovableLinkInput
                key={key}
                icon={opt.icon}
                value={value}
                onChange={(v) => setLinks((prev) => ({ ...prev, [key]: v }))}
                placeholder={opt.placeholder}
                isValid={valid}
                onRemove={() => removeKey(key)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
