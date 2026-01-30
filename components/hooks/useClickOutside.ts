"use client"

import { RefObject, useEffect } from "react"

type UseClickOutsideOptions = {
  enabled?: boolean
  closeOnEsc?: boolean
}

/**
 * Calls `onOutside` when user clicks/taps outside of any provided refs.
 * Optionally closes on ESC.
 */
export default function useClickOutside(
  refs: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  onOutside: () => void,
  options: UseClickOutsideOptions = {}
) {
  const { enabled = true, closeOnEsc = true } = options
  const refList = Array.isArray(refs) ? refs : [refs]

  useEffect(() => {
    if (!enabled) return

    const isInsideAny = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false
      return refList.some((r) => {
        const el = r.current
        return !!el && el.contains(target)
      })
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (isInsideAny(e.target)) return
      onOutside()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!closeOnEsc) return
      if (e.key === "Escape") onOutside()
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown, { passive: true })
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [enabled, closeOnEsc, onOutside, refList])
}
