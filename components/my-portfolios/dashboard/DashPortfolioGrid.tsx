"use client"

import * as React from "react"
import DashPortfolio from "@/components/my-portfolios/dashboard/DashPortfolio"

import { supabase } from "@/lib/supabase/browser"

type KonfolioStatus = "draft" | "published"
type ExportType = "pdf" | "png" | "jpeg"

export type DashboardKonfolio = {
  id: string
  portfolioName: string
  portfolioSlug: string
  businessName: string
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

  onExport?: (id: string, type: ExportType) => void

  urlBase?: string

  onPublishedCountChange?: (count: number) => void
}

function formatDateLabel(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function buildPublicUrl(urlBase: string, businessName: string, portfolioSlug: string) {
  const base = urlBase.replace(/\/+$/, "")
  const business = slugify(businessName)
  const portfolio = slugify(portfolioSlug)
  const path = `/${business}/${portfolio}`

  if (!base) return path
  return `${base}${path}`
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function deleteKonfolioRow(konfolioId: string): Promise<void> {
  const token = await getAccessToken()
  if (!token) throw new Error("Not signed in")

  const res = await fetch(`/api/konfolios/${konfolioId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Delete failed (${res.status})`)
  }
}

export default function DashPortfolioGrid({
  items,
  className,
  onView,
  onEdit,
  onMore,
  onCopyUrl,
  onExport,
  urlBase = "",
  onPublishedCountChange,
}: Props) {
  const [localItems, setLocalItems] = React.useState<DashboardKonfolio[]>(items)

  React.useEffect(() => {
    setLocalItems(items)
  }, [items])

  const published = React.useMemo(
    () =>
      localItems
        .filter((k) => k.status === "published")
        .sort((a, b) => {
          const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
          return bt - at
        }),
    [localItems]
  )

  React.useEffect(() => {
    onPublishedCountChange?.(published.length)
  }, [published.length, onPublishedCountChange])

  const handleDelete = React.useCallback(
    async (id: string) => {
      setLocalItems((cur) => cur.filter((k) => k.id !== id))

      try {
        await deleteKonfolioRow(id)
      } catch (e) {
        setLocalItems(items)
        throw e
      }
    },
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
          const publicUrl = buildPublicUrl(urlBase, k.businessName, k.portfolioSlug)

          return (
            <DashPortfolio
              key={k.id}
              id={k.id}
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
              onExportPick={                
                onExport
                  ? (type) => {
                      onExport(k.id, type)
                    }
                  : undefined
              }
              onDelete={handleDelete}
            />
          )
        })}
      </div>
    </div>
  )
}