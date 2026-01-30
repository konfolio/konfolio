import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SearchBar from "@/components/explore/SearchBar"
import ExploreGrid from "@/components/explore/ExploreGrid"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />

      {/* Main content area */}
      <main
        className="
          flex flex-col items-center gap-[30px]
          py-[30px]
          px-[25px]
          sm:px-10
          lg:px-16
          xl:px-24
          2xl:px-[150px]
          flex-1
        "
      >
        {/* Page container */}
        <div className="w-full max-w-[1512px] flex flex-col items-center gap-[30px]">
          {/* Search Field */}
          <SearchBar />

          {/* Portfolio Grid */}
          <div className="w-full bg-transparent">
            <ExploreGrid />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
