// components/public/PublicKonfolioView.tsx
"use client"

import * as React from "react"

import EditSquareProfileSidebar from "@/components/my-portfolios/square/EditSquareProfileSidebar"
import EditSquareImageGrid from "@/components/my-portfolios/square/EditSquareImageGrid"

import EditPortraitProfile from "@/components/my-portfolios/portrait/EditPortraitProfile"
import EditPortraitImageGrid from "@/components/my-portfolios/portrait/EditPortraitImageGrid"

type Template = "square" | "portrait"

function safeStr(x: any) {
  return String(x ?? "").trim()
}

function safeArr(v: any): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => safeStr(x)).filter(Boolean)
}

function firstColor(...values: any[]) {
  for (const value of values) {
    const color = safeStr(value)
    if (color) return color
  }
  return ""
}

function isColorDark(color: string) {
  const c = safeStr(color).replace("#", "")

  if (c.length !== 6) return false

  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

function toLinksValue(raw: any) {
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as any).activeKeys) &&
    (raw as any).linksByKey &&
    typeof (raw as any).linksByKey === "object"
  ) {
    return raw
  }

  const linksByKey = raw && typeof raw === "object" ? raw : {}
  const activeKeys = Object.keys(linksByKey).filter(
    (k) => safeStr((linksByKey as any)[k]).length > 0,
  )

  return { activeKeys, linksByKey }
}

export default function PublicKonfolioView({
  template,
  content,
  ownerBusinessName,
  portfolioName,
}: {
  template: Template
  content: any
  ownerBusinessName: string
  portfolioName: string
}) {
  const [mobileProfileOpen, setMobileProfileOpen] = React.useState(false)

  const bannerColor =
    firstColor(
      content?.bannerColor,
      content?.colors?.bannerColor,
      content?.colors?.banner,
      content?.profile?.bannerColor,
      content?.profile?.banner,
    ) || "#FFFFFF"

  const backgroundColor =
    firstColor(
      content?.backgroundColor,
      content?.colors?.backgroundColor,
      content?.colors?.background,
      content?.profile?.backgroundColor,
      content?.profile?.background,
    ) || "#F7F7F7"

  const backgroundIsDark = isColorDark(backgroundColor)

  const profileImageUrl = safeStr(content?.profileImageUrl)
  const displayName = safeStr(content?.displayName) || "Your Name"
  const locationText = safeStr(content?.locationText) || "City, State"
  const email = safeStr(content?.email) || "myemailaddress@konfolio.com"

  const businessName =
    safeStr(content?.businessName) || safeStr(ownerBusinessName) || "Business Name"

  const linksValue = React.useMemo(
    () => toLinksValue(content?.linksValue ?? content?.links ?? {}),
    [content],
  )

  const merchTags = React.useMemo(() => safeArr(content?.merchTags), [content])
  const previousVendsArr = React.useMemo(() => safeArr(content?.previousVends), [content])

  const images = React.useMemo(
    () => (Array.isArray(content?.images) ? content.images : []),
    [content],
  )

  const bannerSwatches = React.useMemo(() => safeArr(content?.bannerSwatches), [content])

  const backgroundSwatches = React.useMemo(
    () => safeArr(content?.backgroundSwatches),
    [content],
  )

  const backHref = "/"

  if (template === "square") {
    return (
      <main className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor }}>
        <div className="w-full px-0 min-[701px]:py-0 min-[1200px]:px-[80px] xl:px-[120px]">
          <div className="mx-auto w-full max-w-[1512px]">
            <div className="hidden w-full flex-col max-[700px]:flex">
              <EditSquareProfileSidebar
                editable={false}
                mobileCollapsed={true}
                mobileExpanded={mobileProfileOpen}
                onToggleMobile={() => setMobileProfileOpen((prev) => !prev)}
                backHref={backHref}
                bannerColor={bannerColor}
                backgroundColor={backgroundColor}
                bannerSwatches={bannerSwatches}
                backgroundSwatches={backgroundSwatches}
                profileImageUrl={profileImageUrl}
                businessName={businessName}
                displayName={displayName}
                locationText={locationText}
                email={email}
                linksValue={linksValue}
                merchTags={merchTags}
                previousVends={previousVendsArr}
                showAddLink={false}
                showMerchTag={false}
                publishLabel=""
              />

              <EditSquareImageGrid
                editable={false}
                images={images}
                backgroundIsDark={backgroundIsDark}
              />
            </div>

            <div className="hidden w-full flex-row items-start justify-start gap-[20px] min-[701px]:flex">
              <EditSquareProfileSidebar
                editable={false}
                backHref={backHref}
                bannerColor={bannerColor}
                backgroundColor={backgroundColor}
                bannerSwatches={bannerSwatches}
                backgroundSwatches={backgroundSwatches}
                profileImageUrl={profileImageUrl}
                businessName={businessName}
                displayName={displayName}
                locationText={locationText}
                email={email}
                linksValue={linksValue}
                merchTags={merchTags}
                previousVends={previousVendsArr}
                showAddLink={false}
                showMerchTag={false}
                publishLabel=""
              />

              <EditSquareImageGrid
                editable={false}
                images={images}
                backgroundIsDark={backgroundIsDark}
              />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor }}>
      <div className="hidden w-full flex-col max-[700px]:flex">
        <EditPortraitProfile
          editable={false}
          mobileCollapsed={true}
          mobileExpanded={mobileProfileOpen}
          onToggleMobile={() => setMobileProfileOpen((prev) => !prev)}
          backHref={backHref}
          bannerColor={bannerColor}
          backgroundColor={backgroundColor}
          bannerSwatches={bannerSwatches}
          backgroundSwatches={backgroundSwatches}
          profileImageUrl={profileImageUrl}
          businessName={businessName}
          displayName={displayName}
          locationText={locationText}
          email={email}
          linksValue={linksValue}
          merchTags={merchTags}
          previousVends={previousVendsArr}
          showAddLink={false}
          publishLabel=""
        />

        <EditPortraitImageGrid
          editable={false}
          images={images}
          previousVendsLabel="Previous Vends"
          previousVends={previousVendsArr}
          backgroundIsDark={backgroundIsDark}
        />
      </div>

      <div className="hidden w-full flex-col min-[701px]:flex">
        <EditPortraitProfile
          editable={false}
          backHref={backHref}
          bannerColor={bannerColor}
          backgroundColor={backgroundColor}
          bannerSwatches={bannerSwatches}
          backgroundSwatches={backgroundSwatches}
          profileImageUrl={profileImageUrl}
          businessName={businessName}
          displayName={displayName}
          locationText={locationText}
          email={email}
          linksValue={linksValue}
          merchTags={merchTags}
          previousVends={previousVendsArr}
          showAddLink={false}
          publishLabel=""
        />

        <div className="w-full px-[24px] min-[1200px]:px-[80px] xl:px-[120px]">
          <div className="mx-auto w-full max-w-[1512px]">
            <EditPortraitImageGrid
              editable={false}
              images={images}
              previousVendsLabel="Previous Vends"
              previousVends={previousVendsArr}
              backgroundIsDark={backgroundIsDark}
            />
          </div>
        </div>
      </div>
    </main>
  )
}