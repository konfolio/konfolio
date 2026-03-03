// /components/my-portfolios/dashboard/DashPortfolioGrid.tsx
"use client"

import * as React from "react"
import DashPortfolio from "@/components/my-portfolios/dashboard/DashPortfolio"

type KonfolioStatus = "draft" | "published"

export type DashboardKonfolio = {
  id: string
  portfolioName: string
  portfolioSlug: string
  status: KonfolioStatus

  thumbnailUrl?: string | null

  views?: number | null
  uniqueViewers?: number | null
  linkClicks?: number | null

  exploreEnabled?: boolean | null

  updatedAt?: string | null
}

type Props = {
  items: DashboardKonfolio[]
  className?: string

  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onMore?: (id: string) => void

  onCopyUrl?: (url: string) => void

  urlBase?: string
  urlPrefix?: string
}

function formatDateLabel(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function buildPublicUrl(urlBase: string, urlPrefix: string, slug: string) {
  const base = urlBase.replace(/\/+$/, "")
  const prefix = urlPrefix ? `/${urlPrefix.replace(/^\/+|\/+$/g, "")}` : ""
  const path = `${prefix}/${slug}`.replace(/\/{2,}/g, "/")
  if (!base) return path
  return `${base}${path}`
}

export default function DashPortfolioGrid({
  items,
  className,
  onView,
  onEdit,
  onMore,
  onCopyUrl,
  urlBase = "",
  urlPrefix = "",
}: Props) {
  const published = React.useMemo(
    () =>
      items
        .filter((k) => k.status === "published")
        .sort((a, b) => {
          const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
          return bt - at
        }),
    [items]
  )

  if (published.length === 0) {
    return (
      <div className={className}>
        <div className="text-[#A5A5A5] text-[14px] leading-[130%]">
          No published Konfolios yet.
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-[20px]">
        {published.map((k) => {
          const publicUrl = buildPublicUrl(urlBase, urlPrefix, k.portfolioSlug)

          return (
            <DashPortfolio
              key={k.id}
              portfolioName={k.portfolioName}
              publicUrl={publicUrl}
              thumbnailUrl={k.thumbnailUrl ?? null}
              views={k.views ?? 0}
              viewers={k.uniqueViewers ?? 0}
              linkClicks={k.linkClicks ?? 0}
              exploreEnabled={Boolean(k.exploreEnabled)}
              lastUpdatedLabel={formatDateLabel(k.updatedAt)}
              onView={onView ? () => onView(k.id) : undefined}
              onEdit={onEdit ? () => onEdit(k.id) : undefined}
              onMore={onMore ? () => onMore(k.id) : undefined}
              onCopyUrl={onCopyUrl ? () => onCopyUrl(publicUrl) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}