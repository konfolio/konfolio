import { Inter, Inknut_Antiqua, Roboto } from "next/font/google"

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const inknut = Inknut_Antiqua({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-inknut",
})

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400","500"],
  variable: "--font-roboto",
})
