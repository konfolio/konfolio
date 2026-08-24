import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const maxDuration = 60

const THUMBNAIL_TARGET_SELECTOR = '[data-thumbnail-target="konfolio-grid"]'

async function getExecutablePath() {
  if (process.env.CHROME_EXECUTABLE_PATH) {
    return process.env.CHROME_EXECUTABLE_PATH
  }

  // Local Mac Chrome for development
  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if (fs.existsSync(macChrome)) {
    return macChrome
  }

  // Vercel/serverless path
  const chromiumBinPath = path.join(
    process.cwd(),
    "node_modules",
    "@sparticuz",
    "chromium",
    "bin"
  )

  if (fs.existsSync(chromiumBinPath)) {
    return await chromium.executablePath(chromiumBinPath)
  }

  return await chromium.executablePath()
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || ""
  if (!authHeader.startsWith("Bearer ")) return null
  return authHeader.slice("Bearer ".length).trim()
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

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

  try {
    const { id: konfolioId } = await ctx.params

    console.log(
      "[THUMBNAIL] Starting publish thumbnail generation for konfolio:",
      konfolioId
    )

    const token = getBearerToken(req)

    if (!token) {
      console.log("[THUMBNAIL] Missing bearer token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token)

    if (userErr || !userData.user) {
      console.log("[THUMBNAIL] Failed auth:", userErr?.message ?? "No user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = userData.user.id
    console.log("[THUMBNAIL] Authenticated user:", userId)

    const { data: k, error: kErr } = await supabaseAdmin
      .from("konfolios")
      .select(
        "id, user_id, template, content, status, explore_enabled, portfolio_name, portfolio_slug"
      )
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
      explore_enabled: k.explore_enabled,
      portfolio_name: k.portfolio_name,
      portfolio_slug: k.portfolio_slug,
    })

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("business_slug")
      .eq("id", userId)
      .maybeSingle()

    if (profileErr) {
      console.log("[THUMBNAIL] Profile fetch error:", profileErr.message)
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    const businessSlug = profile?.business_slug
    const portfolioSlug = k.portfolio_slug

    if (!businessSlug) {
      return NextResponse.json(
        {
          error:
            "Missing business slug. Please complete onboarding again or update your business name.",
        },
        { status: 400 }
      )
    }

    if (!portfolioSlug) {
      return NextResponse.json(
        {
          error:
            "Missing portfolio slug. Please rename/save this Konfolio before publishing.",
        },
        { status: 400 }
      )
    }

    const publishedAt = new Date().toISOString()

    const { error: pubErr } = await supabaseAdmin
      .from("konfolios")
      .update({
        status: "published",
        explore_enabled: true,
        published_at: publishedAt,
        updated_at: publishedAt,
      })
      .eq("id", konfolioId)
      .eq("user_id", userId)

    if (pubErr) {
      console.log("[THUMBNAIL] Publish update error:", pubErr.message)
      return NextResponse.json({ error: pubErr.message }, { status: 500 })
    }

    console.log("[THUMBNAIL] Marked konfolio published at:", publishedAt)

    const baseUrl = getAppBaseUrl(req)

    // This is the public URL users should see/copy/open.
    const publicPath =
      portfolioSlug === businessSlug
        ? `/${businessSlug}`
        : `/${businessSlug}/${portfolioSlug}`

    const prettyPublicUrl = `${baseUrl}${publicPath}`

    // This URL is only for Puppeteer thumbnail generation.
    // Keep using the working UUID explore route so thumbnails do not screenshot a 404.
    const screenshotUrl = `${baseUrl}/explore/${konfolioId}?thumbnail=1&t=${encodeURIComponent(
      publishedAt
    )}`

    console.log("[THUMBNAIL] baseUrl:", baseUrl)
    console.log("[THUMBNAIL] publicPath:", publicPath)
    console.log("[THUMBNAIL] prettyPublicUrl:", prettyPublicUrl)
    console.log("[THUMBNAIL] screenshotUrl:", screenshotUrl)

    const executablePath = await getExecutablePath()
    const isLocalChrome = executablePath.includes("Google Chrome.app")

    console.log("[THUMBNAIL] executablePath:", executablePath)
    console.log("[THUMBNAIL] isLocalChrome:", isLocalChrome)

    const headlessMode: true | "shell" = isLocalChrome ? true : "shell"

    browser = await puppeteer.launch({
      args: isLocalChrome
        ? puppeteer.defaultArgs({ headless: true })
        : puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath,
      headless: headlessMode,
      defaultViewport: { width: 1512, height: 982 },
    })

    console.log("[THUMBNAIL] Browser launched")

    const page = await browser.newPage()
    console.log("[THUMBNAIL] New page created")

    const response = await page.goto(screenshotUrl, {
      waitUntil: "networkidle0",
      timeout: 60000,
    })

    if (!response || !response.ok()) {
      throw new Error(
        `Thumbnail page failed to load. Status: ${response?.status()} URL: ${screenshotUrl}`
      )
    }

    const pageText = await page.evaluate(() => document.body.innerText)

    if (
      pageText.includes("404") ||
      pageText.includes("This page could not be found")
    ) {
      throw new Error(`Thumbnail target rendered a 404 page: ${screenshotUrl}`)
    }

    console.log("[THUMBNAIL] Public page loaded successfully")

    // Make sure images are fully loaded before screenshotting.
    await page.evaluate(async () => {
      const images = Array.from(document.images)

      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()

          return new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
        })
      )
    })

    console.log("[THUMBNAIL] Images loaded")

    let png: string | Uint8Array

    try {
      await page.waitForSelector(THUMBNAIL_TARGET_SELECTOR, {
        timeout: 10000,
      })

      const thumbnailTarget = await page.$(THUMBNAIL_TARGET_SELECTOR)

      if (!thumbnailTarget) {
        throw new Error("Thumbnail target not found after waitForSelector")
      }

      png = await thumbnailTarget.screenshot({
        type: "png",
      })

      console.log("[THUMBNAIL] Screenshot captured from Konfolio image grid")
    } catch (screenshotErr: any) {
      console.log(
        "[THUMBNAIL] Could not capture grid only. Falling back to full-page screenshot:",
        screenshotErr?.message ?? screenshotErr
      )

      png = await page.screenshot({
        type: "png",
        fullPage: true,
      })

      console.log("[THUMBNAIL] Fallback full-page screenshot captured")
    }

    // Use a fresh filename every time so the browser/CDN does not keep showing
    // the old 404 thumbnail from cache.
    const thumbPath = `${userId}/${konfolioId}/thumbnail-${Date.now()}.png`
    console.log("[THUMBNAIL] Uploading thumbnail to:", thumbPath)

    const { error: upErr } = await supabaseAdmin.storage
      .from("konfolio-images")
      .upload(thumbPath, png, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
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
      .eq("user_id", userId)

    if (tErr) {
      console.log("[THUMBNAIL] thumbnail_url save error:", tErr.message)
      return NextResponse.json({ error: tErr.message }, { status: 500 })
    }

    console.log("[THUMBNAIL] thumbnail_url saved to konfolios row")

    return NextResponse.json({
      ok: true,
      status: "published",
      publishedAt,

      businessSlug,
      portfolioSlug,
      publicPath,
      publicUrl: prettyPublicUrl,
      viewUrl: prettyPublicUrl,

      screenshotUrl,
      thumbnailUrl,
      thumbnailUrlWithBust: `${thumbnailUrl}?t=${encodeURIComponent(
        publishedAt
      )}`,
    })
  } catch (e: any) {
    console.log("[THUMBNAIL] Fatal error:", e?.message ?? e)

    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    )
  } finally {
    if (browser) {
      try {
        await browser.close()
        console.log("[THUMBNAIL] Browser closed")
      } catch (closeErr: any) {
        console.log(
          "[THUMBNAIL] Browser close error:",
          closeErr?.message ?? closeErr
        )
      }
    }
  }
}