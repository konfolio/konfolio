import { NextResponse } from "next/server"
import { findPublicKonfolio, slugify } from "@/lib/publicKonfolioLookup"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store, max-age=0" }

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const business = slugify(searchParams.get("business") || "")
    const portfolio = slugify(searchParams.get("portfolio") || "")
    if (!business || !portfolio) return NextResponse.json({ error: "Missing business or portfolio" }, { status: 400, headers })
    const k = await findPublicKonfolio(business, portfolio)
    if (!k) return NextResponse.json({ error: "Not found" }, { status: 404, headers })
    return NextResponse.json(k, { headers })
  } catch {
    return NextResponse.json({ error: "Could not load portfolio" }, { status: 500, headers })
  }
}
