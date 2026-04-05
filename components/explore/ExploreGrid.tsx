"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import ExplorePortfolioCard from "@/components/explore/ExplorePortfolioCard"
import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon"

type Item = {
  id: string
  businessName: string
  creatorName: string
  previewImageUrl: string
  profileImageUrl?: string
  labels?: string[]
}

type ExploreItem = {
  id: string
  template: "square" | "portrait"
  updated_at: string | null
  thumbnailUrl: string
  businessName: string
  displayName: string
  locationText: string
  profileImageUrl: string
  merchTags: string[]
}

type Props = {
  items: ExploreItem[]
}

const PAGE_SIZE = 12

export default function ExploreGrid({ items }: Props) {
  const pathname = usePathname()

  const allItems: Item[] = useMemo(() => {
    return items.map((item) => ({
      id: item.id,
      businessName: item.businessName,
      creatorName: item.displayName,
      previewImageUrl: item.thumbnailUrl,
      profileImageUrl: item.profileImageUrl,
      labels: item.merchTags ?? [],
    }))
  }, [items])

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (pathname === "/explore") {
      setVisibleCount(PAGE_SIZE)
    }
  }, [pathname])

  const visibleItems = allItems.slice(0, visibleCount)
  const hasMore = visibleCount < allItems.length

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

        window.setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allItems.length))
          isLoadingRef.current = false
        }, 650)
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.8,
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [allItems.length, hasMore])

  const showDots = hasMore && visibleItems.length >= PAGE_SIZE

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1212px] flex flex-col">
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
              portfolioId={item.id}
              businessName={item.businessName}
              creatorName={item.creatorName}
              previewImageUrl={item.previewImageUrl}
              avatarUrl={item.profileImageUrl}
              labels={item.labels}
              className="w-[390px] h-[320px]"
            />
          ))}
        </div>

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

        {showDots && <div className="h-[48px]" />}
        {hasMore && <div ref={sentinelRef} className="h-[18px]" />}
        <div className="h-[36px]" />
      </div>
    </div>
  )
}