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
import PortfolioNameCard from "@/components/my-portfolios/dashboard/PortfolioNameCard"
import DeleteIcon from "@/components/icons/DeleteIcon"


type TemplateType = "square" | "portrait" | "shared" | "custom"

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
  templates?: [TemplateCard, TemplateCard, TemplateCard]
  infoText?: string
  title?: string

  /** If provided, buttons become callback-driven instead of href navigation. */
  onPickTemplate?: (t: TemplateType) => void

  /** Disable primary template buttons */
  disabled?: boolean

  /** Optional override label while creating */
  primaryLoadingLabel?: string

  /**
   * When true, selecting a template opens the Name Card next,
   * and only after naming do we create + route.
   *
   * Default false so popover behavior stays unchanged.
   */
  enableNameStep?: boolean

    // ---- Chose template ----
  onClose?: () => void
  onExploreTemplate?: (t: TemplateType) => void
  onUseTemplateCode?: (code: string) => void
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
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
    {
      title: "4x2 Shared Template",
      subtitle: "6 Product, 2 Table Display",
      tagLabel: "Best For New Artists",
      imageSrc: "/images/template-3.png",
      imageAlt: "Shared template preview",
      primaryCta: "Use Shared Template",
      primaryHref: "/my-portfolios/new?template=shared",
      secondaryCta: "Explore Shared Examples",
      secondaryHref: "/explore?template=shared",
      templateType: "shared",
    },
  ],
  onPickTemplate,
  disabled = false,
  primaryLoadingLabel,
  enableNameStep = false,
  onClose,
  onExploreTemplate,
  onUseTemplateCode,
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

  // Name-step state (only used when enableNameStep=true)
  const [nameCardOpen, setNameCardOpen] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<TemplateType | null>(null)
  const [businessSlug, setBusinessSlug] = useState("businessname")

  useEffect(() => {
    if (!enableNameStep) return

    let mounted = true

    async function loadBusinessName() {
      const sessionRes = await supabase.auth.getSession()
      const user = sessionRes.data.session?.user
      if (!mounted) return
      if (!user) return

      const profileRes = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return
      const bn = String(profileRes.data?.business_name ?? "").trim()
      setBusinessSlug(bn ? slugify(bn) : "businessname")
    }

    loadBusinessName()
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadBusinessName())

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [enableNameStep])

  async function createAndGo(template: TemplateType, portfolioName?: string) {
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
        body: JSON.stringify({
          template,
          portfolioName: (portfolioName || "").trim() || null,
        }),
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

  function openNameStep(template: TemplateType) {
    setPendingTemplate(template)
    setNameCardOpen(true)
  }

  function closeNameStep() {
    setNameCardOpen(false)
    setPendingTemplate(null)
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

  // ---- Display data (index-aligned with `templates`) ----
const TEMPLATE_CARDS = [
  {
    title: '3×3 Square Template',
    specs: '4 Artwork, 4 Product, 1 Table Display',
    badge: 'Best For Product Variety',
    thumbnail: '/images/template-1.png',
    ctaLabel: 'Use Square Template',
    exploreLabel: 'Explore Square Examples',
  },
  {
    title: '4×2 Portrait Template',
    specs: '4 Artwork, 3 Product, 1 Table Display',
    badge: 'Best For Art & Print Showcase',
    thumbnail: '/images/template-2.png',
    ctaLabel: 'Use Portrait Template',
    exploreLabel: 'Explore Portrait Examples',
  },
  {
    title: '4×2 Shared Template',
    specs: '6 Product, 2 Table Display',
    badge: 'Best For New Artists',
    thumbnail: '/images/template-3.png',
    ctaLabel: 'Use Shared Template',
    exploreLabel: 'Explore Shared Examples',
  },
] as const

// ---- Inside component, before return ----
const [templateCode, setTemplateCode] = useState('')

const handlePick = (type: TemplateType) => {
  if (effectiveDisabled) return
  if (onPickTemplate) return onPickTemplate(type)
  if (enableNameStep) return openNameStep(type)
  void createAndGo(type)
}

return (
  <>
    <section
      ref={sectionRef}
      className="relative flex h-[707px] max-h-[calc(100vh-40px)] w-[1102px] max-w-[calc(100vw-40px)] flex-col items-center gap-[30px] overflow-hidden rounded-[15px] bg-white px-[70px] pt-[50px] pb-[20px] shadow-[4px_4px_15px_rgba(0,0,0,0.1)]"
    >
      {/* Close (position needs fixing)*/}
      {onClose ? (
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close"
          className="absolute left-[20px] top-[20px] z-20 size-[26px] cursor-pointer focus:outline-none"
        >
          <DeleteIcon />
        </button>
      ) : null}

      {/* Info (kept; sits left of the X) */}
      <div className="relative z-">
        <p className="m-0 font-inter text-[20px] font-normal leading-[1.4] text-[#262626] text-center">
          {title || 'Select A Template'}
        </p>

        <button
          ref={infoBtnRef}
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          className="absolute left-[135px] top-1/2 ml-[35px] flex size-[36px] -translate-y-1/2 items-center justify-center rounded-[10px] transition-colors hover:bg-black/5 focus:outline-none focus-visible:outline-none"
          aria-label="Info"
          aria-expanded={infoOpen}
        >
          <InfoIcon className="size-5"/>
        </button>
      </div>

      <div style={popoverStyle}>
        <div id="create-konfolio-info-popover">
          <InfoPopover open={infoOpen} text={infoText} onClose={() => setInfoOpen(false)} width={166}/>
        </div>
      </div>

      {createError ? (
        <p className="m-0 -mt-[18px] w-full text-center text-[12px] leading-[1.3] text-[#FF4603]">
          {createError}
        </p>
      ) : null}

      {/* Scrollable grid (px/-mx keeps card shadows from clipping) */}
      <div className="-mx-[20px] -mt-[20px] min-h-0 w-[calc(100%+40px)] flex-1 overflow-y-auto overscroll-contain px-[20px] pt-[20px]">
        <div className="mx-auto grid w-[962px] max-w-full grid-cols-1 gap-[20px] pb-[30px] lg:grid-cols-2">
          {TEMPLATE_CARDS.map((card, i) => {
            const t = templates[i]
            if (!t) return null
            return (
            <TemplateOptionCard
              key={card.title}
              {...card}
              onUse={() => handlePick(t.templateType)} // ← or t.id, whatever TemplateColumn used
              onExplore={onExploreTemplate ? () => onExploreTemplate(t.templateType) : undefined}
              disabled={effectiveDisabled}
              loadingLabel={effectiveLoadingLabel}
            />
            )
          })}

          <TemplateCodeCard
            value={templateCode}
            onChange={setTemplateCode}
            onSubmit={() => onUseTemplateCode?.(templateCode.trim())}
            disabled={effectiveDisabled}
          />
        </div>
      </div>
    </section>

    {enableNameStep ? (
      <PortfolioNameCard
        isOpen={nameCardOpen}
        businessSlug={businessSlug}
        onClose={closeNameStep}
        onContinue={(portfolioName) => {
          const t = pendingTemplate
          if (!t) return
          closeNameStep()
          void createAndGo(t, portfolioName)
        }}
      />
    ) : null}
  </>
)
}

// ---- Sub-components ----
const cardBase =
  'flex flex-col items-center rounded-[15px] bg-white px-[20px] py-[30px] shadow-[2px_2px_15px_rgba(0,0,0,0.1)] gap-[25px]'

const primaryBtn =
  'flex h-[33px] min-w-[150px] items-center justify-center rounded-full bg-[#262626] px-[40px] font-inter text-[14px] leading-[1.3] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50'

type TemplateCardProps = {
  title: string
  specs: string
  badge: string
  thumbnail: string
  ctaLabel: string
  exploreLabel: string
  onUse: () => void
  onExplore?: () => void
  disabled?: boolean
  loadingLabel?: string
}

function TemplateOptionCard({
  title, specs, badge, thumbnail, ctaLabel, exploreLabel,
  onUse, onExplore, disabled, loadingLabel,
}: TemplateCardProps) {
  return (
    <div className={`${cardBase} gap-[20px]`}>
      <div className="flex flex-col items-center gap-[5px] text-center font-inter">
        <p className="m-0 text-[20px] leading-[1.4] text-[#262626]">{title}</p>
        <p className="m-0 text-[12px] leading-[1.3] text-black/40">{specs}</p>
      </div>

      <span className="rounded-full border-[0.5px] border-black/40 px-[22px] py-[5px] font-inter text-[12px] leading-[1.3] text-black/40">
        {badge}
      </span>

      <div className="h-[232px] w-[357px] max-w-full overflow-hidden rounded-[6.6px] border-[0.33px] border-[#d3d3d3] shadow-[2.6px_2.6px_6.6px_rgba(0,0,0,0.05)]">
        <img src={thumbnail} alt={`${title} preview`} className="size-full object-cover" />
      </div>

      <div className="flex flex-col items-center gap-[5px]">
        <button type="button" onClick={onUse} disabled={disabled} className={primaryBtn}>
          {disabled && loadingLabel ? loadingLabel : ctaLabel}
        </button>

        <button
          type="button"
          onClick={onExplore}
          className="flex items-center gap-[5px] p-[5px] font-inter text-[12px] leading-[1.3] text-black/40 transition-colors hover:text-black/60"
        >
          {exploreLabel}
          <ArrowRight className="size-3"/>
        </button>
      </div>
    </div>
  )
}

function TemplateCodeCard({
  value, onChange, onSubmit, disabled,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit()
      }}
      className={`${cardBase} min-h-[473px] justify-center gap-[59px]`}
    >
      <div className="flex flex-col items-center gap-[5px] text-center font-inter">
        <p className="m-0 text-[20px] leading-[1.4] text-[#262626]">Template Code</p>
        <p className="m-0 text-[12px] leading-[1.3] text-black/40">
          Customized template from event organizer
        </p>
      </div>

      <label className="w-[327px] max-w-full pt-[10px]">
        <span className="sr-only">Template code</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter Code"
          className="w-full border-0 border-b border-[#d3d3d3] bg-transparent pb-[10px] text-center font-inter text-[17px] leading-[1.4] text-[#262626] outline-none transition-colors placeholder:text-[#d3d3d3] focus:border-[#262626]"
        />
      </label>

      <button type="submit" disabled={disabled || !value.trim()} className={primaryBtn}>
        Use Custom Template
      </button>
    </form>
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