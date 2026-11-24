"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import ExplorePortfolioCard from "@/components/explore/ExplorePortfolioCard"
import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon"

type Item = {
  id: string
  businessName: string
  businessSlug?: string | null
  portfolioName: string
  portfolioSlug?: string | null
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
  businessSlug?: string | null
  portfolioName: string
  portfolioSlug?: string | null
  displayName: string
  locationText: string
  profileImageUrl: string
  collabs: string[]
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
      businessSlug: item.businessSlug,
      portfolioName: item.portfolioName,
      portfolioSlug: item.portfolioSlug,
      creatorName: item.displayName,
      previewImageUrl: item.thumbnailUrl,
      profileImageUrl: item.profileImageUrl,
      labels:
        (item.collabs ?? []).filter(
          (tag) => tag.toLowerCase() !== "not open for collabs"
        ),
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
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, allItems.length)
          )
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
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-[1212px] flex-col items-center">
        <div
          className="
            grid w-full
            grid-cols-1
            justify-items-center
            gap-[15px]
            min-[820px]:grid-cols-2
            min-[1240px]:grid-cols-3
          "
        >
          {visibleItems.map((item) => (
            <ExplorePortfolioCard
              key={item.id}
              portfolioId={item.id}
              businessName={item.businessName}
              businessSlug={item.businessSlug}
              portfolioName={item.portfolioName}
              portfolioSlug={item.portfolioSlug}
              creatorName={item.creatorName}
              previewImageUrl={item.previewImageUrl}
              avatarUrl={item.profileImageUrl}
              labels={item.labels}
              className="
                h-[320px]
                w-full
                max-w-[390px]
              "
            />
          ))}
        </div>

        {showDots && (
          <div className="flex w-full justify-center pb-[12px] pt-[36px]">
            <div
              className="
                grid h-[32px] w-[32px]
                place-items-center
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