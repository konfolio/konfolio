// app/page.tsx

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import HeroFrame from "@/components/HeroFrame"
import HeroPhotoMosaic from "@/components/HeroPhotoMosaic"
import Section2Example from "@/components/Section2Example"
import Section3Example from "@/components/Section3Example"
import Section4Example from "@/components/Section4Example"
import Section5Example from "@/components/Section5"
import { roboto } from "@/app/fonts"
import HomeViewTracker from "@/components/HomeViewTracker"
import HomeAnalyticsDisplay from "@/components/HomeAnalyticsDisplay"

function Section({
  children,
  index,
}: {
  children: React.ReactNode
  index: number
}) {
  const isAlt = index % 2 === 1

  return (
    <section className={isAlt ? "bg-white" : "bg-[#F7F7F7]"}>
      <div className="mx-auto w-full max-w-[1512px]">{children}</div>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <h2
        className={`${roboto.className} mx-auto max-w-[1226px] text-center text-[19px] leading-[115%] tracking-[-0.01em] text-[#262626] sm:text-[24px] md:text-[28px] xl:text-left xl:text-[35px] xl:leading-[100%]`}
      >
        {children}
      </h2>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7F7]">
      <HomeViewTracker />
      <HomeAnalyticsDisplay />
      <Navbar />

      <Section index={0}>
        <div className="relative flex min-h-[740px] flex-col items-center overflow-hidden px-[25px] pt-[19px] pb-[64px] sm:min-h-[790px] md:min-h-[830px] xl:h-[846px] xl:min-h-0 xl:block xl:px-[150px] xl:pt-0 xl:pb-0">
          <HeroPhotoMosaic />

          <div className="relative z-10 mt-[40px] flex w-full justify-center xl:mt-[121px] xl:ml-auto xl:block xl:w-fit xl:translate-x-[100px]">
            <HeroFrame />
          </div>
        </div>
      </Section>

      <Section index={1}>
        <div className="flex flex-col items-center gap-[35px] px-[10px] py-[50px] sm:px-[25px] md:gap-[45px] md:py-[65px] xl:h-[824px] xl:items-stretch xl:gap-[60px] xl:px-[143px] xl:py-[80px]">
          <SectionTitle>
            <span className="font-medium italic">Exactly</span>{" "}
            <span className="font-light">
              what portfolio reviewers need to know
            </span>
          </SectionTitle>

          <Section2Example />
        </div>
      </Section>

      <Section index={2}>
        <div className="flex flex-col items-center gap-[35px] px-[27px] py-[50px] md:gap-[45px] md:py-[65px] xl:h-[824px] xl:items-stretch xl:gap-[60px] xl:px-[173px] xl:py-[80px]">
          <SectionTitle>
            <span className="font-light">Less than </span>
            <span className="font-medium italic">half the time </span>
            <span className="font-light">for a great portfolio</span>
          </SectionTitle>

          <Section3Example />
        </div>
      </Section>

      <Section index={3}>
        <div className="flex flex-col items-center gap-[35px] px-[27px] py-[50px] md:gap-[45px] md:py-[65px] xl:h-[1023.6692px] xl:gap-[10px] xl:px-[190px] xl:py-[80px]">
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