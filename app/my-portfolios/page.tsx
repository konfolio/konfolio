"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import DashboardProfileHeader from "@/components/my-portfolios/dashboard/DashboardProfileHeader"
import DashPortfolioEmpty from "@/components/my-portfolios/dashboard/DashPortfolioEmpty"
import DashPortfolioGrid, {
  type DashboardKonfolio,
} from "@/components/my-portfolios/dashboard/DashPortfolioGrid"
import CreateKonfolioPopover from "@/components/my-portfolios/dashboard/CreateKonfolioPopover"
import PortfolioNameCard from "@/components/my-portfolios/dashboard/PortfolioNameCard"

import { supabase } from "@/lib/supabase/browser"
import { exportFromImageUrl, type KonfolioExportType } from "@/lib/konfolio/exportFromImage"

type TemplateType = "square" | "portrait"

function slugify(input: string) {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

type KonfolioRow = {
  id: string
  user_id: string
  portfolio_name: string | null
  portfolio_slug: string | null
  status: "draft" | "published" | null
  thumbnail_url: string | null
  updated_at: string | null
  published_at: string | null
  explore_enabled: boolean | null
}

export default function MyPortfoliosPage() {
  const [nameCardOpen, setNameCardOpen] = useState(false)
  const [createPopoverOpen, setCreatePopoverOpen] = useState(false)
  const [pendingPortfolioName, setPendingPortfolioName] = useState("")
  const [businessName, setBusinessName] = useState("Business Name")

  const [items, setItems] = useState<DashboardKonfolio[]>([])
  const [loading, setLoading] = useState(true)

  const [publishedCount, setPublishedCount] = useState(0)

  useEffect(() => {
    setPublishedCount(items.filter((k) => k.status === "published").length)
  }, [items])

  const loadBusinessName = useCallback(async () => {
    const sessionRes = await supabase.auth.getSession()
    const user = sessionRes.data.session?.user
    if (!user) return

    const profileRes = await supabase
      .from("profiles")
      .select("business_name")
      .eq("id", user.id)
      .maybeSingle()

    const bn = String(profileRes.data?.business_name ?? "").trim()
    setBusinessName(bn || "Business Name")
  }, [])

  const loadKonfolios = useCallback(async () => {
    setLoading(true)

    const sessionRes = await supabase.auth.getSession()
    const user = sessionRes.data.session?.user

    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    const profileRes = await supabase
      .from("profiles")
      .select("business_name")
      .eq("id", user.id)
      .maybeSingle()

    const userBusinessName =
      String(profileRes.data?.business_name ?? "").trim() || "Business Name"

    const res = await supabase
      .from("konfolios")
      .select(
        "id, user_id, portfolio_name, portfolio_slug, status, thumbnail_url, updated_at, published_at, explore_enabled"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (res.error) {
      console.error("loadKonfolios error:", res.error)
      setItems([])
      setLoading(false)
      return
    }

    const rows = (res.data ?? []) as KonfolioRow[]

    const mapped: DashboardKonfolio[] = rows.map((r) => {
      const bust = r.updated_at || r.published_at || ""

      return {
        id: r.id,
        portfolioName: String(r.portfolio_name ?? "Untitled"),
        portfolioSlug: String(r.portfolio_slug ?? r.id),
        businessName: userBusinessName,
        status: r.status === "published" ? "published" : "draft",
        thumbnailUrl: r.thumbnail_url
          ? `${r.thumbnail_url}?t=${encodeURIComponent(bust)}`
          : null,
        updatedAt: r.updated_at,
        exploreEnabled: r.explore_enabled ?? false,
        views: 0,
        uniqueViewers: 0,
        linkClicks: 0,
      }
    })

    setItems(mapped)
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!mounted) return
      await loadBusinessName()
      if (!mounted) return
      await loadKonfolios()
    }

    void init()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void loadBusinessName()
      void loadKonfolios()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadBusinessName, loadKonfolios])

  useEffect(() => {
    function handleFocus() {
      void loadBusinessName()
      void loadKonfolios()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [loadBusinessName, loadKonfolios])

  const hasPublished = useMemo(
    () => items.some((k) => k.status === "published"),
    [items]
  )

  const businessSlug = useMemo(() => slugify(businessName), [businessName])

  const handleExportPick = useCallback(
    async (item: DashboardKonfolio, type: KonfolioExportType) => {
      if (!item.thumbnailUrl) {
        alert("No thumbnail available for export yet.")
        return
      }

      try {
        await exportFromImageUrl({
          imageUrl: item.thumbnailUrl,
          format: type,
          portfolioName: item.portfolioName,
        })
      } catch (error) {
        console.error("Export failed:", error)
        alert("Export failed. Please try again.")
      }
    },
    []
  )

  function openCreateFlow() {
    setPendingPortfolioName("")
    setNameCardOpen(true)
  }

  function closeNameCard() {
    setNameCardOpen(false)
    setPendingPortfolioName("")
  }

  function closeTemplatePopover() {
    setCreatePopoverOpen(false)
    setPendingPortfolioName("")
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      <DashboardProfileHeader
        editHref="/profile"
        createHref="/create"
        onClickCreate={openCreateFlow}
        konfolioCount={publishedCount}
      />

      <section className="flex w-full justify-center px-4 sm:px-6">
        <div className="w-full max-w-[1212px] py-[35px] sm:py-[60px]">
          {loading ? null : hasPublished ? (
            <DashPortfolioGrid
              items={items}
              urlBase=""
              onPublishedCountChange={setPublishedCount}
              onEdit={(id) => {
                window.location.href = `/my-portfolios/${id}/edit`
              }}
              onMore={(id) => {
                console.log("more", id)
              }}
              onCopyUrl={async (url) => {
                const fullUrl =
                  typeof window !== "undefined" && url.startsWith("/")
                    ? `${window.location.origin}${url}`
                    : url

                try {
                  await navigator.clipboard.writeText(fullUrl)
                } catch {
                  // intentionally ignore
                }
              }}
              onExport={(id, type) => {
                const item = items.find((x) => x.id === id)
                if (!item) return
                void handleExportPick(item, type)
              }}
            />
          ) : (
            <DashPortfolioEmpty onClick={openCreateFlow} />
          )}
        </div>
      </section>

      <PortfolioNameCard
        isOpen={nameCardOpen}
        businessSlug={businessSlug}
        existingNames={items.map((item) => item.portfolioName)}
        onClose={closeNameCard}
        onContinue={(name) => {
          setPendingPortfolioName(name)
          setNameCardOpen(false)
          setCreatePopoverOpen(true)
        }}
      />

      <CreateKonfolioPopover
        open={createPopoverOpen}
        onClose={closeTemplatePopover}
        portfolioName={pendingPortfolioName}
        onPickTemplate={(_t: TemplateType) => {
          setCreatePopoverOpen(false)
        }}
      />
      <Footer />
    </main>
  )
}