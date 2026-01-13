import type { Metadata } from "next"
import "./globals.css"
import { inter } from "./fonts"

export const metadata: Metadata = {
  title: "konfolio",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
