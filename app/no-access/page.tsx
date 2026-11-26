"use client"

// Need to connect to backend
// Paste this where user will redirect to login no access (Not Invited Email):
// router.replace(`/no-access?form=${encodeURIComponent(title)}&returnTo=${encodeURIComponent(pathname)}`)

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { inknut } from "@/app/fonts";

import AuthHeader from "@/components/onboarding/AuthHeader"
import GoogleLogo from "@/components/icons/GoogleLogo"
import { supabase } from "@/lib/supabaseClient"

function isSafeInternalPath(v: string) {
  return v.startsWith("/") && !v.startsWith("//")
}

function NoAccessInner() {
  const params = useSearchParams()
  const formTitle = params.get("form")?.trim() || ""
  const rawReturnTo = (params.get("returnTo") || "").trim()
  const returnTo = isSafeInternalPath(rawReturnTo) ? rawReturnTo : ""

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function switchAccount() {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await supabase.auth.signOut()

      const redirect = new URL("/login", window.location.origin)
      if (returnTo) redirect.searchParams.set("returnTo", returnTo)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirect.toString(),
          queryParams: { prompt: "select_account" },
        },
      })
      if (error) throw error
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in. Please try again.")
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <AuthHeader />

      <main className="min-h-[calc(100vh-61px)] flex items-center justify-center px-4 py-10">
        <section
          aria-labelledby="no-access-title"
          className="flex w-full max-w-[802px] flex-col items-center gap-[60px] overflow-hidden rounded-[15px] bg-white px-6 py-10 shadow-[8px_8px_50px_0px_rgba(0,0,0,0.05)] sm:gap-[100px] sm:px-[101px] sm:py-[50px]"
        >
          <span className={`${inknut.className} text-[22px] leading-none tracking-[-0.53px] text-[#262626]`}>
            konfolio
          </span>

          <h1
            id="no-access-title"
            className="max-w-full break-words text-center text-[20px] font-normal leading-[1.5] text-black sm:text-[25px]"
          >
            You do not have access to{" "}
            {formTitle ? <strong className="font-bold">{formTitle}</strong> : "this form"}.
          </h1>

          <div className="flex w-full flex-col items-center gap-[10px]">
            <p className="text-center text-[15px] leading-[1.4] text-black">Try again with another email?</p>

            <button
              type="button"
              onClick={() => void switchAccount()}
              disabled={busy}
              className="flex w-full max-w-[600px] items-center justify-center gap-[13px] overflow-hidden rounded-full border-[0.5px] border-black/40 bg-white px-[30px] py-[20px] transition-colors hover:bg-[#F7F7F7] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
            >
              <GoogleLogo />
              <span className="min-w-0 flex-1 text-center text-[17px] leading-[1.4] text-[#3c4043]">
                {busy ? "Redirecting..." : "Sign in with Google"}
              </span>
            </button>

            {error && <p role="alert" className="text-center text-[13px] text-[#FF4603]">{error}</p>}
          </div>
        </section>
      </main>
    </div>
  )
}

export default function NoAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F7]">
          <AuthHeader />
        </div>
      }
    >
      <NoAccessInner />
    </Suspense>
  )
}