"use client"

import { useEffect, useMemo, useState } from "react"

import Navbar from "@/components/Navbar"
import DashboardProfileHeader from "@/components/my-portfolios/dashboard/DashboardProfileHeader"
import DashPortfolioEmpty from "@/components/my-portfolios/dashboard/DashPortfolioEmpty"
import CreateKonfolioPopover from "@/components/my-portfolios/dashboard/CreateKonfolioPopover"
import PortfolioNameCard from "@/components/my-portfolios/dashboard/PortfolioNameCard"

import { supabase } from "@/lib/supabase/browser"

type TemplateType = "square" | "portrait"

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
}

export default function MyPortfoliosPage() {
  const [nameCardOpen, setNameCardOpen] = useState(false)
  const [createPopoverOpen, setCreatePopoverOpen] = useState(false)
  const [pendingPortfolioName, setPendingPortfolioName] = useState("")
  const [businessSlug, setBusinessSlug] = useState("businessname")

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
      setBusinessSlug(bn ? slugify(bn) : "businessname")
    }

    loadBusinessName()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadBusinessName()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

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
      />

      <section className="w-full flex justify-center px-6">
        <div className="w-full max-w-[1212px] py-[60px]">
          <DashPortfolioEmpty onClick={openCreateFlow} />
        </div>
      </section>

      {/* Step 1: Name */}
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

      {/* Step 2: Template */}
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