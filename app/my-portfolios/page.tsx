"use client"

import { useState } from "react"

import Navbar from "@/components/Navbar"
import DashboardProfileHeader from "@/components/my-portfolios/dashboard/DashboardProfileHeader"
import DashPortfolioEmpty from "@/components/my-portfolios/dashboard/DashPortfolioEmpty"
import CreateKonfolioPopover from "@/components/my-portfolios/dashboard/CreateKonfolioPopover"

type TemplateType = "square" | "portrait"

export default function MyPortfoliosPage() {
  const [createPopoverOpen, setCreatePopoverOpen] = useState(false)

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
        onPickTemplate={() => {
          setCreatePopoverOpen(false)
        }}
      />
    </main>
  )
}
