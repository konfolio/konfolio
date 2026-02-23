import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import fs from "fs";

async function getExecutablePath() {
  // If you set a custom path, use it
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;

  // Local Mac default Chrome path
  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(macChrome)) return macChrome;

  // Fallback to serverless chromium (Linux)
  return await chromium.executablePath();
}

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Minimal HTML snapshot from DB content (good enough for thumbnails)
function buildThumbnailHtml(konfolio: { template: string; content: any }) {
  const c = konfolio.content ?? {};
  const template = konfolio.template ?? "square";
  const bg = c.backgroundColor ?? "#F7F7F7";
  const banner = c.bannerColor ?? "#FFFFFF";
  const displayName = escapeHtml(String(c.displayName ?? "Name"));
  const locationText = escapeHtml(String(c.locationText ?? ""));
  const profileImageUrl = String(c.profileImageUrl ?? "").trim();

  const images: any[] = Array.isArray(c.images) ? c.images : [];
  const cols = template === "portrait" ? 2 : 3;

  const cells = images
    .map((cell) => {
      const src = String(cell?.src ?? "").trim();
      if (src) {
        return `
          <div class="cell">
            <img src="${escapeHtml(src)}" />
          </div>
        `;
      }
      return `<div class="cell placeholder"></div>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: ${bg}; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
    .wrap { max-width: 900px; margin: 0 auto; padding: 40px 25px; }
    .card { background: ${banner}; border-radius: 18px; padding: 18px; margin-bottom: 18px; }
    .row { display: flex; gap: 14px; align-items: center; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: #e5e5e5; overflow: hidden; flex: 0 0 auto; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .name { font-size: 18px; font-weight: 700; color: #262626; line-height: 1.2; }
    .loc { font-size: 13px; color: #666; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 12px; }
    .cell { background: #fff; border-radius: 16px; overflow: hidden; aspect-ratio: 1/1; }
    .cell img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .placeholder { background: #f1f1f1; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="row">
        <div class="avatar">
          ${profileImageUrl ? `<img src="${escapeHtml(profileImageUrl)}" />` : ""}
        </div>
        <div>
          <div class="name">${displayName}</div>
          <div class="loc">${locationText}</div>
        </div>
      </div>
    </div>

    <div class="grid">
      ${cells}
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: konfolioId } = await ctx.params;

    // 1) Auth
    const token = getBearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userData.user.id;

    // 2) Ownership + fetch needed fields
    const { data: k, error: kErr } = await supabaseAdmin
      .from("konfolios")
      .select("id,user_id,template,content,status")
      .eq("id", konfolioId)
      .maybeSingle();

    if (kErr) return NextResponse.json({ error: kErr.message }, { status: 500 });
    if (!k || k.user_id !== userId) return NextResponse.json({ error: "Konfolio not found" }, { status: 404 });

    // 3) Mark published (idempotent)
    const publishedAt = new Date().toISOString();
    const { error: pubErr } = await supabaseAdmin
      .from("konfolios")
      .update({ status: "published", published_at: publishedAt })
      .eq("id", konfolioId);

    if (pubErr) return NextResponse.json({ error: pubErr.message }, { status: 500 });

    // 4) Render thumbnail HTML from DB + screenshot it
    const html = buildThumbnailHtml({ template: k.template, content: k.content });

    const executablePath = await getExecutablePath();

    const isMacLocal = executablePath.includes("Google Chrome.app");

    const browser = await puppeteer.launch({
        // On Mac local, chromium.args can include linux-only flags; keep it simple.
        args: isMacLocal ? [] : chromium.args,
        executablePath,
        headless: true,
        defaultViewport: { width: 1200, height: 800 },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const png = await page.screenshot({ type: "png" });
    await browser.close();

    // 5) Upload stable key
    const thumbPath = `${userId}/${konfolioId}/thumbnail.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("konfolio-images")
      .upload(thumbPath, png, { contentType: "image/png", upsert: true });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("konfolio-images")
      .getPublicUrl(thumbPath);

    const thumbnailUrl = publicUrlData.publicUrl;

    // 6) Save thumbnail_url
    const { error: tErr } = await supabaseAdmin
      .from("konfolios")
      .update({ thumbnail_url: thumbnailUrl })
      .eq("id", konfolioId);

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

    return NextResponse.json({
  ok: true,
  status: "published",
  publishedAt,
  thumbnailUrl,
  thumbnailUrlWithBust: `${thumbnailUrl}?t=${encodeURIComponent(publishedAt)}`,
});
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}