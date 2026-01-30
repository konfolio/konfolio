"use client"

import { useMemo } from "react"
import PopoverArrow from "@/components/icons/PopoverArrow"

export type MediaKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

type Props = {
  mediaKey: MediaKey
  value: string
  onChange: (val: string) => void

  placeholder?: string
  autoFocus?: boolean
  ariaLabel?: string
  className?: string

  ValidIcon: React.ReactNode
  InvalidIcon: React.ReactNode
}

/* ---------- validation ---------- */

function normalizeUrlInput(raw: string) {
  const v = raw.trim()
  if (!v) return ""

  if (/^https?:\/\//i.test(v)) return v
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

  if (url.protocol !== "http:" && url.protocol !== "https:") return false

  const host = url.hostname
  if (!host || !host.includes(".")) return false

  if (/\s/.test(raw)) return false

  switch (key) {
    case "website":
    case "shop":
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
      return hostnameMatches(host, ["bsky.app", "bsky.social"])
    default:
      return false
  }
}

/* ------------------------------------------------------------------ */

export default function LinkInput({
  mediaKey,
  value,
  onChange,
  placeholder = "https://",
  autoFocus = false,
  ariaLabel = "Link",
  className = "",
  ValidIcon,
  InvalidIcon,
}: Props) {
  const hasText = value.trim().length > 0

  const isValid = useMemo(() => {
    if (!hasText) return false
    return isValidLinkForKey(mediaKey, value)
  }, [mediaKey, value, hasText])

  return (
    <div className={`relative w-[294px] overflow-visible ${className}`}>
        <div className="absolute left-1/2 -translate-x-1/2 top-[-6px] z-[60] pointer-events-none">
            <PopoverArrow className="w-[27px] h-[8px] block" />
        </div>

        <div
            className="
            relative z-[40]
            w-[294px] h-[39px]
            p-[10px]
            bg-white
            rounded-[15px]
            shadow-[5px_5px_25px_rgba(0,0,0,0.05)]
            flex flex-col
            gap-[10px]
            "
        >
            <div className="w-[274px] h-[20px] px-[5px] flex items-center justify-between">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder} // disappears on typing 
                autoFocus={autoFocus}
                aria-label={ariaLabel}
                className="
                w-full
                bg-transparent
                outline-none
                font-inter font-normal
                text-[14px] leading-[140%]
                text-[#262626]
                placeholder:text-[#A5A5A5]
                pr-[18px]
                "
            />

            <div className="ml-[6px] w-[16px] h-[16px] flex items-center justify-center">
                {hasText ? (isValid ? ValidIcon : InvalidIcon) : null}
            </div>
            </div>
        </div>
    </div>
  )
}
