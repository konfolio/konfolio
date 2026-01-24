// app/my-portfolios/edit-square/page.tsx
"use client"

import { useState } from "react"
import EditSquareProfileSidebar from "@/components/my-portfolios/EditSquareProfileSidebar"
import EditSquareImageGrid from "@/components/my-portfolios/EditSquareImageGrid"

export default function EditSquarePage() {
  const [bannerColor, setBannerColor] = useState("#FFFFFF")
  const [backgroundColor, setBackgroundColor] = useState("#F7F7F7")

  const [businessName, setBusinessName] = useState("Business Name")
  const [displayName, setDisplayName] = useState("Name")

  // if you want to store uploaded image in state:
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")

  return (
    <main className="w-full min-h-[982px]" style={{ backgroundColor }}>
      {/* Figma header uses 150px side padding; keep your pattern */}
      <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
        <div className="mx-auto max-w-[1512px]">
          {/* Template row */}
          <div className="flex items-start justify-center gap-[20px]">
            <EditSquareProfileSidebar
              backHref="/my-portfolios"
              bannerColor={bannerColor}
              backgroundColor={backgroundColor}
              onChangeBannerColor={setBannerColor}
              onChangeBackgroundColor={setBackgroundColor}
              profileImageUrl={profileImageUrl}
              onChangeProfileImage={(file, objectUrl) => {
                // store preview url (you can also upload `file` later)
                setProfileImageUrl(objectUrl)
              }}
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
                // TODO: open preview in a new tab
                // window.open("/my-portfolios/preview", "_blank")
              }}
            />

            <EditSquareImageGrid />
          </div>
        </div>
      </div>
    </main>
  )
}
