// proxy.ts
import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const pathname = req.nextUrl.pathname
  const isMyPortfolios =
    pathname === "/my-portfolios" || pathname.startsWith("/my-portfolios/")
  const isMyForms =
    pathname === "/my-forms" || pathname.startsWith("/my-forms/")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("returnTo", pathname)
    return NextResponse.redirect(url)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,onboarding_complete")
    .eq("id", user.id)
    .maybeSingle()

  const onboardingComplete = Boolean(profile?.onboarding_complete)

  if (!onboardingComplete && (isMyPortfolios || isMyForms)) {
    const url = req.nextUrl.clone()
    url.pathname = "/onboarding/audience"
    return NextResponse.redirect(url)
  }

  const role = profile?.role as string | null

  if (role === "vendor" && isMyPortfolios) {
    const url = req.nextUrl.clone()
    url.pathname = "/my-forms"
    return NextResponse.redirect(url)
  }

  if (role !== "vendor" && isMyForms) {
    const url = req.nextUrl.clone()
    url.pathname = "/my-portfolios"
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ["/my-portfolios/:path*", "/my-forms/:path*"],
}
