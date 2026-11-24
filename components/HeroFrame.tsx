// components/HeroFrame.tsx

import Image from "next/image"
import PrimaryButton from "@/components/buttons/PrimaryButton"

export default function HeroFrame() {
  return (
    <div className="flex w-full max-w-[363px] flex-col items-center gap-[30px] xl:h-[220px] xl:w-[408px] xl:max-w-none xl:items-start xl:gap-[40px]">
      <div className="flex w-[259px] flex-col items-center gap-[20px] sm:w-[320px] xl:h-[141px] xl:w-[408px] xl:items-start">
        <div className="relative h-[28px] w-[241px] sm:h-[38px] sm:w-[310px] xl:h-[63px] xl:w-[269px]">
          <Image
            src="/images/konfolio.svg"
            alt="Konfolio"
            fill
            className="object-contain object-center xl:object-left"
            priority
          />
        </div>

        <p className="text-center text-[19px] leading-[110%] font-light tracking-[0.02em] text-[#262626] sm:text-[23px] xl:text-left xl:text-[30px] xl:leading-[120%]">
          single-page artist portfolios made for reviewers
        </p>
      </div>

      <PrimaryButton href="/onboarding/audience" className="w-[207px] xl:w-[226px]">
        Create My Konfolio
      </PrimaryButton>
    </div>
  )
}