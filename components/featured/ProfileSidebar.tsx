"use client"

import Link from "next/link"
import { inknut } from "@/app/fonts"

import Tag from "@/components/onboarding/Tag"

import LinkIcon from "@/components/icons/LinkIcon"
import HomeIcon from "@/components/icons/HomeIcon"
import ShopIcon from "@/components/icons/ShopIcon"
import InstagramIcon from "@/components/icons/InstagramIcon"
import XIcon from "@/components/icons/XIcon"
import FacebookIcon from "@/components/icons/FacebookIcon"
import TumblrIcon from "@/components/icons/TumblrIcon"
import PixivIcon from "@/components/icons/PixivIcon"
import BlueskyIcon from "@/components/icons/BlueskyIcon"

type SocialLinks = {
  website?: string
  shop?: string
  instagram?: string
  x?: string
  facebook?: string
  tumblr?: string
  pixiv?: string
  bluesky?: string
}

type PreviousVend = {
  name: string
  year?: string
}

type Props = {
  businessName?: string
  displayName?: string
  locationText?: string
  email?: string
  profileImageUrl?: string
  merchTags?: string[]
  previousVends?: PreviousVend[]
  links?: SocialLinks
}

export default function ProfileSidebar({
  businessName = "Business Name",
  displayName = "Name",
  locationText = "City, State",
  email = "myemailaddress@konfolio.com",
  profileImageUrl,
  merchTags = ["Prints", "Stickers"],
  previousVends = [{ name: "Vended Event", year: "2026" }],
  links = {},
}: Props) {
  const hasAnyLinks = Object.values(links).some(Boolean)

  const normalizeUrl = (url: string) =>
    /^https?:\/\//i.test(url) ? url : `https://${url}`

  // Hover effect 
  const iconWrap =
    "group inline-flex items-center justify-center w-[24px] h-[24px] " +
    "transition-opacity duration-150 ease-out " +
    "hover:opacity-70 " +
    "rounded-[6px]"

  return (
    <aside
      className="
        relative
        w-[316px] h-[982px]
        bg-white
        px-[20px] py-[40px]
        flex flex-col
        items-center
      "
    >
      {/* Logo (top, pinned) */}
      <div className="absolute top-[30px] left-1/2 -translate-x-1/2 opacity-50">
        <Link href="/" className="inline-flex">
          <span
            className={`${inknut.className} text-[18.12px] tracking-[-0.02em] font-semibold text-[#262626]`}
          >
            konfolio
          </span>
        </Link>
      </div>

      {/* Centered content block (everything except logo) */}
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-[276px] flex flex-col items-center gap-[30px]">
          {/* Profile image + names */}
          <div className="flex flex-col items-center gap-[12px]">
            <div className="w-[189px] h-[189px] rounded-[15px] bg-[#EDEDED] overflow-hidden">
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[rgba(165,165,165,0.25)]" />
              )}
            </div>

            <p className="m-0 text-[22px] leading-[27px] text-[#262626] text-center">
              {businessName}
            </p>

            <p className="m-0 text-[15px] leading-[140%] text-[#A5A5A5] text-center">
              {displayName}
            </p>
          </div>

          {/* Social links */}
          {hasAnyLinks && (
            <div className="flex items-center justify-center gap-[10px]">
              {links.website && (
                <a
                  href={normalizeUrl(links.website)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="Website"
                >
                  <LinkIcon />
                </a>
              )}
              {links.shop && (
                <a
                  href={normalizeUrl(links.shop)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="Shop"
                >
                  <ShopIcon />
                </a>
              )}
              {links.instagram && (
                <a
                  href={normalizeUrl(links.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              )}
              {links.x && (
                <a
                  href={normalizeUrl(links.x)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="X"
                >
                  <XIcon />
                </a>
              )}
              {links.facebook && (
                <a
                  href={normalizeUrl(links.facebook)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
              {links.tumblr && (
                <a
                  href={normalizeUrl(links.tumblr)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="Tumblr"
                >
                  <TumblrIcon />
                </a>
              )}
              {links.pixiv && (
                <a
                  href={normalizeUrl(links.pixiv)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="Pixiv"
                >
                  <PixivIcon />
                </a>
              )}
              {links.bluesky && (
                <a
                  href={normalizeUrl(links.bluesky)}
                  target="_blank"
                  rel="noreferrer"
                  className={iconWrap}
                  aria-label="Bluesky"
                >
                  <BlueskyIcon />
                </a>
              )}
            </div>
          )}

          {/* Merch tags */}
          <div className="flex flex-wrap justify-center gap-[10px]">
            {merchTags.map((tag, i) => (
              <Tag key={`${tag}-${i}`} label={tag} />
            ))}
          </div>

          {/* Previous vends */}
          <div className="flex flex-col items-center gap-[12px]">
            <p className="m-0 text-[15px] text-[#A5A5A5]">Previous Vends</p>

            {previousVends.map((vend, i) => (
              <p
                key={`${vend.name}-${vend.year ?? i}`}
                className="m-0 text-[15px] text-[#262626] text-center"
              >
                {vend.name}
                {vend.year && (
                  <span className="ml-[6px] italic text-[12px] text-[#A5A5A5]">
                    {vend.year}
                  </span>
                )}
              </p>
            ))}
          </div>

          {/* Location + email */}
          <div className="flex flex-col items-center gap-[12px]">
            {/* If you have a LocationIcon, swap it in here */}
            <div className="flex items-center gap-[5px]">
              <span className="text-[15px] text-[#A5A5A5]">{locationText}</span>
            </div>

            <span className="text-[15px] text-[#A5A5A5]">{email}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
