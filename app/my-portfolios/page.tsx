"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Navbar from "@/components/Navbar"
import DashboardProfileHeader from "@/components/my-portfolios/dashboard/DashboardProfileHeader"
import DashPortfolioEmpty from "@/components/my-portfolios/dashboard/DashPortfolioEmpty"
import CreateKonfolioPopover from "@/components/my-portfolios/dashboard/CreateKonfolioPopover"

type TemplateType = "square" | "portrait"

export default function MyPortfoliosPage() {
  const router = useRouter()
  const [createPopoverOpen, setCreatePopoverOpen] = useState(false)

  function handlePickTemplate(t: TemplateType) {
    setCreatePopoverOpen(false)

    // Adjust this route if your create flow uses something else:
    // e.g. "/create" or "/my-portfolios/new"
    router.push(`/my-portfolios/new?template=${t}`)
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      <DashboardProfileHeader editHref="/profile" createHref="/create" />

      <section className="w-full flex justify-center px-6">
        <div className="w-full max-w-[1212px] py-[60px]">
          <DashPortfolioEmpty onClick={() => setCreatePopoverOpen(true)} />
        </div>
      </section>

      <CreateKonfolioPopover
        open={createPopoverOpen}
        onClose={() => setCreatePopoverOpen(false)}
        onPickTemplate={handlePickTemplate}
      />
    </main>
  )
}
