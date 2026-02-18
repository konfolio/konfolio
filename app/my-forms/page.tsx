"use client"

import Navbar from "@/components/Navbar"
import DashboardProfileHeader from "@/components/my-forms/dashboard/DashboardProfileHeader"

export default function MyFormsPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      {/* Host Profile Header */}
      <DashboardProfileHeader />

      {/* Empty content area for now */}
      <section className="w-full flex justify-center px-6">
        <div className="w-full max-w-[1212px] py-[60px]">
          {/* Future My Forms dashboard content goes here */}
        </div>
      </section>
    </main>
  )
}
