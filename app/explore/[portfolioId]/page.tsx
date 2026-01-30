"use client"

import ProfileSidebar from "@/components/featured/ProfileSidebar"
import ImageGrid from "@/components/featured/ImageGrid"

export default function MockPortfolioPage() {
  return (
    <main className="w-full min-h-[982px] bg-[#F7F7F7]">
      {/* Figma header uses 150px side padding; match that for this template */}
      <div className="w-full px-[25px] sm:px-10 lg:px-[150px]">
        <div className="mx-auto max-w-[1512px]">
          {/* Template row */}
          <div className="flex items-start justify-center gap-[20px]">
            <ProfileSidebar
              businessName="Business Name"
              displayName="Name"
              profileImageUrl="" // blank => no image
              merchTags={["Tag", "Tag"]}
              previousVends={[{ name: "Vended Event", year: "2026" }]}
              locationText="City, State"
              email="myemailaddress@konfolio.com"
              links={{
                instagram: "https://instagram.com",
                x: "https://x.com",
                // only these two icons will render
              }}
            />

            <ImageGrid />
          </div>
        </div>
      </div>
    </main>
  )
}
