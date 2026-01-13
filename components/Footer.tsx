import Link from "next/link"
import { inknut } from "@/app/fonts"

const footerLink =
  "relative text-[17px] leading-[140%] font-normal text-zinc-900 whitespace-nowrap transition-all duration-100 ease-out hover:font-semibold"

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      {/* MOBILE */}
      <div className="px-[25px] pt-[48px] pb-[30px] lg:hidden">
        <div className="flex flex-col items-center gap-[40px]">
          {/* Logo centered */}
          <Link
            href="/"
            className={`${inknut.className} text-[18.12px] leading-[100%] tracking-[-0.02em] font-semibold text-zinc-900`}
          >
            konfolio
          </Link>

          {/* Vertical nav buttons */}
          <div className="w-full flex flex-col items-center gap-[25px]">
            <a href="#" className={footerLink}>
              Explore
            </a>
            <a href="#" className={footerLink}>
              Support
            </a>
            <a href="#" className={footerLink}>
              Report Issue
            </a>
            <a href="#" className={footerLink}>
              Terms of Service
            </a>
          </div>

          {/* Reach out (email only italic+underline) */}
          <p className="text-[14px] leading-[140%] font-normal text-zinc-900 text-center">
            Reach out to us at{" "}
            <a href="mailto:konfolios@gmail.com" className="italic underline">
              konfolios@gmail.com
            </a>
          </p>

          {/* All rights reserved */}
          <p className="text-[12px] leading-[140%] font-normal text-zinc-700 text-center">
            All Rights Reserved. Konfolio.
          </p>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block h-[131px]">
        <div className="h-full px-[150px]">
          <div className="w-full max-w-[1212px] mx-auto">
            {/* Row 1 */}
            <div className="pt-[32px] flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-[50px]">
                <Link
                  href="/"
                  className={`${inknut.className} text-[18.12px] leading-[100%] tracking-[-0.02em] font-semibold text-zinc-900`}
                >
                  konfolio
                </Link>

                <a href="#" className={`${footerLink} no-shift`} data-text="Explore">
                  Explore
                </a>
                <a href="#" className={`${footerLink} no-shift`} data-text="Support">
                  Support
                </a>
              </div>

              {/* Right */}
              <div className="flex items-center gap-[50px]">
                <a href="#" className={`${footerLink} no-shift`} data-text="Report Issue">
                  Report Issue
                </a>
                <a href="#" className={`${footerLink} no-shift`} data-text="Terms of Service">
                  Terms of Service
                </a>
              </div>
            </div>

            {/* Row 2 */}
            <div className="pt-[38px] flex items-center justify-between">
              <p className="text-[12px] leading-[140%] font-normal text-zinc-700">
                All Rights Reserved. Konfolio.
              </p>

              <p className="text-[14px] leading-[140%] font-normal text-zinc-900 text-right">
                Reach out to us at{" "}
                <a href="mailto:konfolios@gmail.com" className="italic underline">
                  konfolios@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
