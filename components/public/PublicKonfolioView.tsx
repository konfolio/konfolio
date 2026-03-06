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
  const activeKeys = Object.keys(linksByKey).filter((k) => safeStr((linksByKey as any)[k]).length > 0)
  return { activeKeys, linksByKey }
}

function toPrevVendsValue(content: any): string {
  const v = safeStr(content?.previousVendsValue)
  if (v) return v

  const arr = safeArr(content?.previousVends)
  if (arr.length === 0) return "Vended Event 2026"
  return arr.slice(0, 4).join("|")
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
  const bannerColor = safeStr(content?.bannerColor) || "#FFFFFF"
  const backgroundColor = safeStr(content?.backgroundColor) || "#F7F7F7"

  const profileImageUrl = safeStr(content?.profileImageUrl)
  const displayName = safeStr(content?.displayName) || "Your Name"
  const locationText = safeStr(content?.locationText) || "City, State"
  const email = safeStr(content?.email) || "myemailaddress@konfolio.com"

  const businessName = safeStr(content?.businessName) || safeStr(ownerBusinessName) || "Business Name"

  // Memoize object/array props so child components don't see new references every render.
  const linksValue = React.useMemo(() => toLinksValue(content?.linksValue ?? content?.links ?? {}), [content])

  const merchTags = React.useMemo(() => safeArr(content?.merchTags), [content])
  const previousVendsArr = React.useMemo(() => safeArr(content?.previousVends), [content])
  const images = React.useMemo(() => (Array.isArray(content?.images) ? content.images : []), [content])

  // IMPORTANT: pass stable array refs for swatches so child effects don't loop.
  const bannerSwatches = React.useMemo(() => safeArr(content?.bannerSwatches), [content])
  const backgroundSwatches = React.useMemo(() => safeArr(content?.backgroundSwatches), [content])

  const prevVendsValue = React.useMemo(() => toPrevVendsValue(content), [content])

  const backHref = "/"

  if (template === "square") {
    return (
      <main className="w-full overflow-hidden" style={{ backgroundColor }}>
        <div className="w-full flex justify-center">
          <div className="flex gap-6 items-stretch">
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

            <EditSquareImageGrid editable={false} images={images} />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full overflow-hidden" style={{ backgroundColor }}>
      <div className="w-full flex flex-col items-center">
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
          showAddLink={false}
          publishLabel=""
        />

        <EditPortraitImageGrid
          editable={false}
          images={images}
          previousVendsLabel="Previous Vends"
          previousVendsValue={prevVendsValue}
        />
      </div>
    </main>
  )
}