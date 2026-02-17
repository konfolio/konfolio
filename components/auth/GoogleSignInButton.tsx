"use client"

import { useState } from "react"
import { inknut } from "@/app/fonts"
import { supabase } from "@/lib/supabaseClient"
import GoogleLogo from "@/components/icons/GoogleLogo"

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      })
      if (error) throw error
    } catch (e) {
      console.error("Google sign-in failed:", e)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div
        className="
          bg-white
          shadow-[8px_8px_50px_rgba(0,0,0,0.05)]
          rounded-[15px]

          w-[802px]
          h-[440px]

          flex flex-col
          justify-between
          items-center
          py-[50px]
        "
      >
        {/* Logo */}
        <div className="w-[124px] h-[27.56px] flex items-center justify-center">
          <span
            className={`
              ${inknut.className}
              text-[26.7475px]
              font-semibold
              tracking-[-0.02em]
              leading-[69px]
              text-[#262626]
            `}
            style={{ WebkitTextStroke: "1.05132px #262626" }}
          >
            konfolio
          </span>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="
            box-border
            flex items-center
            justify-start
            gap-[13px]

            w-[600px]
            h-[65.51px]

            px-[30px]
            py-[20px]

            border-[0.5px]
            border-[#A5A5A5]
            rounded-[100px]
            bg-white

            disabled:opacity-60
          "
        >
          {/* Left icon */}
          <div className="flex-none w-[25px] h-[25.51px] flex items-center justify-center">
            <GoogleLogo />
          </div>

          {/* Centered text */}
          <div className="flex-1 text-center">
            <span className="text-[17px] leading-[140%] text-[#3C4043] font-normal">
              {loading ? "Signing in..." : "Sign in with Google"}
            </span>
          </div>
        </button>

        {/* OR + Create Account */}
        <div className="flex flex-col items-center gap-[20px] w-[122px]">
          <div className="text-[14px] leading-[130%] text-[#A5A5A5]">
            – OR –
          </div>

          <a
            href="https://accounts.google.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] leading-[130%] text-[#262626] underline"
          >
            Create an account
          </a>
        </div>
      </div>
    </div>
  )
}
