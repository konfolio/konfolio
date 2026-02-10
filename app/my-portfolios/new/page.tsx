// app/my-portfolios/new/page.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import Navbar from "@/components/Navbar"
import CreateKonfolioCard from "@/components/my-portfolios/CreateKonfolioCard"

import { useOnboardingDraft } from "@/stores/onboardingDraft"
import { useKonfolioDraftStore } from "@/stores/konfolioDraftStore"
import { createDraftFromProfile } from "@/components/my-portfolios/editor/adapters/fromProfile"
import { fromOnboardingToSquareDraft } from "@/components/my-portfolios/editor/adapters/fromOnboarding"

type TemplateType = "square" | "portrait"

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())
}

function parseTemplateParam(v: string | null): TemplateType | null {
  if (!v) return null
  if (v === "square" || v === "portrait") return v
  return null
}

function hasMeaningfulOnboarding(o: any) {
  return (
    !!String(o.businessName ?? "").trim() ||
    !!String(o.preferredName ?? "").trim() ||
    !!String(o.firstName ?? "").trim() ||
    !!String(o.lastName ?? "").trim() ||
    !!String(o.location ?? "").trim() ||
    (o.merchTags?.length ?? 0) > 0 ||
    (o.prevVends?.length ?? 0) > 0 ||
    (o.activeLinkKeys?.length ?? 0) > 0 ||
    !!String(o.profilePreviewUrl ?? "").trim() ||
    !!String(o.email ?? "").trim()
  )
}

export default function NewKonfolioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Onboarding store hydration
  const hasOnboardingHydrated = useOnboardingDraft((s) => s.hasHydrated)
  const forceOnboardingHydrate = useOnboardingDraft((s) => s.forceHydrate)

  // Konfolio drafts store hydration
  const hasKonfolioHydrated = useKonfolioDraftStore((s) => s.hasHydrated)
  const forceKonfolioHydrate = useKonfolioDraftStore((s) => s.forceHydrate)

  const setDraft = useKonfolioDraftStore((s) => s.setDraft)

  const [ready, setReady] = useState(false)

  // Read template from query string if present
  const templateFromQuery = useMemo(() => parseTemplateParam(searchParams.get("template")), [searchParams])

  // Prevent double-create in dev strict mode / fast refresh
  const didAutoCreateRef = useRef(false)

  // Hydrate both stores on mount
  useEffect(() => {
    let alive = true

    const run = async () => {
      if (!hasOnboardingHydrated) {
        try {
          await forceOnboardingHydrate()
        } catch {
          // ignore
        }
      }

      if (!hasKonfolioHydrated) {
        try {
          await forceKonfolioHydrate()
        } catch {
          // ignore
        }
      }

      if (!alive) return
      setReady(true)
    }

    run()

    // Failsafe: don't hang forever
    const t = window.setTimeout(() => {
      if (!alive) return
      setReady(true)
    }, 500)

    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [
    hasOnboardingHydrated,
    forceOnboardingHydrate,
    hasKonfolioHydrated,
    forceKonfolioHydrate,
  ])

  const createAndGo = (template: TemplateType) => {
    const id = makeId()

    if (template === "square") {
      const o = useOnboardingDraft.getState()

      // If onboarding has real values, autofill from onboarding.
      // Otherwise, fall back to profile-based defaults (so you don't get placeholders).
      const draft = hasMeaningfulOnboarding(o)
        ? fromOnboardingToSquareDraft({
            id,
            onboarding: {
              firstName: o.firstName,
              lastName: o.lastName,
              preferredName: o.preferredName,
              businessName: o.businessName,
              location: o.location,
              prevVends: o.prevVends,
              merchTags: o.merchTags,
              activeLinkKeys: o.activeLinkKeys as any,
              links: o.links as any,
              profilePreviewUrl: o.profilePreviewUrl || null,
              email: (o as any).email ?? null,
            },
          })
        : createDraftFromProfile({ id, template: "square" })

      // New konfolio: always overwrite for this new id
      setDraft(id, draft)
      router.push(`/my-portfolios/${id}/edit`)
      return
    }

    // Portrait placeholder
    const draft = createDraftFromProfile({ id, template: "portrait" })
    setDraft(id, draft)
    router.push(`/my-portfolios/${id}/edit`)
  }

  // Auto-create if query param exists.
  useEffect(() => {
    if (!ready) return
    if (!templateFromQuery) return
    if (didAutoCreateRef.current) return

    // IMPORTANT: Only auto-create once onboarding has hydrated,
    // otherwise we will build the square draft with placeholders.
    if (!hasOnboardingHydrated) return

    didAutoCreateRef.current = true
    createAndGo(templateFromQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, templateFromQuery, hasOnboardingHydrated])

  if (!ready) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-61px)] flex items-center justify-center">
          <p className="font-inter text-[14px] text-[#A5A5A5]">Loading…</p>
        </main>
      </>
    )
  }

  // If query param existed, we already auto-created; render nothing while pushing route
  if (templateFromQuery) return null

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-61px)] flex justify-center pt-[60px] pb-[80px]">
        <CreateKonfolioCard
          title="Create your first Konfolio"
          onPickTemplate={(t) => createAndGo(t)}
          disabled={!hasOnboardingHydrated}
        />
      </main>
    </>
  )
}
