import Navbar from "@/components/Navbar"
import CreateFirstKonfolioCard from "@/components/my-portfolios/CreateKonfolioCard"

export default function MyPortfoliosPage() {
  return (
    <>
      <Navbar />

      <main
        className="
          min-h-[calc(100vh-61px)]
          flex justify-center
          pt-[60px]
          pb-[80px]
        "
      >
        <CreateFirstKonfolioCard />
      </main>
    </>
  )
}
