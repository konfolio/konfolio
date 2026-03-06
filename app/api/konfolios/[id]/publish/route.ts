import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"
import fs from "fs"

async function getExecutablePath() {
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH

  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if (fs.existsSync(macChrome)) return macChrome

  return await chromium.executablePath()
}

export const runtime = "nodejs"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || ""
  if (!authHeader.startsWith("Bearer ")) return null
  return authHeader.slice("Bearer ".length).trim()
}

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function getAppBaseUrl(req: Request) {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL

  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/+$/, "")
  }

  const url = new URL(req.url)
  return url.origin.replace(/\/+$/, "")
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

  try {
    const { id: konfolioId } = await ctx.params
    console.log("[THUMBNAIL] Starting publish thumbnail generation for konfolio:", konfolioId)

    const token = getBearerToken(req)
    if (!token) {
      console.log("[THUMBNAIL] Missing bearer token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData.user) {
      console.log("[THUMBNAIL] Failed auth:", userErr?.message ?? "No user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = userData.user.id
    console.log("[THUMBNAIL] Authenticated user:", userId)

    const { data: k, error: kErr } = await supabaseAdmin
      .from("konfolios")
      .select("id, user_id, template, content, status, portfolio_slug")
      .eq("id", konfolioId)
      .maybeSingle()

    if (kErr) {
      console.log("[THUMBNAIL] Konfolio fetch error:", kErr.message)
      return NextResponse.json({ error: kErr.message }, { status: 500 })
    }

    if (!k || k.user_id !== userId) {
      console.log("[THUMBNAIL] Konfolio not found or ownership mismatch")
      return NextResponse.json({ error: "Konfolio not found" }, { status: 404 })
    }

    console.log("[THUMBNAIL] Konfolio found:", {
      id: k.id,
      status: k.status,
      template: k.template,
      portfolio_slug: k.portfolio_slug,
    })

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("business_name")
      .eq("id", userId)
      .maybeSingle()

    if (profileErr) {
      console.log("[THUMBNAIL] Profile fetch error:", profileErr.message)
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    const businessSlug = slugify(String(profile?.business_name ?? ""))
    const portfolioSlug = slugify(String(k.portfolio_slug ?? ""))

    console.log("[THUMBNAIL] businessSlug:", businessSlug)
    console.log("[THUMBNAIL] portfolioSlug:", portfolioSlug)

    if (!businessSlug || !portfolioSlug) {
      console.log("[THUMBNAIL] Missing slug data for screenshot")
      return NextResponse.json(
        { error: "Missing business or portfolio slug for thumbnail generation" },
        { status: 400 }
      )
    }

    const publishedAt = new Date().toISOString()

    const { error: pubErr } = await supabaseAdmin
      .from("konfolios")
      .update({ status: "published", published_at: publishedAt })
      .eq("id", konfolioId)

    if (pubErr) {
      console.log("[THUMBNAIL] Publish update error:", pubErr.message)
      return NextResponse.json({ error: pubErr.message }, { status: 500 })
    }

    console.log("[THUMBNAIL] Marked konfolio published at:", publishedAt)

    const baseUrl = getAppBaseUrl(req)
    const publicUrl = `${baseUrl}/${businessSlug}/${portfolioSlug}?thumbnail=1&t=${encodeURIComponent(
      publishedAt
    )}`

    console.log("[THUMBNAIL] baseUrl:", baseUrl)
    console.log("[THUMBNAIL] publicUrl:", publicUrl)

    const executablePath = await getExecutablePath()
    const isMacLocal = executablePath.includes("Google Chrome.app")

    console.log("[THUMBNAIL] executablePath:", executablePath)
    console.log("[THUMBNAIL] isMacLocal:", isMacLocal)

    browser = await puppeteer.launch({
      args: isMacLocal ? [] : chromium.args,
      executablePath,
      headless: true,
      defaultViewport: { width: 1512, height: 982 },
    })

    console.log("[THUMBNAIL] Browser launched")

    const page = await browser.newPage()
    console.log("[THUMBNAIL] New page created")

    await page.goto(publicUrl, {
      waitUntil: "networkidle0",
      timeout: 60000,
    })

    console.log("[THUMBNAIL] Public page loaded successfully")

    const png = await page.screenshot({
      type: "png",
      fullPage: true,
    })

    console.log("[THUMBNAIL] Screenshot captured from public page")

    const thumbPath = `${userId}/${konfolioId}/thumbnail.png`
    console.log("[THUMBNAIL] Uploading thumbnail to:", thumbPath)

    const { error: upErr } = await supabaseAdmin.storage
      .from("konfolio-images")
      .upload(thumbPath, png, {
        contentType: "image/png",
        upsert: true,
      })

    if (upErr) {
      console.log("[THUMBNAIL] Upload error:", upErr.message)
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("konfolio-images")
      .getPublicUrl(thumbPath)

    const thumbnailUrl = publicUrlData.publicUrl
    console.log("[THUMBNAIL] thumbnailUrl:", thumbnailUrl)

    const { error: tErr } = await supabaseAdmin
      .from("konfolios")
      .update({ thumbnail_url: thumbnailUrl })
      .eq("id", konfolioId)

    if (tErr) {
      console.log("[THUMBNAIL] thumbnail_url save error:", tErr.message)
      return NextResponse.json({ error: tErr.message }, { status: 500 })
    }

    console.log("[THUMBNAIL] thumbnail_url saved to konfolios row")

    return NextResponse.json({
      ok: true,
      status: "published",
      publishedAt,
      publicUrl,
      thumbnailUrl,
      thumbnailUrlWithBust: `${thumbnailUrl}?t=${encodeURIComponent(publishedAt)}`,
    })
  } catch (e: any) {
    console.log("[THUMBNAIL] Fatal error:", e?.message ?? e)
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  } finally {
    if (browser) {
      try {
        await browser.close()
        console.log("[THUMBNAIL] Browser closed")
      } catch (closeErr: any) {
        console.log("[THUMBNAIL] Browser close error:", closeErr?.message ?? closeErr)
      }
    }
  }
}