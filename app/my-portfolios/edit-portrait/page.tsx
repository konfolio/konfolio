// app/my-portfolios/edit-portrait/page.tsx
"use client"

import { useState } from "react"
import EditPortraitProfileSidebar from "@/components/my-portfolios/EditPortraitProfile"
import EditPortraitImageGrid from "@/components/my-portfolios/EditPortraitImageGrid"

export default function EditPortraitPage() {
  const [bannerColor, setBannerColor] = useState("#FFFFFF")
  const [backgroundColor, setBackgroundColor] = useState("#F7F7F7")

  const [businessName, setBusinessName] = useState("Business Name")
  const [displayName, setDisplayName] = useState("Name")

  const [profileImageUrl, setProfileImageUrl] = useState<string>("")

  return (
    <main className="w-full min-h-[982px]" style={{ backgroundColor }}>
      {/* Figma header uses 150px side padding */}
      <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
        <div className="mx-auto max-w-[1512px]">
          {/* ✅ Page stack: Profile (top) then Image Grid (below) */}
          <div className="flex flex-col items-center">
            <EditPortraitProfileSidebar
              backHref="/my-portfolios"
              bannerColor={bannerColor}
              backgroundColor={backgroundColor}
              onChangeBannerColor={setBannerColor}
              onChangeBackgroundColor={setBackgroundColor}
              profileImageUrl={profileImageUrl}
              onChangeProfileImage={(_, objectUrl) => setProfileImageUrl(objectUrl)}
              businessName={businessName}
              displayName={displayName}
              onChangeBusinessName={setBusinessName}
              onChangeDisplayName={setDisplayName}
              showAddLink
              onAddLinkClick={() => {
                // TODO: open add-link modal
              }}
              locationText="City, State"
              email="myemailaddress@konfolio.com"
              publishLabel="Publish"
              onPublish={() => {
                // TODO: publish flow
              }}
              onOpenPreview={() => {
                // TODO: open preview
                // window.open("/my-portfolios/preview", "_blank")
              }}
            />

            {/* Frame 127 (order 1) */}
            <EditPortraitImageGrid />
          </div>
        </div>
      </div>
    </main>
  )
}
