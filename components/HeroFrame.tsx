import Link from "next/link"
import { inknut } from "@/app/fonts"
import Image from "next/image"
import PrimaryButton from "@/components/buttons/PrimaryButton"

export default function HeroFrame() {
  return (
    <div className="w-[408px] h-[220px] flex flex-col gap-[40px]">
      {/* Inner top frame */}
      <div className="w-[408px] h-[141px] flex flex-col items-start gap-[20px]">
        {/* Logo */}
        <div className="relative w-[269px] h-[63px]">
          <Image
            src="/images/konfolio.svg"
            alt="Konfolio"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {/* Caption */}
        <p className="text-left font-light text-[30px] leading-[120%] tracking-[0.02em] text-[#262626]">
          single-page artist portfolios made for reviewers
        </p>
      </div>

      {/* Primary button */}
      <PrimaryButton href="/onboarding/audience" className="w-[226px]">
        Create My Konfolio
      </PrimaryButton>
    </div>
  )
}
