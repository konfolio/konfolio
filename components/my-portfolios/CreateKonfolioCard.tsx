"use client"

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"

import Tag from "@/components/onboarding/Tag"
import InfoIcon from "@/components/icons/InfoIcon"
import ArrowRight from "@/components/icons/ArrowRight"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import InfoPopover from "@/components/icons/InfoPopover"

type TemplateCard = {
  title: string
  subtitle: string
  tagLabel: string
  imageSrc: string
  imageAlt: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
}

type Props = {
  templates?: [TemplateCard, TemplateCard]
  infoText?: string
}

export default function CreateKonfolioCard({
  infoText = "We work with templates to reduce variety and support our auto-fill system.",
  templates = [
    {
      title: "3x3 Square Template",
      subtitle: "4 Art Work, 4 Product, 1 Table Display",
      tagLabel: "Best For Product Variety",
      imageSrc: "/images/template-1.png",
      imageAlt: "Square template preview",
      primaryCta: "Use Square Template",
      primaryHref: "/onboarding/template/square",
      secondaryCta: "Explore Square Examples",
      secondaryHref: "/explore?template=square",
    },
    {
      title: "4x2 Portrait Template",
      subtitle: "4 Art Work, 3 Product, 1 Table Display",
      tagLabel: "Best For Art & Print Showcase",
      imageSrc: "/images/template-2.png",
      imageAlt: "Portrait template preview",
      primaryCta: "Use Portrait Template",
      primaryHref: "/onboarding/template/portrait",
      secondaryCta: "Explore Portrait Examples",
      secondaryHref: "/explore?template=portrait",
    },
  ],
}: Props) {
  const [infoOpen, setInfoOpen] = useState(false)

  const sectionRef = useRef<HTMLElement | null>(null)
  const infoBtnRef = useRef<HTMLButtonElement | null>(null)

  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({ display: "none" })
  const [iconShiftX, setIconShiftX] = useState(0)

  // Keep popover arrow centered. If popover would be clamped, shift ICON permanently so its center matches popover center.
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

      // Fixed button box size from your classes
      const BTN_W = 36

      // Because the button is `absolute right-0`, its natural (unshifted) center X inside the section is:
      const baseIconCenterX = sectionRect.width - BTN_W / 2

      // Popover must stay within [padding, sectionWidth - POPOVER_W - padding]
      const padding = 8
      const minCenterX = padding + POPOVER_W / 2
      const maxCenterX = sectionRect.width - padding - POPOVER_W / 2

      // Desired center for popover (and arrow) is the icon center, but clamped to bounds
      const desiredCenterX = Math.max(minCenterX, Math.min(baseIconCenterX, maxCenterX))

      // Permanently shift icon so its center matches the clamped popover center (no jump on open)
      setIconShiftX(desiredCenterX - baseIconCenterX)

      // Popover position: centered at desiredCenterX
      const left = desiredCenterX - POPOVER_W / 2

      // Vertical anchoring can still use btnRect (Y only)
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

  // Close on outside click / ESC (single source of truth)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const btn = infoBtnRef.current
      const pop = document.getElementById("create-konfolio-info-popover")
      const target = e.target as Node

      // Let the button handle toggle; don't close from this handler.
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
      className="
        relative
        w-[1254px] h-[766px]
        flex flex-col items-end
        gap-[41px]
        max-w-[calc(100vw-40px)]
      "
    >
      {/* Header */}
      <div className="relative w-full h-[18px] flex items-center justify-center">
        <p className="m-0 font-inter font-normal text-[25px] leading-[30px] text-[#262626] text-center">
          Create your first Konfolio
        </p>

        {/* Info button: shifted always (stable), not on click */}
        <button
          ref={infoBtnRef}
          type="button"
          onClick={() => setInfoOpen((v) => !v)} // ✅ click again closes
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
          style={{
            transform: `translate(${iconShiftX}px, -50%)`,
          }}
          aria-label="Info"
          aria-expanded={infoOpen}
        >
          <InfoIcon />
        </button>
      </div>

      {/* Popover (arrow remains centered inside popover like before) */}
      <div style={popoverStyle}>
        <div id="create-konfolio-info-popover">
          <InfoPopover open={infoOpen} text={infoText} onClose={() => setInfoOpen(false)} />
        </div>
      </div>

      {/* White card */}
      <div
        className="
          relative
          w-[1254px] h-[707px]
          bg-white
          rounded-[15px]
          shadow-[4px_4px_15px_rgba(0,0,0,0.1)]
        "
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full px-[67px] flex items-center justify-between">
            <TemplateColumn t={templates[0]} />
            <TemplateColumn t={templates[1]} />
          </div>
        </div>
      </div>
    </section>
  )
}

function TemplateColumn({ t }: { t: TemplateCard }) {
  return (
    <div className="w-[540px] h-[585.71px] flex flex-col items-center gap-[30px]">
      {/* Title */}
      <div className="w-[240px] flex flex-col items-center gap-[15px]">
        <p className="m-0 font-roboto text-[20px] leading-[23px] text-[#262626] text-center">
          {t.title}
        </p>
        <p className="m-0 font-roboto text-[13px] leading-[15px] text-[#A5A5A5] text-center">
          {t.subtitle}
        </p>
      </div>

      {/* Tag */}
      <Tag label={t.tagLabel} className="text-[#A5A5A5]" />

      {/* Preview image */}
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
        <Image
          src={t.imageSrc}
          alt={t.imageAlt}
          fill
          sizes="540px"
          className="object-contain"
          priority={false}
        />
      </div>

      {/* Primary CTA */}
      <PrimaryButton href={t.primaryHref} icon="none">
        {t.primaryCta}
      </PrimaryButton>

      {/* Secondary CTA */}
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
