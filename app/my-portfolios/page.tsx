"use client"

import { useEffect, useMemo, useState } from "react"

import Navbar from "@/components/Navbar"
import DashboardProfileHeader from "@/components/my-portfolios/dashboard/DashboardProfileHeader"
import DashPortfolioEmpty from "@/components/my-portfolios/dashboard/DashPortfolioEmpty"
import DashPortfolioGrid, {
  type DashboardKonfolio,
} from "@/components/my-portfolios/dashboard/DashPortfolioGrid"
import CreateKonfolioPopover from "@/components/my-portfolios/dashboard/CreateKonfolioPopover"
import PortfolioNameCard from "@/components/my-portfolios/dashboard/PortfolioNameCard"

import { supabase } from "@/lib/supabase/browser"

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

  useEffect(() => {
    let mounted = true

    async function loadBusinessName() {
      const sessionRes = await supabase.auth.getSession()
      const user = sessionRes.data.session?.user
      if (!mounted) return
      if (!user) return

      const profileRes = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return

      const bn = String(profileRes.data?.business_name ?? "").trim()
      setBusinessName(bn || "Business Name")
    }

    async function loadKonfolios() {
      setLoading(true)

      const sessionRes = await supabase.auth.getSession()
      const user = sessionRes.data.session?.user
      if (!mounted) return

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

      if (!mounted) return

      const userBusinessName = String(profileRes.data?.business_name ?? "").trim() || "Business Name"

      const res = await supabase
        .from("konfolios")
        .select(
          "id, user_id, portfolio_name, portfolio_slug, status, thumbnail_url, updated_at, published_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (!mounted) return

      if (res.error) {
        console.error("loadKonfolios error:", res.error)
        setItems([])
        setLoading(false)
        return
      }

      const rows = (res.data ?? []) as KonfolioRow[]

      const mapped: DashboardKonfolio[] = rows.map((r) => ({
        id: r.id,
        portfolioName: String(r.portfolio_name ?? "Untitled"),
        portfolioSlug: String(r.portfolio_slug ?? r.id),
        businessName: userBusinessName,
        status: r.status === "published" ? "published" : "draft",
        thumbnailUrl: r.thumbnail_url,
        updatedAt: r.updated_at,
        exploreEnabled: true,
        views: 0,
        uniqueViewers: 0,
        linkClicks: 0,
      }))

      setItems(mapped)
      setLoading(false)
    }

    loadBusinessName()
    loadKonfolios()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadBusinessName()
      loadKonfolios()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const hasPublished = useMemo(
    () => items.some((k) => k.status === "published"),
    [items]
  )

  const businessSlug = useMemo(() => slugify(businessName), [businessName])

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

      <section className="w-full flex justify-center px-6">
        <div className="w-full max-w-[1212px] py-[60px]">
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
            />
          ) : (
            <DashPortfolioEmpty onClick={openCreateFlow} />
          )}
        </div>
      </section>

      <PortfolioNameCard
        isOpen={nameCardOpen}
        businessSlug={businessSlug}
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
    </main>
  )
}