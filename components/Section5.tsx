import Image from "next/image"
import { roboto } from "@/app/fonts"
import PrimaryButton from "@/components/buttons/PrimaryButton"

const forceWhiteArrow =
  "[&_svg]:block [&_svg]:h-[13px] [&_svg]:w-[13px] [&_path]:!stroke-white"

export default function Section5() {
  return (
    <section className="flex w-full flex-col items-center gap-[35px] px-[10px] py-[50px] sm:px-[25px] md:gap-[45px] md:py-[65px] xl:h-[916.87px] xl:gap-[55px] xl:px-[248px] xl:py-[60px]">
      <div className="flex w-full max-w-[338px] flex-col items-center gap-[30px] xl:h-[87px]">
        <p
          className={`${roboto.className} text-center text-[19px] leading-[115%] text-[#262626] sm:text-[22px] md:text-[24px] xl:text-[25px] xl:leading-[29px]`}
        >
          Ready to create your Konfolio?
        </p>

        <PrimaryButton
          href="/onboarding/audience"
          className={`w-[154px] ${forceWhiteArrow}`}
        >
          Let's Go
        </PrimaryButton>
      </div>

      <div className="relative mb-[20px] h-[310px] w-full max-w-[373px] sm:mb-[30px] md:mb-[45px] lg:mb-[55px] xl:mb-0 sm:h-[390px] md:h-[470px] lg:h-[520px] xl:h-[560.87px] sm:max-w-[560px] md:max-w-[720px] lg:max-w-[900px] xl:max-w-none xl:w-[1015px]">
        <div
          className="
            absolute left-1/2 top-0
            h-[231.86px] w-[357px] -translate-x-[56%]
            overflow-hidden rounded-[10px]
            border border-[rgba(165,165,165,0.5)]
            shadow-[1.22px_1.22px_4.58px_rgba(0,0,0,0.12)]
            sm:h-[320px] sm:w-[493px]
            md:h-[390px] md:w-[602px]
            lg:h-[440px] lg:w-[680px]
            xl:h-[466.15px] xl:w-[717.74px]
            xl:translate-x-0 xl:rounded-[20px]
            xl:shadow-[3.47px_3.47px_12.99px_rgba(0,0,0,0.1)]
            xl:left-[calc(50%-358.87px-148.63px)]
            xl:top-[calc(50%-233.08px-23.36px)]
          "
        >
          <Image
            src="/images/linvaniin_home.png"
            alt="Linvaniin Konfolio"
            fill
            className="object-cover"
          />
        </div>

        <div
          className="
            absolute left-1/2 top-[78px]
            h-[231.86px] w-[357px] -translate-x-[44%]
            overflow-hidden rounded-[10px]
            border border-[rgba(165,165,165,0.5)]
            shadow-[1.22px_1.22px_4.58px_rgba(0,0,0,0.12)]
            sm:top-[100px] sm:h-[320px] sm:w-[493px]
            md:top-[120px] md:h-[390px] md:w-[602px]
            lg:top-[135px] lg:h-[440px] lg:w-[680px]
            xl:h-[466.15px] xl:w-[717.74px]
            xl:translate-x-0 xl:rounded-[20px]
            xl:shadow-[3.47px_3.47px_12.99px_rgba(0,0,0,0.1)]
            xl:left-[calc(50%-358.87px+148.63px)]
            xl:top-[calc(50%-233.08px+71.36px)]
          "
        >
          <Image
            src="/images/califlair_home.png"
            alt="Califlair Konfolio"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex w-full max-w-[393px] flex-col items-center justify-center gap-[20px] md:flex-row xl:h-[39px]">
        <p
          className={`${roboto.className} text-center text-[19px] leading-[115%] text-[#262626] sm:text-[22px] md:text-[24px] xl:text-[25px] xl:leading-[29px]`}
        >
          Not ready yet?
        </p>

        <PrimaryButton
          href="/explore"
          className={`w-[214px] ${forceWhiteArrow}`}
        >
          Explore Konfolios
        </PrimaryButton>
      </div>
    </section>
  )
}