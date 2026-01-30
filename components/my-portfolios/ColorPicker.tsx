// components/my-portfolios/ColorPicker.tsx
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import PlusIcon from "@/components/icons/PlusIcon"
import PopoverArrow from "@/components/icons/PopoverArrow"
import DeleteIcon from "@/components/icons/DeleteIcon"

type Props = {
  label?: string
  initialHex?: string
  onChange?: (hex: string) => void
  onRequestClose?: () => void
}

type HSV = { h: number; s: number; v: number } // h: 0..360, s/v: 0..1

const MAX_SWATCHES = 8

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function isValidHex(hex: string) {
  return /^#?[0-9a-fA-F]{6}$/.test(hex.trim())
}

function normalizeHex(hex: string) {
  const raw = hex.trim().replace("#", "")
  return ("#" + raw.toUpperCase()).slice(0, 7)
}

// --- color conversion helpers (no deps) ---
function hsvToRgb({ h, s, v }: HSV) {
  const hh = ((h % 360) + 360) % 360
  const c = v * s
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = v - c

  let r = 0,
    g = 0,
    b = 0

  if (hh < 60) [r, g, b] = [c, x, 0]
  else if (hh < 120) [r, g, b] = [x, c, 0]
  else if (hh < 180) [r, g, b] = [0, c, x]
  else if (hh < 240) [r, g, b] = [0, x, c]
  else if (hh < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const to2 = (n: number) => n.toString(16).padStart(2, "0").toUpperCase()
  return `#${to2(clamp(Math.round(r), 0, 255))}${to2(clamp(Math.round(g), 0, 255))}${to2(
    clamp(Math.round(b), 0, 255)
  )}`
}

function hexToRgb(hex: string) {
  const raw = hex.replace("#", "")
  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  return { r, g, b }
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rr = r / 255,
    gg = g / 255,
    bb = b / 255
  const cmax = Math.max(rr, gg, bb)
  const cmin = Math.min(rr, gg, bb)
  const delta = cmax - cmin

  let h = 0
  if (delta !== 0) {
    if (cmax === rr) h = 60 * (((gg - bb) / delta) % 6)
    else if (cmax === gg) h = 60 * ((bb - rr) / delta + 2)
    else h = 60 * ((rr - gg) / delta + 4)
  }
  if (h < 0) h += 360

  const s = cmax === 0 ? 0 : delta / cmax
  const v = cmax

  return { h, s, v }
}

function hexToHsv(hex: string): HSV {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHsv(r, g, b)
}

function hsvToHex(hsv: HSV) {
  const { r, g, b } = hsvToRgb(hsv)
  return rgbToHex(r, g, b)
}

export default function ColorPicker({
  label = "Banner Color",
  initialHex = "#1708FF",
  onChange,
  onRequestClose,
}: Props) {
  const safeInitial = useMemo(() => (isValidHex(initialHex) ? normalizeHex(initialHex) : "#1708FF"), [initialHex])

  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(safeInitial))
  const [hexInput, setHexInput] = useState<string>(() => safeInitial)
  const [swatches, setSwatches] = useState<string[]>([]) // starts empty
  const [selectedSwatch, setSelectedSwatch] = useState<string | null>(null)

  const currentHex = useMemo(() => hsvToHex(hsv), [hsv])

  // --- prevent infinite loop when syncing from props ---
  const syncingRef = useRef(false)
  const lastInitialRef = useRef<string>(safeInitial)

  useEffect(() => {
    if (lastInitialRef.current === safeInitial) return
    lastInitialRef.current = safeInitial

    syncingRef.current = true
    setHsv(hexToHsv(safeInitial))
    setHexInput(safeInitial)
    setSelectedSwatch(null)
  }, [safeInitial])

  useEffect(() => {
    if (syncingRef.current) {
      syncingRef.current = false
      return
    }
    onChange?.(currentHex)
    setHexInput((prev) => (isValidHex(prev) ? currentHex : prev))
  }, [currentHex, onChange])

  // ESC closes
  useEffect(() => {
    if (!onRequestClose) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onRequestClose])

  const svRef = useRef<HTMLDivElement | null>(null)
  const hueRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef<null | "sv" | "hue">(null)

  const hueBaseHex = useMemo(() => hsvToHex({ h: hsv.h, s: 1, v: 1 }), [hsv.h])
  const hueCursor = useMemo(() => hsv.h / 360, [hsv.h])

  function setFromSVClientPoint(clientX: number, clientY: number) {
    const el = svRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    const x = clamp(clientX - rect.left, 0, rect.width)
    const y = clamp(clientY - rect.top, 0, rect.height)

    const s = rect.width === 0 ? 0 : x / rect.width
    const v = rect.height === 0 ? 0 : 1 - y / rect.height

    setSelectedSwatch(null)
    setHsv((prev) => ({ ...prev, s, v }))
  }

  function setFromHueClientPoint(clientX: number) {
    const el = hueRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    const x = clamp(clientX - rect.left, 0, rect.width)
    const t = rect.width === 0 ? 0 : x / rect.width
    const h = t * 360

    setSelectedSwatch(null)
    setHsv((prev) => ({ ...prev, h }))
  }

  function onPointerDownSV(e: React.PointerEvent) {
    dragging.current = "sv"
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setFromSVClientPoint(e.clientX, e.clientY)
  }
  function onPointerMoveSV(e: React.PointerEvent) {
    if (dragging.current !== "sv") return
    setFromSVClientPoint(e.clientX, e.clientY)
  }

  function onPointerDownHue(e: React.PointerEvent) {
    dragging.current = "hue"
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setFromHueClientPoint(e.clientX)
  }
  function onPointerMoveHue(e: React.PointerEvent) {
    if (dragging.current !== "hue") return
    setFromHueClientPoint(e.clientX)
  }

  function onPointerUp() {
    dragging.current = null
  }

  function commitHexInput(next: string) {
    if (!isValidHex(next)) return
    const normalized = normalizeHex(next)
    setSelectedSwatch(null)
    setHsv(hexToHsv(normalized))
  }

  function addSwatch() {
    if (swatches.length >= MAX_SWATCHES) return
    const hex = currentHex
    setSwatches((prev) => {
      if (prev.includes(hex)) return prev
      if (prev.length >= MAX_SWATCHES) return prev
      return [...prev, hex]
    })
    setSelectedSwatch(hex)
  }

  function pickSwatch(hex: string) {
    setSelectedSwatch(hex)
    setHsv(hexToHsv(hex))
  }

  function deleteSwatch(hex: string) {
    setSwatches((prev) => prev.filter((c) => c !== hex))
    setSelectedSwatch((prev) => (prev === hex ? null : prev))
  }

  const svLeft = `calc(${hsv.s * 100}% - 7px)`
  const svTop = `calc(${(1 - hsv.v) * 100}% - 7px)`

  const canAdd = swatches.length < MAX_SWATCHES

  return (
    <div className="cpPopover" onPointerUp={onPointerUp}>
      <div className="cpArrow" aria-hidden="true">
        <PopoverArrow className="cpArrowSvg" />
      </div>

      <div className="cpRoot">
        <div className="cpHeaderRow">
          <div className="cpLabel">{label}</div>

          <div className="cpHexPill">
            <div className="cpTinySwatch" style={{ background: currentHex }} />
            <input
              className="cpHexInput"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={() => commitHexInput(hexInput)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur()
              }}
              spellCheck={false}
              inputMode="text"
            />
          </div>
        </div>

        <div className="cpSVWrap">
          <div
            ref={svRef}
            className="cpSV"
            style={{ backgroundColor: hueBaseHex }}
            onPointerDown={onPointerDownSV}
            onPointerMove={onPointerMoveSV}
            role="slider"
            aria-label="Saturation and value"
          >
            <div className="cpSVWhite" />
            <div className="cpSVBlack" />

            <div className="cpSVCursor" style={{ left: svLeft, top: svTop }}>
              <div className="cpSVCursorRing" />
              <div className="cpSVCursorFill" style={{ background: currentHex }} />
            </div>
          </div>
        </div>

        <div className="cpHueRow">
          <div
            ref={hueRef}
            className="cpHueTrack"
            onPointerDown={onPointerDownHue}
            onPointerMove={onPointerMoveHue}
            role="slider"
            aria-label="Hue"
          >
            <div
              className="cpHueThumb"
              style={{
                left: `calc(${hueCursor * 100}% - 6px)`,
                background: currentHex,
              }}
            />
          </div>
        </div>

        {/* Top-left anchored swatches */}
        <div className="cpSwatches">
          {swatches.map((hex) => (
            <div key={hex} className="cpSwatchWrap">
              <button type="button" className="cpSwatchBtn" onClick={() => pickSwatch(hex)}>
                <span className="cpSwatch" style={{ background: hex }} />
                {selectedSwatch === hex && <span className="cpSwatchSelectedRing" />}
              </button>

              <button
                type="button"
                className="cpDeleteBtn"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSwatch(hex)
                }}
                aria-label={`Delete swatch ${hex}`}
              >
                <DeleteIcon className="cpDeleteIcon" />
              </button>
            </div>
          ))}

          {canAdd ? (
            <button type="button" className="cpAddBtn" onClick={addSwatch} aria-label="Add swatch">
              <PlusIcon />
            </button>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .cpPopover {
          position: relative;
          width: 276px;
        }

        .cpArrow {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          pointer-events: none;
          height: 8px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .cpArrowSvg {
          transform: scaleX(1.6);
          transform-origin: center bottom;
          display: block;
        }

        .cpRoot {
          position: relative;
          width: 276px;
          height: 546px;
          background: #ffffff;
          border-radius: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 0px 20px;
          gap: 15px;
          isolation: isolate;
          box-shadow: 5px 5px 25px rgba(0, 0, 0, 0.05);
        }

        .cpHeaderRow {
          width: 276px;
          height: 33px;
          padding: 0 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
        }

        .cpLabel {
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 140%;
          color: #262626;
          width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cpHexPill {
          display: flex;
          align-items: center;
          padding: 4px;
          gap: 10px;
          width: 120px;
          height: 33px;
          background: #f7f7f7;
          border-radius: 4px;
          box-sizing: border-box;
        }

        .cpTinySwatch {
          width: 25px;
          height: 25px;
          border-radius: 4px;
          flex: none;
        }

        .cpHexInput {
          width: 70px;
          border: none;
          outline: none;
          background: transparent;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 140%;
          color: #888888;
          padding: 0;
        }

        .cpSVWrap {
          width: 276px;
          height: 292px;
          position: relative;
          padding: 0 10px;
          box-sizing: border-box;
        }

        .cpSV {
          width: 256px;
          height: 292px;
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          touch-action: none;
          user-select: none;
        }

        .cpSVWhite {
          position: absolute;
          inset: 0;
          background: linear-gradient(270deg, rgba(255, 255, 255, 0) 0%, #ffffff 100%);
        }

        .cpSVBlack {
          position: absolute;
          inset: 0;
          background: linear-gradient(360deg, #000000 0%, rgba(0, 0, 0, 0) 100%);
        }

        .cpSVCursor {
          position: absolute;
          width: 14px;
          height: 14px;
        }

        .cpSVCursorRing {
          position: absolute;
          inset: 0;
          border: 4px solid #ffffff;
          border-radius: 999px;
          box-sizing: border-box;
          z-index: 1;
        }

        .cpSVCursorFill {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          z-index: 0;
        }

        .cpHueRow {
          width: 276px;
          height: 36px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .cpHueTrack {
          width: 256px;
          height: 16px;
          border-radius: 100px;
          position: relative;
          background: linear-gradient(
            270deg,
            #f00000 0%,
            #ff005e 4.69%,
            #fc0072 4.7%,
            #ea00fa 8.85%,
            #e000fb 8.86%,
            #9a00ff 13.02%,
            #3100ff 18.23%,
            #2d01ff 18.24%,
            #060cff 23.44%,
            #0431ff 23.45%,
            #007cff 28.13%,
            #008eff 33.33%,
            #228bde 38.54%,
            #00dbff 43.23%,
            #00f5ff 47.92%,
            #00ffb5 53.65%,
            #00ff68 58.33%,
            #00ff22 64.06%,
            #2aff00 69.27%,
            #acff00 73.96%,
            #f0f600 78.65%,
            #ffc300 83.33%,
            #ff8100 88.54%,
            #ff4f00 94.79%,
            #ff0000 100%
          );
          touch-action: none;
          user-select: none;
        }

        .cpHueThumb {
          box-sizing: border-box;
          position: absolute;
          top: calc(50% - 24px / 2);
          width: 12px;
          height: 24px;
          border: 3px solid #f7f7f7;
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
          border-radius: 8px;
        }

        /* Bigger gaps between swatches */
        .cpSwatches {
          width: 276px;
          height: 105px;
          padding: 0 10px;
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          align-content: flex-start;
          justify-content: flex-start;
          gap: 20px 22px; 
        }

        .cpSwatchWrap {
          width: 46px;
          height: 46px;
          position: relative;
        }

        .cpSwatchBtn {
          width: 46px;
          height: 46px;
          border: none;
          padding: 0;
          background: transparent;
          position: relative;
          cursor: pointer;
        }

        .cpSwatch {
          width: 46px;
          height: 46px;
          border-radius: 95.8333px;
          display: block;
        }

        .cpSwatchSelectedRing {
          position: absolute;
          left: 4.79px;
          top: 4.79px;
          width: 36.42px;
          height: 36.42px;
          border-radius: 999px;
          border: 4.79167px solid #ffffff;
          box-sizing: border-box;
          pointer-events: none;
        }

        .cpDeleteBtn {
          position: absolute;
          right: -0.25px;
          bottom: -0.25px;
          width: 17.25px;
          height: 17.25px;
          border-radius: 999px;
          background: #ff4603;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 150ms ease, transform 150ms ease;
        }

        .cpSwatchWrap:hover .cpDeleteBtn {
          opacity: 1;
          transform: scale(1);
        }

        .cpDeleteIcon {
          width: 13.42px;
          height: 13.42px;
        }

        .cpDeleteBtn :global(path),
        .cpDeleteBtn :global(line),
        .cpDeleteBtn :global(svg) {
          stroke: #ffffff !important;
          fill: none !important;
        }

        .cpAddBtn {
          width: 46px;
          height: 46px;
          border-radius: 95.8333px;
          background: #f7f7f7;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cpAddBtn :global(svg),
        .cpAddBtn :global(path),
        .cpAddBtn :global(line) {
          stroke: #a5a5a5 !important;
          fill: none !important;
        }
      `}</style>
    </div>
  )
}
