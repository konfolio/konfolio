// components/HeroPhotoMosaic.tsx

import Image from "next/image"

const cardShadow =
  "shadow-[0.75px_1.5px_14.97px_0px_rgba(0,0,0,0.2)]"

const mobileCardShadow =
  "shadow-[0.324px_0.648px_6.485px_0px_rgba(0,0,0,0.2)]"

const SCALE = 1.2

export default function HeroPhotoMosaic() {
  return (
    <>
      {/* MOBILE / TABLET */}
      <div
        className="relative mx-auto mt-[20px] xl:hidden"
        style={{
          width: 393 * SCALE,
          height: 357 * SCALE,
        }}
      >
        <div
          className={`absolute overflow-hidden rounded-[8.66px] ${mobileCardShadow}`}
          style={{
            width: 242.57 * SCALE,
            height: 157.54 * SCALE,
            left: -84 * SCALE,
            top: 0,
          }}
        >
          <Image
            src="/images/penelope_home.png"
            alt="Penelope example"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          className={`absolute overflow-hidden rounded-[8.66px] ${mobileCardShadow}`}
          style={{
            width: 242.57 * SCALE,
            height: 157.54 * SCALE,
            left: 171.49 * SCALE,
            top: 0,
          }}
        >
          <Image
            src="/images/linvaniin_home.png"
            alt="Linvaniin example"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          className={`absolute overflow-hidden rounded-[8.66px] ${mobileCardShadow}`}
          style={{
            width: 242.57 * SCALE,
            height: 157.54 * SCALE,
            left: -20.17 * SCALE,
            top: 169.75 * SCALE,
          }}
        >
          <Image
            src="/images/sayoran_home.png"
            alt="Sayoran example"
            fill
            className="object-cover"
          />
        </div>

        <div
          className={`absolute overflow-hidden rounded-[8.66px] ${mobileCardShadow}`}
          style={{
            width: 242.57 * SCALE,
            height: 157.54 * SCALE,
            left: 235.43 * SCALE,
            top: 169.83 * SCALE,
          }}
        >
          <Image
            src="/images/califlair_home.png"
            alt="Califlair example"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* DESKTOP */}
      <div className="absolute left-[-251px] top-[44px] hidden h-[756px] w-[1297.8213px] xl:block">
        <div
          className={`absolute left-0 top-0 h-[363.8059px] w-[560.1573px] overflow-hidden rounded-[20px] ${cardShadow}`}
        >
          <Image
            src="/images/penelope_home.png"
            alt="Penelope example"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          className={`absolute left-[590px] top-0 h-[363.8076px] w-[560.16px] overflow-hidden rounded-[20px] ${cardShadow}`}
        >
          <Image
            src="/images/linvaniin_home.png"
            alt="Linvaniin example"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          className={`absolute left-[147.39px] top-[392px] h-[363.8076px] w-[560.16px] overflow-hidden rounded-[20px] ${cardShadow}`}
        >
          <Image
            src="/images/sayoran_home.png"
            alt="Sayoran example"
            fill
            className="object-cover"
          />
        </div>

        <div
          className={`absolute left-[737.66px] top-[392.19px] h-[363.8059px] w-[560.1573px] overflow-hidden rounded-[20px] ${cardShadow}`}
        >
          <Image
            src="/images/califlair_home.png"
            alt="Califlair example"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </>
  )
}