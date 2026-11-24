"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import SearchIcon from "@/components/icons/SearchIcon"
import FilterIcon from "@/components/icons/FilterIcon"

type FilterOption = {
  id: string
  label: string
}

type Props = {
  value?: string
  onChange?: (v: string) => void
  selectedFilters?: string[]
  onSelectedFiltersChange?: (ids: string[]) => void
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0.5 4.4375L3.5625 7.5L10.5625 0.5"
        stroke="#262626"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const DEFAULT_OPTIONS: FilterOption[] = [
  { id: "square", label: "Square Portfolios" },
  { id: "portrait", label: "Portrait Portfolios" },
  { id: "stamp", label: "Stamp Rally" },
  { id: "share", label: "Share Table" },
  { id: "other", label: "Other Collabs" },
]

export default function SearchBar({
  value = "",
  onChange,
  selectedFilters,
  onSelectedFiltersChange,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const options = useMemo(() => DEFAULT_OPTIONS, [])
  const [open, setOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [localSelected, setLocalSelected] = useState<string[]>(selectedFilters ?? [])

  const isControlled = selectedFilters !== undefined && onSelectedFiltersChange
  const selected = isControlled ? selectedFilters! : localSelected

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
  setLocalSelected(selectedFilters ?? [])
  }, [selectedFilters])

  useEffect(() => {
    setLocalValue(value)
  }, [value])
  function pushState(nextValue: string, nextSelected: string[]) {
  const params = new URLSearchParams(searchParams.toString())

  if (nextValue.trim()) params.set("q", nextValue.trim())
  else params.delete("q")

  if (nextSelected.length > 0) params.set("filters", nextSelected.join(","))
  else params.delete("filters")

  const queryString = params.toString()
  router.push(queryString ? `${pathname}?${queryString}` : pathname)
}
  function setSelected(next: string[]) {
  if (isControlled) onSelectedFiltersChange!(next)
  else setLocalSelected(next)

  pushState(value, next)
}

  function toggle(id: string) {
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    )
  }

  function pushSearch(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextValue.trim()) params.set("q", nextValue.trim())
    else params.delete("q")

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      pushSearch(localValue)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [localValue])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = wrapperRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="w-full flex justify-center" ref={wrapperRef}>
      <div className="relative w-full max-w-[1212px] h-[36px]">
        <div className="h-full flex items-center justify-center">
          <div
            className="
              w-[600px] h-[36px]
              bg-white
              rounded-[100px]
              shadow-[2px_4px_25px_rgba(165,165,165,0.1)]
              flex items-center
              px-[13px] py-[6px]
              gap-[10px]
            "
          >
            <input
              value={localValue}
              onChange={(e) => {
                setLocalValue(e.target.value)
                onChange?.(e.target.value)
              }}
              placeholder=""
              className="
                w-full
                bg-transparent
                outline-none
                text-[14px] leading-[140%]
                text-[#262626]
              "
            />

            <button
              type="button"
              onClick={() => pushSearch(localValue)}
              className="w-[24px] h-[24px] flex items-center justify-center"
              aria-label="Search"
            >
              <SearchIcon className="block" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Filter"
          aria-expanded={open}
          className="
            absolute right-0 top-0
            w-[36px] h-[36px]
            bg-white
            rounded-full
            grid place-items-center
          "
        >
          <FilterIcon className="block" />
        </button>

        {open && (
          <div
            className="
              absolute right-0 top-[44px]
              w-[188px] h-[160px]
              bg-white
              shadow-[2px_2px_10px_rgba(0,0,0,0.1)]
              rounded-[15px]
              p-[5px]
              flex flex-col
              z-50
            "
          >
            {options.map((opt) => {
              const checked = selected.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className="
                    w-full h-[30px]
                    rounded-[10px]
                    px-[10px]
                    flex items-center
                    hover:bg-[#F7F7F7]
                  "
                >
                  <div className="flex items-center gap-[10px] w-full">
                    <span
                      className="
                        w-[14px] h-[14px]
                        flex items-center justify-center
                        rounded-[3px]
                      "
                      aria-hidden="true"
                    >
                      {checked ? <CheckIcon /> : null}
                    </span>

                    <span className="text-[14px] leading-[140%] text-[#262626]">
                      {opt.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}