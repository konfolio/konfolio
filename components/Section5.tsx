import Image from "next/image"
import { roboto } from "@/app/fonts"
import ArrowRight from "@/components/icons/ArrowRight"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import Link from "next/link"

const primaryBtn =
  "min-w-[150px] h-[39px] px-[40px] py-[13px] flex items-center justify-center gap-[7px] rounded-full bg-[#262626] text-white transition-all duration-100 ease-out hover:bg-[#262626CC] active:bg-[#262626B2]"

export default function Section5() {
  return (
    <section className="w-full h-[916.87px] px-[25px] sm:px-10 lg:px-[248px] py-[60px] flex flex-col items-center gap-[55px]">
      
      {/* Frame 86 */}
      <div className="w-[338px] h-[87px] flex flex-col items-center gap-[30px]">
        <p className={`${roboto.className} text-[25px] leading-[29px] text-[#262626]`}>
          Ready to create your Konfolio?
        </p>

        <PrimaryButton href="/onboarding/audience" className="w-[154px]">
            Let's Go
        </PrimaryButton>
      </div>

      {/* Sample portfolios */}
      <div className="relative w-[1015px] h-[560.87px]">
        {/* Linvaniin */}
        <div className="absolute w-[717.74px] h-[466.15px] rounded-[20px] border border-[rgba(165,165,165,0.5)]
          shadow-[3.47px_3.47px_12.99px_rgba(0,0,0,0.1)]
          left-[calc(50%-358.87px-148.63px)] top-[calc(50%-233.08px-23.36px)]
          overflow-hidden">
          <Image
            src="/images/linvaniin_home.png"
            alt="Linvaniin Konfolio"
            fill
            className="object-cover"
          />
        </div>

        {/* Califlair */}
        <div className="absolute w-[717.74px] h-[466.15px] rounded-[20px] border border-[rgba(165,165,165,0.5)]
          shadow-[3.47px_3.47px_12.99px_rgba(0,0,0,0.1)]
          left-[calc(50%-358.87px+148.63px)] top-[calc(50%-233.08px+71.36px)]
          overflow-hidden">
          <Image
            src="/images/califlair_home.png"
            alt="Califlair Konfolio"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Frame 87 */}
      <div className="w-[393px] h-[39px] flex items-center justify-center gap-[20px]">
        <p className={`${roboto.className} text-[25px] leading-[29px] text-[#262626]`}>
          Not ready yet?
        </p>

        <PrimaryButton href="/explore" className="w-[214px]">
          Explore Konfolios
        </PrimaryButton>
      </div>

    </section>
  )
}
