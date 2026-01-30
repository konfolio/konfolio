import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import HeroFrame from "@/components/HeroFrame"
import HeroPhotoMosaic from "@/components/HeroPhotoMosaic"
import Section2Example from "@/components/Section2Example"
import Section3Example from "@/components/Section3Example"
import Section4Example from "@/components/Section4Example"
import Section5Example from "@/components/Section5"
import { roboto } from "@/app/fonts"

function Section({
  children,
  index,
}: {
  children: React.ReactNode
  index: number
}) {
  const isAlt = index % 2 === 1 // 2nd, 4th sections

  return (
    <section className={isAlt ? "bg-white" : "bg-[#F7F7F7]"}>
      <div className="w-full max-w-[1512px] mx-auto">
        {children}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <Section index={0}>
        <div className="h-[846px] px-[25px] sm:px-10 lg:px-[150px] relative overflow-hidden">

          {/* Left: photo mosaic */}
          <HeroPhotoMosaic />

          {/* Right: logo */}
          <div className="mt-[121px] ml-auto translate-x-[100px] w-fit relative z-10">
            <HeroFrame />
          </div>

        </div>
      </Section>

      <Section index={1}>
        <div className="h-[824px] pt-[80px] pb-[80px] px-[25px] sm:px-10 lg:px-[143px] flex flex-col gap-[60px]">

          <div className="w-[1226px]">
            <h2
              className={`${roboto.className} text-[35px] leading-[100%] tracking-[-0.01em] text-[#262626]`}
            >
              <span className="font-medium italic">Exactly</span>{" "}
              <span className="font-light">
                what portfolio reviewers need to know
              </span>
            </h2>
          </div>
          
          <Section2Example />
        </div>
      </Section>

      <Section index={2}>
        <div className="h-[824px] pt-[80px] pb-[80px] px-[25px] sm:px-10 lg:px-[173px] flex flex-col gap-[60px]">
          <div className="w-[1226px]">
            <h2
              className={`${roboto.className} text-[35px] leading-[100%] tracking-[-0.01em] text-[#262626]`}
            >
              <span className="font-light">Less than </span>
              <span className="font-medium italic">half the time </span>{" "}
              <span className="font-light">
                for a great portfolio
              </span>
            </h2>
          </div>
          <Section3Example />
        </div>
      </Section>

      <Section index={3}>
        <div className="h-[1023.6692px] pt-[80px] pb-[80px] px-[25px] sm:px-10 lg:px-[190px] flex flex-col items-center gap-[10px]">
          <Section4Example />
        </div>
      </Section>

      <Section index={4}>
          <Section5Example />
      </Section>

      <Footer />
    </main>
  )
}
