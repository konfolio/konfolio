"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  value: number // 0..100
  onChange: (next: number) => void
  className?: string

  /** Show the gray fill bar */
  showFill?: boolean

  /** Show tick marks at 25/50/75 */
  showTicks?: boolean

  /** Accessible label for screen readers */
  ariaLabel: string

  /**
   * start  = fill from left edge (default)
   * center = fill from middle (50) outward (for rotate-style sliders)
   */
  fillMode?: "start" | "center"
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function SliderField({
  value,
  onChange,
  className = "",
  showFill = false,
  showTicks = true,
  ariaLabel,
  fillMode = "start",
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const pct = useMemo(() => clamp(value, 0, 100), [value])

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)
    const next = (x / rect.width) * 100
    onChange(Math.round(next))
  }

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: MouseEvent) => setFromClientX(e.clientX)
    const onUp = () => setDragging(false)

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [dragging])

  useEffect(() => {
    if (!dragging) return

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      setFromClientX(t.clientX)
    }
    const onTouchEnd = () => setDragging(false)

    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd)

    return () => {
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [dragging])

  // ----- Fill geometry -----
  // start:  fill from 0% -> pct
  // center: fill from 50% outward to pct (left or right)
  const fillStyle = useMemo<React.CSSProperties>(() => {
    if (!showFill) return {}

    if (fillMode === "start") {
      return { left: 0, width: `${pct}%` }
    }

    // center mode
    const MID = 50

    if (pct === MID) return { left: "50%", width: "0%" }

    if (pct > MID) {
      return { left: "50%", width: `${pct - MID}%` }
    }

    // pct < MID -> fill to the LEFT, ending at 50%
    return { left: `${pct}%`, width: `${MID - pct}%` }
  }, [fillMode, pct, showFill])

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      tabIndex={0}
      className={[
        "relative w-[149px] h-[6px] rounded-[100px] bg-[#F7F7F7] select-none",
        "outline-none",
        className,
      ].join(" ")}
      onMouseDown={(e) => {
        e.preventDefault()
        setFromClientX(e.clientX)
        setDragging(true)
      }}
      onTouchStart={(e) => {
        const t = e.touches[0]
        if (!t) return
        setFromClientX(t.clientX)
        setDragging(true)
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onChange(clamp(pct - 1, 0, 100))
        if (e.key === "ArrowRight") onChange(clamp(pct + 1, 0, 100))
        if (e.key === "Home") onChange(0)
        if (e.key === "End") onChange(100)
      }}
    >
      {/* Fill (optional) */}
      {showFill && (
        <div
          className="absolute top-0 h-[6px] rounded-[100px] bg-[#A5A5A5]"
          style={fillStyle}
        />
      )}

      {/* Tick marks */}
      {showTicks && (
        <>
          <div className="absolute top-[1px] left-1/4 w-[4px] h-0 border-t border-[#262626]/30 rotate-90" />
          <div className="absolute top-[1px] left-1/2 w-[4px] h-0 border-t border-[#262626]/30 rotate-90" />
          <div className="absolute top-[1px] left-3/4 w-[4px] h-0 border-t border-[#262626]/30 rotate-90" />
        </>
      )}

      {/* Handle */}
      <div
        className="
          absolute top-[-3px]
          w-[12px] h-[12px]
          rounded-full
          bg-[#A5A5A5]
          border-[3.33333px] border-white
          shadow-[2.66667px_2.66667px_10px_rgba(0,0,0,0.1)]
        "
        style={{
          left: `calc(${pct}% - 6px)`,
        }}
      />
    </div>
  )
}
