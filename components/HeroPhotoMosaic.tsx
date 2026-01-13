import Image from "next/image"

const cardShadow =
  "shadow-[0.75px_1.5px_14.97px_0px_rgba(0,0,0,0.2)]"

export default function HeroPhotoMosaic() {
  return (
    // Group frame: top 44px, left -251px, size 1297.8213 x 756
    <div className="absolute top-[44px] left-[-251px] w-[1297.8213px] h-[756px]">
      {/* Top-left: penelope */}
      <div className={`absolute top-0 left-0 w-[560.1573px] h-[363.8059px] rounded-[20px] overflow-hidden ${cardShadow}`}>
        <Image
          src="/images/penelope_home.png"
          alt="Penelope example"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Top-right: linvaniin (left = 339 - (-251) = 590) */}
      <div className={`absolute top-0 left-[590px] w-[560.16px] h-[363.8076px] rounded-[20px] overflow-hidden ${cardShadow}`}>
        <Image
          src="/images/linvaniin_home.png"
          alt="Linvaniin example"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Bottom-left: sayoran (top = 436 - 44 = 392, left = -103.61 - (-251) = 147.39) */}
      <div className={`absolute top-[392px] left-[147.39px] w-[560.16px] h-[363.8076px] rounded-[20px] overflow-hidden ${cardShadow}`}>
        <Image
          src="/images/sayoran_home.png"
          alt="Sayoran example"
          fill
          className="object-cover"
        />
      </div>

      {/* Bottom-right: califlair (top = 436.19 - 44 = 392.19, left = 486.66 - (-251) = 737.66) */}
      <div className={`absolute top-[392.19px] left-[737.66px] w-[560.1573px] h-[363.8059px] rounded-[20px] overflow-hidden ${cardShadow}`}>
        <Image
          src="/images/califlair_home.png"
          alt="Califair example"
          fill
          className="object-cover"
        />
      </div>
    </div>
  )
}
