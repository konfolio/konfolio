// components/my-portfolios/CreateKonfolioCard.tsx
"use client"

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase/browser"

import Tag from "@/components/onboarding/Tag"
import InfoIcon from "@/components/icons/InfoIcon"
import ArrowRight from "@/components/icons/ArrowRight"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import InfoPopover from "@/components/icons/InfoPopover"

type TemplateType = "square" | "portrait"

type TemplateCard = {
  title: string
  subtitle: string
  tagLabel: string
  imageSrc: string
  imageAlt: string
  primaryCta: string
  primaryHref?: string
  secondaryCta: string
  secondaryHref: string
  templateType: TemplateType
}

type Props = {
  templates?: [TemplateCard, TemplateCard]
  infoText?: string
  title?: string

  /** If provided, buttons become callback-driven instead of href navigation. */
  onPickTemplate?: (t: TemplateType) => void

  /** Disable primary template buttons */
  disabled?: boolean

  /** Optional override label while creating */
  primaryLoadingLabel?: string
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export default function CreateKonfolioCard({
  title = "Create your first Konfolio",
  infoText = "We work with templates to reduce variety and support our auto-fill system.",
  templates = [
    {
      title: "3x3 Square Template",
      subtitle: "4 Artwork, 4 Product, 1 Table Display",
      tagLabel: "Best For Product Variety",
      imageSrc: "/images/template-1.png",
      imageAlt: "Square template preview",
      primaryCta: "Use Square Template",
      primaryHref: "/my-portfolios/new?template=square",
      secondaryCta: "Explore Square Examples",
      secondaryHref: "/explore?template=square",
      templateType: "square",
    },
    {
      title: "4x2 Portrait Template",
      subtitle: "4 Artwork, 3 Product, 1 Table Display",
      tagLabel: "Best For Art & Print Showcase",
      imageSrc: "/images/template-2.png",
      imageAlt: "Portrait template preview",
      primaryCta: "Use Portrait Template",
      primaryHref: "/my-portfolios/new?template=portrait",
      secondaryCta: "Explore Portrait Examples",
      secondaryHref: "/explore?template=portrait",
      templateType: "portrait",
    },
  ],
  onPickTemplate,
  disabled = false,
  primaryLoadingLabel,
}: Props) {
  const router = useRouter()

  const [infoOpen, setInfoOpen] = useState(false)

  const sectionRef = useRef<HTMLElement | null>(null)
  const infoBtnRef = useRef<HTMLButtonElement | null>(null)

  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({ display: "none" })
  const [iconShiftX, setIconShiftX] = useState(0)

  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  const effectiveDisabled = disabled || isCreating
  const effectiveLoadingLabel = primaryLoadingLabel ?? (isCreating ? "Creating..." : undefined)

  async function createAndGo(template: TemplateType) {
    setCreateError("")
    setIsCreating(true)

    try {
      const token = await getAccessToken()
      if (!token) {
        setCreateError("Not signed in")
        return
      }

      const res = await fetch("/api/konfolios/create-from-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ template }),
      })

      if (!res.ok) {
        let msg = "Failed to create Konfolio"
        try {
          const j = await res.json()
          if (j?.error) msg = String(j.error)
        } catch {
          // ignore
        }
        setCreateError(msg)
        return
      }

      const data = (await res.json()) as { id?: string }
      const id = String(data?.id ?? "").trim()
      if (!id) {
        setCreateError("Create succeeded but no id returned")
        return
      }

      router.push(`/my-portfolios/${id}/edit`)
      router.refresh()
    } catch (e: any) {
      setCreateError(e?.message ?? "Failed to create Konfolio")
    } finally {
      setIsCreating(false)
    }
  }

  useLayoutEffect(() => {
    const compute = () => {
      const section = sectionRef.current
      const btn = infoBtnRef.current
      if (!section || !btn) return

      const sectionRect = section.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()

      const POPOVER_W = 166
      const ARROW_H = 8
      const GAP = 6

      const BTN_W = 36
      const baseIconCenterX = sectionRect.width - BTN_W / 2

      const padding = 8
      const minCenterX = padding + POPOVER_W / 2
      const maxCenterX = sectionRect.width - padding - POPOVER_W / 2

      const desiredCenterX = Math.max(minCenterX, Math.min(baseIconCenterX, maxCenterX))
      setIconShiftX(desiredCenterX - baseIconCenterX)

      const left = desiredCenterX - POPOVER_W / 2
      const top = btnRect.bottom - sectionRect.top + GAP + ARROW_H

      setPopoverStyle({
        position: "absolute",
        top,
        left,
        width: POPOVER_W,
        zIndex: 50,
        display: infoOpen ? "block" : "none",
      })
    }

    compute()
    window.addEventListener("resize", compute)
    return () => window.removeEventListener("resize", compute)
  }, [infoOpen])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const btn = infoBtnRef.current
      const pop = document.getElementById("create-konfolio-info-popover")
      const target = e.target as Node

      if (btn?.contains(target)) return
      if (pop?.contains(target)) return

      setInfoOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInfoOpen(false)
    }

    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-[1254px] h-[766px] flex flex-col items-end gap-[41px] max-w-[calc(100vw-40px)]"
    >
      <div className="relative w-full h-[18px] flex items-center justify-center">
        <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-[#262626] text-center">{title}</p>

        <button
          ref={infoBtnRef}
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          className="
            absolute right-0 top-1/2
            w-[36px] h-[36px]
            flex items-center justify-center
            rounded-[10px]
            hover:bg-black/5
            transition-colors
            focus:outline-none focus-visible:outline-none
            focus:ring-0 focus-visible:ring-0
          "
          style={{ transform: `translate(${iconShiftX}px, -50%)` }}
          aria-label="Info"
          aria-expanded={infoOpen}
        >
          <InfoIcon />
        </button>
      </div>

      <div style={popoverStyle}>
        <div id="create-konfolio-info-popover">
          <InfoPopover open={infoOpen} text={infoText} onClose={() => setInfoOpen(false)} />
        </div>
      </div>

      {/* Optional inline error (keeps layout clean) */}
      {createError ? (
        <p className="m-0 w-full text-center text-[12px] leading-[130%] text-[#FF4603]">{createError}</p>
      ) : null}

      <div className="relative w-[1254px] h-[707px] bg-white rounded-[15px] shadow-[4px_4px_15px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full px-[67px] flex items-center justify-between">
            <TemplateColumn
              t={templates[0]}
              onPickTemplate={(t) => {
                if (onPickTemplate) return onPickTemplate(t)
                void createAndGo(t)
              }}
              disabled={effectiveDisabled}
              loadingLabel={effectiveLoadingLabel}
            />
            <TemplateColumn
              t={templates[1]}
              onPickTemplate={(t) => {
                if (onPickTemplate) return onPickTemplate(t)
                void createAndGo(t)
              }}
              disabled={effectiveDisabled}
              loadingLabel={effectiveLoadingLabel}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function TemplateColumn({
  t,
  onPickTemplate,
  disabled,
  loadingLabel,
}: {
  t: TemplateCard
  onPickTemplate?: (t: TemplateType) => void
  disabled?: boolean
  loadingLabel?: string
}) {
  return (
    <div className="w-[540px] h-[585.71px] flex flex-col items-center gap-[30px]">
      <div className="w-[240px] flex flex-col items-center gap-[15px]">
        <p className="m-0 font-roboto text-[20px] leading-[23px] text-[#262626] text-center">{t.title}</p>
        <p className="m-0 font-roboto text-[13px] leading-[15px] text-[#A5A5A5] text-center">{t.subtitle}</p>
      </div>

      <Tag label={t.tagLabel} className="text-[#A5A5A5]" />

      <div
        className="
          relative
          w-[540px]
          rounded-[10px]
          border-[0.5px] border-[#A5A5A5]/30
          shadow-[4px_4px_10px_rgba(0,0,0,0.05)]
          overflow-hidden
          bg-white
          flex-none
        "
        style={{ height: "350.7143px" }}
      >
        <Image src={t.imageSrc} alt={t.imageAlt} fill sizes="540px" className="object-contain" priority={false} />
      </div>

      {onPickTemplate ? (
        <button
          type="button"
          disabled={!!disabled}
          onClick={() => onPickTemplate(t.templateType)}
          className={`
            group flex items-center justify-center gap-[7px]
            h-[39px] min-w-[150px] px-[40px] py-[13px]
            rounded-[100px]
            text-[14px] leading-[140%] font-normal whitespace-nowrap
            transition-all duration-100 ease-out
            ${
              disabled
                ? "bg-[#262626]/40 text-white/70 cursor-not-allowed"
                : "bg-[#262626] text-white hover:bg-[#262626CC] active:bg-[#262626B2]"
            }
          `}
        >
          <span>{disabled && loadingLabel ? loadingLabel : t.primaryCta}</span>
        </button>
      ) : (
        <PrimaryButton href={t.primaryHref ?? "/my-portfolios/new"} icon="none">
          {t.primaryCta}
        </PrimaryButton>
      )}

      <Link
        href={t.secondaryHref}
        className="
          flex items-center gap-[5px]
          font-inter text-[14px] leading-[140%]
          text-[#A5A5A5]
          hover:text-[#262626]
          transition-colors
          [&_path]:transition-colors
          [&_path]:stroke-[#A5A5A5]
          hover:[&_path]:stroke-[#262626]
        "
      >
        <span>{t.secondaryCta}</span>
        <ArrowRight className="w-[11px] h-[11px]" />
      </Link>
    </div>
  )
}
