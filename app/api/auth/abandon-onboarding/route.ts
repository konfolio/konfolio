import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()

  // Authenticated user from cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: true })
  }

  // Check if onboarding is incomplete
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle()

  const onboardingComplete = Boolean(profile?.onboarding_complete)

  // Always sign out (clears cookies)
  await supabase.auth.signOut()

  if (onboardingComplete) {
    return NextResponse.json({ ok: true, deleted: false })
  }

  // Delete the user ONLY if onboarding is not complete
  // Requires service role key on server (never expose to client).
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ add this to .env.local
  )

  // Optional: also delete profile row if you want (depending on your cascade)
  // await admin.from("profiles").delete().eq("id", user.id)

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    // If deletion fails, still ok—user is signed out at least
    return NextResponse.json({ ok: true, deleted: false, deleteError: error.message })
  }

  return NextResponse.json({ ok: true, deleted: true })
}