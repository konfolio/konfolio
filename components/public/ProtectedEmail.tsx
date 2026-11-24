"use client"

import { useRef, useState } from "react"

type Captcha = {
  ready: (callback: () => void) => void
  execute: (key: string, options: { action: string }) => Promise<string>
}
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
let loading: Promise<Captcha> | undefined

function loadCaptcha(): Promise<Captcha> {
  if (loading) return loading
  loading = new Promise<Captcha>((resolve, reject) => {
    const getApi = () => (window as Window & { grecaptcha?: Captcha }).grecaptcha
    const timer = window.setTimeout(() => reject(new Error("Verification timed out. Please retry.")), 15000)
    const ready = () => {
      const api = getApi()
      if (!api) { clearTimeout(timer); reject(new Error("Verification could not load.")); return }
      api.ready(() => { clearTimeout(timer); resolve(api) })
    }
    if (getApi()) { ready(); return }
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.onload = ready
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error("Verification could not load. Please retry.")) }
    document.head.appendChild(script)
  }).catch(error => { loading = undefined; throw error })
  return loading
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Verification timed out. Please retry.")), ms)
    })])
  } finally { clearTimeout(timer) }
}

export default function ProtectedEmail({ konfolioId }: { konfolioId: string }) {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const inFlight = useRef(false)
  async function reveal() {
    if (inFlight.current || email) return
    inFlight.current = true
    setBusy(true); setError("")
    try {
      if (!siteKey) throw new Error("Email verification is unavailable.")
      const api = await loadCaptcha()
      const token = await withTimeout(api.execute(siteKey, { action: "reveal_email" }), 15000)
      const response = await fetch("/api/public/konfolios/reveal-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konfolioId, token }), cache: "no-store",
        signal: AbortSignal.timeout(15000),
      })
      const data = await response.json()
      if (!response.ok || typeof data.email !== "string") throw new Error(data.error || "Could not reveal email.")
      setEmail(data.email)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.")
    } finally { inFlight.current = false; setBusy(false) }
  }
  return <div className="w-full text-center text-[15px]" aria-live="polite">
    {email ? <a href={`mailto:${email}`} className="break-all underline">{email}</a> :
      <button type="button" className="underline disabled:opacity-50" disabled={busy} onClick={reveal}>
        {busy ? "Verifying…" : "Show email"}
      </button>}
    {error && <p role="alert" className="mt-1 text-xs">{error}</p>}
  </div>
}
