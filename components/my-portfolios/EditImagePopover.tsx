"use client"

import { useMemo, useRef, useState } from "react"
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

type Variant = "square" | "portrait"

type Props = {
  title?: string
  imageSrc?: string
  onClose: () => void
  /**
   * right = image on left, sliders on right (default)
   * left  = sliders on left, image on right (for right-most column cells)
   */
  placement?: "right" | "left"
  /**
   * square = 284x284 preview, 515x314 popover (default)
   * portrait = 274x345 preview, 505x375 popover (Figma)
   */
  variant?: Variant
}

type SliderRowProps = {
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  ariaLabel: string
  showFill?: boolean
  fillMode?: "start" | "center"
}

function SliderRow({
  icon,
  value,
  onChange,
  ariaLabel,
  showFill = false,
  fillMode = "start",
}: SliderRowProps) {
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
    // Matches your Figma styling
    popover: { w: "w-[505px]", h: "h-[375px]" },
    image: { w: "w-[274px]", h: "h-[345px]" },
    controls: { xFromLeft: "left-[309px]", h: "h-[345px]" },
  },
}

export default function EditImagePopover({
  title = "Recommended - Most Recent Work",
  imageSrc,
  onClose,
  placement = "right",
  variant = "square",
}: Props) {
  const popoverRef = useRef<HTMLDivElement | null>(null)
  useClickOutside(popoverRef, onClose, { enabled: true, closeOnEsc: true })

  // --- Slider UI state (0..100) ---
  const [rotate, setRotate] = useState(50) // neutral at 50
  const [zoom, setZoom] = useState(0) // starts at left
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)
  const [saturation, setSaturation] = useState(50)
  const [temperature, setTemperature] = useState(50)

  // --- Map sliders -> CSS ---
  const rotateDeg = useMemo(() => {
    const t = clamp(rotate, 0, 100)
    return ((t - 50) / 50) * 180
  }, [rotate])

  const zoomScale = useMemo(() => {
    const t = clamp(zoom, 0, 100)
    return 1 + (t / 100) * 1.0
  }, [zoom])

  const brightnessVal = useMemo(() => {
    const t = clamp(brightness, 0, 100)
    return 0.5 + (t / 100) * 1.0
  }, [brightness])

  const contrastVal = useMemo(() => {
    const t = clamp(contrast, 0, 100)
    return 0.5 + (t / 100) * 1.0
  }, [contrast])

  const saturateVal = useMemo(() => {
    const t = clamp(saturation, 0, 100)
    return (t / 50) * 1.0 // 0->0, 50->1, 100->2
  }, [saturation])

  const hueRotateDeg = useMemo(() => {
    const t = clamp(temperature, 0, 100)
    return ((t - 50) / 50) * 30
  }, [temperature])

  const sepiaVal = useMemo(() => {
    const t = clamp(temperature, 0, 100)
    const warm = Math.max(0, t - 50) / 50
    return warm * 0.25
  }, [temperature])

  const imgStyle = useMemo<React.CSSProperties>(() => {
    return {
      transformOrigin: "center",
      transform: `scale(${zoomScale}) rotate(${rotateDeg}deg)`,
      filter: `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal}) sepia(${sepiaVal}) hue-rotate(${hueRotateDeg}deg)`,
      transition: "transform 120ms linear, filter 120ms linear",
      willChange: "transform, filter",
    }
  }, [zoomScale, rotateDeg, brightnessVal, contrastVal, saturateVal, sepiaVal, hueRotateDeg])

  const preview = useMemo(() => {
    if (!imageSrc) return null
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={imgStyle}
        draggable={false}
      />
    )
  }, [imageSrc, imgStyle])

  const isFlipped = placement === "left"
  const v = VARIANT_STYLES[variant]

  // anchor stays the same between variants (matches both of your Figma: left -16, top -15)
  const popoverAnchorClass = isFlipped ? "right-[-16px] top-[-15px]" : "left-[-16px] top-[-15px]"
  const imagePosClass = isFlipped ? "absolute right-[15px] top-[15px]" : "absolute left-[15px] top-[15px]"

  // controls: when flipped, it’s always left:15; otherwise uses variant x
  const controlsPosClass = isFlipped ? "absolute left-[15px] top-[15px]" : `absolute ${v.controls.xFromLeft} top-[15px]`

  const onReset = () => {
    setRotate(50)
    setZoom(0)
    setBrightness(50)
    setContrast(50)
    setSaturation(50)
    setTemperature(50)
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
        z-[20]
      `}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Edit image"
    >
      {/* Image preview (square or portrait) */}
      <div
        className={`
          ${imagePosClass}
          ${v.image.w} ${v.image.h}
          rounded-[15px]
          overflow-hidden
          bg-[rgba(165,165,165,0.068)]
          shadow-[2px_4px_25px_rgba(165,165,165,0.1),
                  inset_2.14645px_2.00046px_9.24px_rgba(255,255,255,0.126),
                  inset_1.21725px_1.13446px_4.62px_rgba(255,255,255,0.126)]
          backdrop-blur-[7.58px]
        `}
      >
        {preview}
      </div>

      {/* Interaction field */}
      <div className={`${controlsPosClass} w-[181px] ${v.controls.h} flex flex-col justify-between items-start`}>
        {/* Text + Close */}
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

        {/* Editing Field */}
        <div className="w-[181px] h-[186px] flex flex-col items-start gap-[18px]">
          <SliderRow
            icon={<ArrowRotateIcon />}
            value={rotate}
            onChange={setRotate}
            ariaLabel="Rotate"
            showFill
            fillMode="center"
          />

          <SliderRow
            icon={<ZoomInIcon />}
            value={zoom}
            onChange={setZoom}
            ariaLabel="Zoom"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<SunIcon />}
            value={brightness}
            onChange={setBrightness}
            ariaLabel="Brightness"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<CircleHalfIcon />}
            value={contrast}
            onChange={setContrast}
            ariaLabel="Contrast"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<PaletteIcon size={16} className="block" />}
            value={saturation}
            onChange={setSaturation}
            ariaLabel="Saturation"
            showFill
            fillMode="start"
          />

          <SliderRow
            icon={<ThermometerIcon />}
            value={temperature}
            onChange={setTemperature}
            ariaLabel="Temperature"
            showFill
            fillMode="start"
          />
        </div>

        {/* Aside */}
        <div className="w-[181px] h-[16px] flex flex-row justify-between items-center">
          <div className="w-[47px] h-[16px] flex flex-row justify-between items-center gap-[15px]">
            <button
              type="button"
              aria-label="Images"
              className="w-[16px] h-[16px] text-[#262626] cursor-pointer"
            >
              <ImagesIcon />
            </button>

            <button
              type="button"
              aria-label="Magic wand"
              className="w-[16px] h-[16px] text-[#262626] cursor-pointer"
            >
              <WandIcon />
            </button>
          </div>

          <button
            type="button"
            aria-label="Revert"
            className="w-[16px] h-[16px] text-[#262626] cursor-pointer"
            onClick={onReset}
          >
            <RevertIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
