"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import ExplorePortfolioCard from "@/components/explore/ExplorePortfolioCard"
import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon"

type Item = {
  id: number
  businessName: string
  creatorName: string
  previewImageUrl: string
  avatarUrl?: string
  labels?: string[]
}

const PAGE_SIZE = 12

export default function ExploreGrid() {
  const pathname = usePathname()

  // ---- Test data (make > 12) ----
  const allItems: Item[] = useMemo(() => {
    const base: Item[] = [
      {
        id: 0,
        businessName: "Califlair",
        creatorName: "Konfolio",
        previewImageUrl: "/images/califlair_home.png",
        avatarUrl: "/images/konfolio_placeholder.png",
        labels: ["Share Table", "Other Collabs"],
      },
      {
        id: 1,
        businessName: "Say0ranArts",
        creatorName: "Konfolio",
        previewImageUrl: "/images/sayoran_home.png",
        avatarUrl: "/images/konfolio_placeholder.png",
        labels: ["Stamp Rally"],
      },
      {
        id: 2,
        businessName: "Penelopeloveprints",
        creatorName: "Konfolio",
        previewImageUrl: "/images/penelope_home.png",
        avatarUrl: "/images/konfolio_placeholder.png",
        labels: ["Other Collabs"],
      },
      {
        id: 3,
        businessName: "LINVANIIN",
        creatorName: "Konfolio",
        previewImageUrl: "/images/linvaniin_home.png",
        avatarUrl: "/images/konfolio_placeholder.png",
        labels: ["Stamp Rally"],
      },
    ]

    const filler: Item[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i + 4,
      businessName: `Califlair ${i + 1}`,
      creatorName: "Konfolio",
      previewImageUrl: "/images/califlair_home.png",
      avatarUrl: "/images/konfolio_placeholder.png",
      labels: ["Other Collabs"],
    }))

    return [...base, ...filler] // 28 total
  }, [])

  // ---- paging state ----
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Reset when you come back to /explore
  useEffect(() => {
    if (pathname === "/explore") {
      setVisibleCount(PAGE_SIZE)
    }
  }, [pathname])

  const visibleItems = allItems.slice(0, visibleCount)
  const hasMore = visibleCount < allItems.length

  // ---- load control ----
  const isLoadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        if (isLoadingRef.current) return

        isLoadingRef.current = true

        // small delay so it doesn't feel instant
        window.setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allItems.length))
          isLoadingRef.current = false
        }, 650)
      },
      {
        root: null,
        // IMPORTANT: no early preload
        rootMargin: "0px",
        // Require it to actually be in view
        threshold: 0.8,
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [allItems.length, hasMore])

  // show dots only if:
  // - there are more results
  // - AND we've filled the first page (12)
  const showDots = hasMore && visibleItems.length >= PAGE_SIZE

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1212px] flex flex-col">
        {/* Grid */}
        <div
          className="
            grid
            gap-[15px]
            justify-items-center
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {visibleItems.map((item) => (
            <ExplorePortfolioCard
              key={item.id}
              businessName={item.businessName}
              creatorName={item.creatorName}
              previewImageUrl={item.previewImageUrl}
              avatarUrl={item.avatarUrl}
              labels={item.labels}
              className="w-[390px] h-[320px]"
            />
          ))}
        </div>

        {/* Dots */}
        {showDots && (
          <div className="w-full flex justify-center pt-[36px] pb-[12px]">
            <div
              className="
                w-[32px] h-[32px]
                grid place-items-center
                select-none pointer-events-none
                text-[#A5A5A5]
              "
              aria-hidden="true"
            >
              <div className="rotate-90 scale-[1.6]">
                <ThreeDotsIcon />
              </div>
            </div>
          </div>
        )}

        {/* Short scroll buffer before load */}
        {showDots && <div className="h-[48px]" />}

        {/* Sentinel */}
        {hasMore && <div ref={sentinelRef} className="h-[18px]" />}

        {/* Bottom breathing room  */}
        <div className="h-[36px]" />

      </div>
    </div>
  )
}
