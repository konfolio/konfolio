// components/my-portfolios/LinkPicker.tsx
"use client"

import { useMemo, useRef, useState } from "react"
import LinkIcon from "@/components/icons/LinkIcon"
import DeleteIcon from "@/components/icons/DeleteIcon"
import PopoverArrow from "@/components/icons/PopoverArrow"
import LinkInput from "@/components/my-portfolios/LinkInput"
import CheckIcon from "@/components/icons/CheckIcon"
import ErrorIcon from "@/components/icons/ErrorIcon"

import HomeIcon from "@/components/icons/HomeIcon"
import ShopIcon from "@/components/icons/ShopIcon"
import InstagramIcon from "@/components/icons/InstagramIcon"
import XIcon from "@/components/icons/XIcon"
import FacebookIcon from "@/components/icons/FacebookIcon"
import TumblrIcon from "@/components/icons/TumblrIcon"
import PixivIcon from "@/components/icons/PixivIcon"
import BlueskyIcon from "@/components/icons/BlueskyIcon"

import useClickOutside from "@/components/hooks/useClickOutside"

export type LinkKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

type LinkOption = {
  key: LinkKey
  label: string
  rightText?: string
  Icon: React.ComponentType<{ className?: string }>
}

export type LinkPickerValue = {
  activeKeys: LinkKey[]
  linksByKey: Record<LinkKey, string>
}

type Props = {
  onAddLinkClick?: () => void

  /** Controlled mode (optional): */
  value?: LinkPickerValue
  onChange?: (next: LinkPickerValue) => void

  /** Max number of total active links (default 5) */
  maxLinks?: number

  bannerIsDark?: boolean
}

const EMPTY: LinkPickerValue = {
  activeKeys: [],
  linksByKey: {
    website: "",
    shop: "",
    instagram: "",
    x: "",
    facebook: "",
    tumblr: "",
    pixiv: "",
    bluesky: "",
  },
}

export default function LinkPicker({
  onAddLinkClick,
  value,
  onChange,
  maxLinks = 5,
  bannerIsDark = false,
}: Props) {
  // internal fallback (uncontrolled mode)
  const [internal, setInternal] = useState<LinkPickerValue>(EMPTY)

  const state = value ?? internal
  const setState = (next: LinkPickerValue) => {
    onChange?.(next)
    if (value === undefined) setInternal(next)
  }

  const [linksOpen, setLinksOpen] = useState(false)
  const [activeInputKey, setActiveInputKey] = useState<LinkKey | null>(null)

  const wrapRef = useRef<HTMLDivElement | null>(null)

  const selectedIconClass = bannerIsDark ? "text-white" : "text-[#262626]"
  const activeIconClass = "text-[#A5A5A5]"
  const addLinkIconClass = bannerIsDark ? "text-white" : "text-[#A5A5A5]"

  const linkOptions: LinkOption[] = useMemo(
    () => [
      {
        key: "website",
        label: "Main Website",
        rightText: "Recommended",
        Icon: HomeIcon,
      },
      {
        key: "shop",
        label: "Main Shop",
        rightText: "Recommended",
        Icon: ShopIcon,
      },
      {
        key: "instagram",
        label: "Instagram",
        rightText: "Recommended",
        Icon: InstagramIcon,
      },
      {
        key: "x",
        label: "X / Twitter",
        Icon: XIcon,
      },
      {
        key: "facebook",
        label: "Facebook",
        Icon: FacebookIcon,
      },
      {
        key: "tumblr",
        label: "Tumblr",
        Icon: TumblrIcon,
      },
      {
        key: "pixiv",
        label: "Pixiv",
        Icon: PixivIcon,
      },
      {
        key: "bluesky",
        label: "Bluesky",
        Icon: BlueskyIcon,
      },
    ],
    []
  )

  const atMax = state.activeKeys.length >= maxLinks

  const addKey = (key: LinkKey) => {
    // if already active, just focus that input
    if (state.activeKeys.includes(key)) {
      setLinksOpen(false)
      setActiveInputKey(key)
      return
    }

    // enforce limit
    if (state.activeKeys.length >= maxLinks) {
      setLinksOpen(false)
      return
    }

    setState({
      ...state,
      activeKeys: [...state.activeKeys, key],
    })

    setLinksOpen(false)
    setActiveInputKey(key)
  }

  const removeKey = (key: LinkKey) => {
    setState({
      activeKeys: state.activeKeys.filter((k) => k !== key),
      linksByKey: { ...state.linksByKey, [key]: "" },
    })
    setLinksOpen(false)
    setActiveInputKey((cur) => (cur === key ? null : cur))
  }

  const setLinkValue = (key: LinkKey, val: string) => {
    setState({
      ...state,
      linksByKey: { ...state.linksByKey, [key]: val },
    })
  }

  // close dropdown + input on outside click / esc
  useClickOutside(
    wrapRef,
    () => {
      setLinksOpen(false)
      setActiveInputKey(null)
    },
    { enabled: linksOpen || !!activeInputKey, closeOnEsc: true }
  )

  return (
    <div className="relative inline-flex items-center gap-[10px] overflow-visible" ref={wrapRef}>
      {/* Selected icons */}
      {state.activeKeys.map((k) => {
        const opt = linkOptions.find((o) => o.key === k)
        if (!opt) return null

        const isActive = activeInputKey === k

        return (
          <div key={k} className="group relative">
            <button
              type="button"
              aria-label={`Edit ${opt.label} link`}
              className={`
                w-[18px] h-[18px]
                flex items-center justify-center
                transition-colors
                ${isActive ? activeIconClass : selectedIconClass}
              `}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setLinksOpen(false)
                setActiveInputKey((cur) => (cur === k ? null : k))
              }}
            >
              <opt.Icon
                className={`
                  w-[24px] h-[24px] cursor-pointer
                  ${isActive ? activeIconClass : selectedIconClass}
                `}
              />
            </button>

            {/* remove icon on hover */}
            <button
              type="button"
              aria-label="Remove link"
              className="
                absolute -top-[6px] -right-[6px]
                w-[14px] h-[14px]
                flex items-center justify-center
                bg-white rounded-full
                opacity-0 transition-opacity
                group-hover:opacity-100
                z-[80]
                text-[#A5A5A5]
                [&_path]:fill-[#A5A5A5]
                [&_path]:stroke-[#A5A5A5]
                cursor-pointer
              "
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                removeKey(k)
              }}
            >
              <DeleteIcon className="w-[10px] h-[10px]" />
            </button>
          </div>
        )
      })}

      {/* Add link button (hide at max) */}
      {!atMax ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setActiveInputKey(null)
            setLinksOpen((v) => !v)
          }}
          className={`
            w-[18px] h-[18px]
            flex items-center justify-center
            cursor-pointer
            ${addLinkIconClass}
            [&_path]:!fill-none
            [&_path]:!stroke-current
          `}
          aria-label="Add link"
        >
          <LinkIcon className="w-[18px] h-[18px]" />
        </button>
      ) : null}

      {/* Dropdown (ALL options stay visible; selected ones disabled) */}
      {linksOpen ? (
        <div
          className="
            absolute left-1/2 -translate-x-1/2 top-[30px]
            w-[294px] h-[290px]
            bg-white
            rounded-[15px]
            shadow-[5px_5px_25px_rgba(0,0,0,0.05)]
            p-[10px]
            flex flex-col gap-[10px]
            z-[60]
          "
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-[-6px] z-[80] pointer-events-none">
            <PopoverArrow className="w-[27px] h-[8px] block" />
          </div>

          {linkOptions.map((opt) => {
            const alreadySelected = state.activeKeys.includes(opt.key)
            const disabled = alreadySelected || atMax

            return (
              <button
                key={opt.key}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (disabled) return
                  addKey(opt.key)
                  onAddLinkClick?.()
                }}
                className={`
                  w-[274px] h-[30px]
                  flex items-center justify-between
                  px-[10px]
                  rounded-[10px]
                  text-left
                  ${disabled ? "cursor-not-allowed" : "hover:bg-[#F7F7F7]"}
                `}
                aria-disabled={disabled}
              >
                <span
                  className={`
                    font-inter font-normal text-[14px] leading-[140%]
                    ${disabled ? "text-[#A5A5A5]" : "text-[#262626]"}
                  `}
                >
                  {opt.label}
                </span>

                <span className="font-inter font-normal text-[14px] leading-[140%] text-[#A5A5A5]">
                  {opt.rightText ?? ""}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Link input popover */}
      {activeInputKey ? (
        <div className="absolute left-1/2 -translate-x-1/2 top-[30px] z-[90] overflow-visible">
          <LinkInput
            mediaKey={activeInputKey}
            value={state.linksByKey[activeInputKey]}
            onChange={(val) => setLinkValue(activeInputKey, val)}
            placeholder="https://"
            autoFocus
            ariaLabel={`${activeInputKey} link`}
            ValidIcon={<CheckIcon className="w-[16px] h-[16px] [&_path]:stroke-[#00CF07]" />}
            InvalidIcon={<ErrorIcon className="w-[16px] h-[16px]" />}
          />
        </div>
      ) : null}
    </div>
  )
}