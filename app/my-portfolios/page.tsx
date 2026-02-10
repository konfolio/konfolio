import Navbar from "@/components/Navbar"
import DashboardProfileHeader from "@/components/my-portfolios/dashboard/DashboardProfileHeader"

export default function MyPortfoliosPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      <DashboardProfileHeader editHref="/profile" createHref="/create" />

      <section className="w-full flex justify-center px-6">
        <div className="w-full max-w-[1212px] py-[60px]">
          <div className="text-[#A5A5A5] text-sm">No konfolios yet.</div>
        </div>
      </section>
    </main>
  )
}
