// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jhocsvjoqsncizdsmyol.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  outputFileTracingIncludes: {
    "/api/konfolios/[id]/publish": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
}

export default nextConfig