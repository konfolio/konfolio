import crypto from "crypto";

const SECRET = process.env.KONFOLIO_PREVIEW_SECRET || "dev-secret-change-me";

export function makePreviewToken(payload: object, ttlSeconds = 60) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = JSON.stringify({ ...payload, exp });
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("hex");
  return Buffer.from(body).toString("base64url") + "." + sig;
}

export function verifyPreviewToken(token: string) {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;

  const body = Buffer.from(b64, "base64url").toString("utf8");
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const parsed = JSON.parse(body) as { exp: number; [k: string]: any };
  if (typeof parsed.exp !== "number") return null;
  if (Date.now() / 1000 > parsed.exp) return null;

  return parsed;
}