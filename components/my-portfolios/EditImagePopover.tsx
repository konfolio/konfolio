// components/my-portfolios/EditImagePopover.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useClickOutside from "@/components/hooks/useClickOutside"

import DeleteIcon from "@/components/icons/DeleteIcon"
import PaletteIcon from "@/components/icons/PaletteIcon"

import ArrowRotateIcon from "@/components/icons/ArrowRotateIcon"
import ZoomInIcon from "@/components/icons/ZoomInIcon"
import SunIcon from "@/components/icons/SunIcon"
import CircleHalfIcon from "@/components/icons/CircleHalfIcon"
import ThermometerIcon from "@/components/icons/ThermometerIcon"
import ImagesIcon from "@/components/icons/ImagesIcon"
import WandIcon from "@/components/icons/WandIcon"
import RevertIcon from "@/components/icons/RevertIcon"

import SliderField from "@/components/my-portfolios/SliderField"

export type ImageEdits = {
  rotate: number
  zoom: number
  brightness: number
  contrast: number
  saturation: number
  temperature: number
}

type Variant = "square" | "portrait"

type Props = {
  title?: string
  imageSrc?: string
  onClose: () => void

  placement?: "right" | "left" // not used for flipping layout anymore
  variant?: Variant

  titleText?: string
  descriptionText?: string
  onChangeMeta?: (next: { title: string; description: string }) => void

  edits?: ImageEdits
  onChangeEdits?: (next: ImageEdits) => void
}

type SliderRowProps = {
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  ariaLabel: string
  showFill?: boolean
  fillMode?: "start" | "center"
}

function SliderRow({ icon, value, onChange, ariaLabel, showFill = false, fillMode = "start" }: SliderRowProps) {
  return (
    <div className="w-[181px] h-[16px] flex flex-row items-center gap-[16px]">
      <div className="w-[16px] h-[16px] text-[#262626] flex items-center justify-center overflow-visible shrink-0">
        {icon}
      </div>

      <SliderField
        ariaLabel={ariaLabel}
        value={value}
        onChange={onChange}
        showFill={showFill}
        showTicks
        fillMode={fillMode}
      />
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

const VARIANT_STYLES: Record<
  Variant,
  {
    popover: { w: string; h: string }
    image: { w: string; h: string }
    controls: { xFromLeft: string; h: string }
  }
> = {
  square: {
    popover: { w: "w-[515px]", h: "h-[314px]" },
    image: { w: "w-[284px]", h: "h-[284px]" },
    controls: { xFromLeft: "left-[319px]", h: "h-[284px]" },
  },
  portrait: {
    popover: { w: "w-[500px]", h: "h-[375px]" },
    image: { w: "w-[274px]", h: "h-[345px]" },
    controls: { xFromLeft: "left-[309px]", h: "h-[345px]" },
  },
}

const DEFAULT_EDITS: ImageEdits = {
  rotate: 50,
  zoom: 0,
  brightness: 50,
  contrast: 50,
  saturation: 50,
  temperature: 50,
}

export default function EditImagePopover({
  title = "Recommended - Most Recent Work",
  imageSrc,
  onClose,
  placement = "right",
  variant = "square",

  titleText = "Title",
  descriptionText = "Short description",
  onChangeMeta,

  edits,
  onChangeEdits,
}: Props) {
  const popoverRef = useRef<HTMLDivElement | null>(null)
  useClickOutside(popoverRef, onClose, { enabled: true, closeOnEsc: true })

  const [shiftX, setShiftX] = useState(0)

  const clampToViewport = () => {
    const el = popoverRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const margin = 12

    const overflowRight = rect.right - (window.innerWidth - margin)
    const overflowLeft = margin - rect.left

    let nextShift = 0
    if (overflowRight > 0) nextShift -= overflowRight
    if (overflowLeft > 0) nextShift += overflowLeft

    setShiftX((cur) => (Math.abs(cur - nextShift) > 0.5 ? nextShift : cur))
  }

  // ✅ Clamp ONLY when the popover opens / variant changes / image changes
  // ❌ Do NOT clamp on title/description typing (that causes the "jump")
  useEffect(() => {
    const raf = requestAnimationFrame(() => clampToViewport())
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, placement, imageSrc])

  // ✅ Also clamp on resize (and optionally scroll)
  useEffect(() => {
    const onResize = () => clampToViewport()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mergedEdits = edits ?? DEFAULT_EDITS
  const setEdit = (patch: Partial<ImageEdits>) => {
    const next: ImageEdits = { ...mergedEdits, ...patch }
    onChangeEdits?.(next)
  }

  const rotateDeg = useMemo(() => ((clamp(mergedEdits.rotate, 0, 100) - 50) / 50) * 180, [mergedEdits.rotate])
  const zoomScale = useMemo(() => 1 + (clamp(mergedEdits.zoom, 0, 100) / 100) * 1.0, [mergedEdits.zoom])

  const brightnessVal = useMemo(
    () => 0.5 + (clamp(mergedEdits.brightness, 0, 100) / 100) * 1.0,
    [mergedEdits.brightness]
  )
  const contrastVal = useMemo(
    () => 0.5 + (clamp(mergedEdits.contrast, 0, 100) / 100) * 1.0,
    [mergedEdits.contrast]
  )
  const saturateVal = useMemo(() => clamp(mergedEdits.saturation, 0, 100) / 50, [mergedEdits.saturation])

  const hueRotateDeg = useMemo(
    () => ((clamp(mergedEdits.temperature, 0, 100) - 50) / 50) * 30,
    [mergedEdits.temperature]
  )
  const sepiaVal = useMemo(() => {
    const t = clamp(mergedEdits.temperature, 0, 100)
    const warm = Math.max(0, t - 50) / 50
    return warm * 0.25
  }, [mergedEdits.temperature])

  const imgStyle = useMemo<React.CSSProperties>(() => {
    return {
      transformOrigin: "center",
      transform: `scale(${zoomScale}) rotate(${rotateDeg}deg) scale(1.02)`,
      filter: `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal}) sepia(${sepiaVal}) hue-rotate(${hueRotateDeg}deg)`,
      transition: "transform 120ms linear, filter 120ms linear",
      willChange: "transform, filter",
    }
  }, [zoomScale, rotateDeg, brightnessVal, contrastVal, saturateVal, sepiaVal, hueRotateDeg])

  const v = VARIANT_STYLES[variant]

  const popoverAnchorClass = "left-[-16px] top-[-15px]"
  const imagePosClass = "absolute left-[15px] top-[15px]"
  const controlsPosClass = `absolute ${v.controls.xFromLeft} top-[15px]`

  const onReset = () => {
    onChangeEdits?.({ ...DEFAULT_EDITS })
  }

  return (
    <div
      ref={popoverRef}
      className={`
        absolute
        ${popoverAnchorClass}
        ${v.popover.w} ${v.popover.h}
        rounded-[20px]
        bg-[rgba(255,255,255,0.9)]
        shadow-[4px_4px_15px_rgba(0,0,0,0.05)]
        backdrop-blur-[5px]
        z-[50]
      `}
      style={{
        // translate3d keeps it smoother + avoids some reflow jank
        transform: shiftX ? `translate3d(${shiftX}px, 0, 0)` : undefined,
      }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Edit image"
    >
      {/* Preview area */}
      <div
        className={`
          ${imagePosClass}
          ${v.image.w} ${v.image.h}
          relative
          rounded-[15px]
          overflow-hidden
          bg-[rgba(165,165,165,0.068)]
          backdrop-blur-[7.58px]
        `}
        style={{
          boxShadow: [
            "0 0 0 1.25px rgba(255,255,255,0.95)",
            "0 0 18px rgba(255,255,255,0.55)",
            "0 0 40px rgba(255,255,255,0.25)",
            "2px 4px 25px rgba(165, 165, 165, 0.10)",
            "inset 0 0 0 2px rgba(255,255,255,0.88)",
            "inset 2.14645px 2.00046px 9.24px rgba(165,165,165,0.126)",
            "inset 1.21725px 1.13446px 4.62px rgba(165,165,165,0.126)",
          ].join(", "),
        }}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={imgStyle}
            draggable={false}
          />
        ) : null}

        {/* Editable overlay */}
        <div className="absolute left-0 right-0 bottom-0 z-[2]">
          <div
            className="absolute left-[-2px] right-[-2px] bottom-[-2px]"
            style={{
              height: 76,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 70%, rgba(255,255,255,1) 100%)",
            }}
          />

          <div
            className="absolute left-0 right-0 bottom-0"
            style={{
              height: 72,
              borderBottomLeftRadius: 15,
              borderBottomRightRadius: 15,
              boxShadow: "inset 0 -2px 0 rgba(255,255,255,0.88)",
            }}
          />

          <div className="relative h-[70px] px-[15px] py-[15px] flex flex-col justify-end items-start">
            <input
              value={titleText}
              onChange={(e) => onChangeMeta?.({ title: e.target.value, description: descriptionText })}
              className="w-full bg-transparent outline-none font-inter font-normal text-[17px] leading-[140%] text-[#262626]"
            />
            <input
              value={descriptionText}
              onChange={(e) => onChangeMeta?.({ title: titleText, description: e.target.value })}
              className="w-full bg-transparent outline-none font-inter font-normal text-[15px] leading-[150%] text-[#262626]"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`${controlsPosClass} w-[181px] ${v.controls.h} flex flex-col justify-between items-start`}>
        <div className="w-[181px] h-[25px] flex flex-row items-start gap-[10px] relative">
          <p className="m-0 w-[155px] h-[25px] font-inter font-normal text-[12px] leading-[130%] text-[#A5A5A5]">
            {title}
          </p>

          <button
            type="button"
            aria-label="Close"
            className="w-[16px] h-[16px] flex items-center justify-center cursor-pointer"
            onClick={onClose}
          >
            <span className="inline-flex scale-[1.5] origin-center">
              <DeleteIcon />
            </span>
          </button>
        </div>

        <div className="w-[181px] h-[186px] flex flex-col items-start gap-[18px]">
          <SliderRow
            icon={<ArrowRotateIcon />}
            value={mergedEdits.rotate}
            onChange={(v2) => setEdit({ rotate: v2 })}
            ariaLabel="Rotate"
            showFill
            fillMode="center"
          />

          <SliderRow
            icon={<ZoomInIcon />}
            value={mergedEdits.zoom}
            onChange={(v2) => setEdit({ zoom: v2 })}
            ariaLabel="Zoom"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<SunIcon />}
            value={mergedEdits.brightness}
            onChange={(v2) => setEdit({ brightness: v2 })}
            ariaLabel="Brightness"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<CircleHalfIcon />}
            value={mergedEdits.contrast}
            onChange={(v2) => setEdit({ contrast: v2 })}
            ariaLabel="Contrast"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<PaletteIcon size={16} className="block" />}
            value={mergedEdits.saturation}
            onChange={(v2) => setEdit({ saturation: v2 })}
            ariaLabel="Saturation"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<ThermometerIcon />}
            value={mergedEdits.temperature}
            onChange={(v2) => setEdit({ temperature: v2 })}
            ariaLabel="Temperature"
            showFill
            fillMode="start"
          />
        </div>

        <div className="w-[181px] h-[16px] flex flex-row justify-between items-center">
          <div className="w-[47px] h-[16px] flex flex-row justify-between items-center gap-[15px]">
            <button type="button" aria-label="Images" className="w-[16px] h-[16px] text-[#262626] cursor-pointer">
              <ImagesIcon />
            </button>

            <button type="button" aria-label="Magic wand" className="w-[16px] h-[16px] text-[#262626] cursor-pointer">
              <WandIcon />
            </button>
          </div>

          <button type="button" aria-label="Revert" className="w-[16px] h-[16px] text-[#262626] cursor-pointer" onClick={onReset}>
            <RevertIcon />
          </button>
        </div>
      </div>
    </div>
  )
}