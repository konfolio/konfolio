"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import DashPortfolio, {
  type EditNameResult,
  type EditUrlResult,
} from "@/components/my-portfolios/dashboard/DashPortfolio"

import { supabase } from "@/lib/supabase/browser"
import { duplicateKonfolio } from "@/lib/duplicateKonfolio"
import { updateKonfolioName } from "@/lib/updateKonfolioName"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"

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

function buildPublicUrl(
  urlBase: string,
  businessName: string,
  portfolioSlug: string
) {
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

async function updateKonfolioSlug(
  konfolioId: string,
  nextSlug: string
): Promise<EditUrlResult> {
  const token = await getAccessToken()
  if (!token) {
    return {
      ok: false,
      reason: "error",
      message: "Not signed in",
    }
  }

  const res = await fetch(`/api/konfolios/${konfolioId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ portfolio_slug: nextSlug }),
  })

  if (res.ok) {
    return { ok: true }
  }

  let message = "Failed to update URL"

  try {
    const data = await res.json()
    message = data?.error || message
  } catch {
    const text = await res.text().catch(() => "")
    if (text) message = text
  }

  if (res.status === 409) {
    return {
      ok: false,
      reason: "duplicate",
      message,
    }
  }

  return {
    ok: false,
    reason: "error",
    message,
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
  const router = useRouter()
  const [localItems, setLocalItems] = React.useState<DashboardKonfolio[]>(items)
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null)

  const hasKonfolioHydrated = useKonfolioDraftStore((s) => s.hasHydrated)
  const forceKonfolioHydrate = useKonfolioDraftStore((s) => s.forceHydrate)
  const setDraft = useKonfolioDraftStore((s) => s.setDraft)

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

  const handleRename = React.useCallback(
    async (id: string, nextName: string): Promise<EditNameResult> => {
      const previous = localItems

      setLocalItems((cur) =>
        cur.map((k) =>
          k.id === id
            ? {
                ...k,
                portfolioName: nextName,
                updatedAt: new Date().toISOString(),
              }
            : k
        )
      )

      const result = await updateKonfolioName(id, nextName)

      if (!result.ok) {
        setLocalItems(previous)
        return result
      }

      return result
    },
    [localItems]
  )

  const handleEditUrl = React.useCallback(
    async (id: string, nextSlug: string): Promise<EditUrlResult> => {
      const previous = localItems

      setLocalItems((cur) =>
        cur.map((k) =>
          k.id === id
            ? {
                ...k,
                portfolioSlug: nextSlug,
                updatedAt: new Date().toISOString(),
              }
            : k
        )
      )

      const result = await updateKonfolioSlug(id, nextSlug)

      if (!result.ok) {
        setLocalItems(previous)
        return result
      }

      return result
    },
    [localItems]
  )

  const handleDuplicate = React.useCallback(
    async (id: string) => {
      if (duplicatingId === id) return

      try {
        setDuplicatingId(id)

        if (!hasKonfolioHydrated) {
          try {
            await forceKonfolioHydrate()
          } catch (e: any) {
            console.warn("[DashPortfolioGrid] forceHydrate failed:", e?.message ?? e)
          }
        }

        const { draft } = await duplicateKonfolio(id)

        setDraft(draft.id, draft)

        router.push(`/my-portfolios/${draft.id}/edit`)
        router.refresh()
      } catch (error) {
        console.error(error)
      } finally {
        setDuplicatingId(null)
      }
    },
    [duplicatingId, forceKonfolioHydrate, hasKonfolioHydrated, router, setDraft]
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
              portfolioSlug={k.portfolioSlug}
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
              onEditName={(nextName) => handleRename(k.id, nextName)}
              onEditUrl={(nextSlug) => handleEditUrl(k.id, nextSlug)}
              onDuplicate={() => handleDuplicate(k.id)}
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