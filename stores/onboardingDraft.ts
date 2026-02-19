"use client"

import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"

export type Mode = "artist" | "host"
export type SalesPermit = "" | "yes" | "no"

export type CollabOption =
  | "Stamp Rally"
  | "Share Table"
  | "Other Collabs"
  | "Not open for collabs"

export type MediaKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky"

const MAX_LINKS = 5

type Draft = {
  /** true once storage rehydrate has completed (success OR failure) */
  hasHydrated: boolean

  // audience
  mode?: Mode

  // name
  firstName: string
  lastName: string
  preferredName: string // artist
  organization: string // host
  acceptedTerms: boolean

  // artist business
  businessName: string
  location: string
  salesPermit: SalesPermit
  willApply: boolean

  // host business
  hostWebsite: string
  orgSize: string
  attendees: string
  eventLocation: string

  // collabs
  collabs: CollabOption[]

  // links
  activeLinkKeys: MediaKey[]
  links: Record<MediaKey, string>

  // merch
  merchTags: string[]

  // prev vends
  firstVend: boolean
  prevVends: string[]

  // profile image (client-only for now; NOT persisted)
  profileFile: File | null
  profilePreviewUrl: string
}

type Actions = {
  // audience
  setMode: (mode: Mode) => void
  setModeAndResetFlow: (mode: Mode) => void

  // name
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setPreferredName: (v: string) => void
  setOrganization: (v: string) => void
  setAcceptedTerms: (v: boolean) => void

  // artist business
  setBusinessName: (v: string) => void
  setLocation: (v: string) => void
  setSalesPermit: (v: SalesPermit) => void
  setWillApply: (v: boolean) => void

  // host business
  setHostWebsite: (v: string) => void
  setOrgSize: (v: string) => void
  setAttendees: (v: string) => void
  setEventLocation: (v: string) => void

  // collabs
  setCollabs: (v: CollabOption[]) => void

  // links
  setActiveLinkKeys: (keys: MediaKey[]) => void
  setLinkValue: (key: MediaKey, value: string) => void
  clearLinkKey: (key: MediaKey) => void
  resetLinks: () => void

  // merch
  setMerchTags: (v: string[]) => void

  // prev vends
  setFirstVend: (v: boolean) => void
  setPrevVends: (v: string[]) => void

  // profile
  setProfileFile: (file: File | null, previewUrl: string) => void
  clearProfile: () => void

  // global
  resetDraft: () => void

  /** Manually trigger persist rehydrate + ensure hasHydrated flips */
  forceHydrate: () => Promise<void>
}

const emptyLinks: Record<MediaKey, string> = {
  website: "",
  shop: "",
  instagram: "",
  x: "",
  facebook: "",
  tumblr: "",
  pixiv: "",
  bluesky: "",
}

const initialDraft: Draft = {
  hasHydrated: false,

  mode: undefined,

  firstName: "",
  lastName: "",
  preferredName: "",
  organization: "",
  acceptedTerms: false,

  businessName: "",
  location: "",
  salesPermit: "",
  willApply: false,

  hostWebsite: "",
  orgSize: "",
  attendees: "",
  eventLocation: "",

  collabs: [],

  activeLinkKeys: [],
  links: emptyLinks,

  merchTags: [],

  firstVend: false,
  prevVends: [],

  profileFile: null,
  profilePreviewUrl: "",
}

// ---- Safe LOCAL storage wrapper (never undefined) ----
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      if (typeof window === "undefined") return null
      return window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window === "undefined") return
      window.localStorage.setItem(name, value)
    } catch {
      // ignore
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window === "undefined") return
      window.localStorage.removeItem(name)
    } catch {
      // ignore
    }
  },
}

// Ensure keys are unique, in-order, and capped
function clampActiveLinkKeys(keys: MediaKey[]) {
  const out: MediaKey[] = []
  const seen = new Set<MediaKey>()
  for (const k of keys) {
    if (seen.has(k)) continue
    seen.add(k)
    out.push(k)
    if (out.length >= MAX_LINKS) break
  }
  return out
}

export const useOnboardingDraft = create<Draft & Actions>()(
  persist(
    (set, get, api) => ({
      ...initialDraft,

      // manual rehydrate helper
      forceHydrate: async () => {
        try {
          const p = (api as any).persist
          if (p?.rehydrate) await p.rehydrate()
        } finally {
          set({ hasHydrated: true })
        }
      },

      // audience
      setMode: (mode) => set({ mode }),

      setModeAndResetFlow: (mode) => {
        const prevMode = get().mode
        set({ mode })

        if (!prevMode || prevMode === mode) return

        if (mode === "artist") {
          set({
            organization: "",
            hostWebsite: "",
            orgSize: "",
            attendees: "",
            eventLocation: "",
          })
        } else {
          set({
            preferredName: "",

            businessName: "",
            location: "",
            salesPermit: "",
            willApply: false,

            collabs: [],
            merchTags: [],

            firstVend: false,
            prevVends: [],
          })
        }
      },

      // name
      setFirstName: (v) => set({ firstName: v }),
      setLastName: (v) => set({ lastName: v }),
      setPreferredName: (v) => set({ preferredName: v }),
      setOrganization: (v) => set({ organization: v }),
      setAcceptedTerms: (v) => set({ acceptedTerms: v }),

      // artist business
      setBusinessName: (v) => set({ businessName: v }),
      setLocation: (v) => set({ location: v }),
      setSalesPermit: (v) => set({ salesPermit: v }),
      setWillApply: (v) => set({ willApply: v }),

      // host business
      setHostWebsite: (v) => set({ hostWebsite: v }),
      setOrgSize: (v) => set({ orgSize: v }),
      setAttendees: (v) => set({ attendees: v }),
      setEventLocation: (v) => set({ eventLocation: v }),

      // collabs
      setCollabs: (v) => set({ collabs: v }),

      // links
      setActiveLinkKeys: (keys) => set({ activeLinkKeys: clampActiveLinkKeys(keys) }),

      setLinkValue: (key, value) => {
        const nextLinks = { ...get().links, [key]: value }
        // If they typed into a link that isn't active yet, auto-activate it (still capped).
        // This helps prevent "value set but key not visible" edge cases.
        const curKeys = get().activeLinkKeys
        const nextKeys = curKeys.includes(key) ? curKeys : clampActiveLinkKeys([...curKeys, key])
        set({ links: nextLinks, activeLinkKeys: nextKeys })
      },

      clearLinkKey: (key) => {
        const { links, activeLinkKeys } = get()
        set({
          activeLinkKeys: activeLinkKeys.filter((k) => k !== key),
          links: { ...links, [key]: "" },
        })
      },

      resetLinks: () => set({ activeLinkKeys: [], links: emptyLinks }),

      // merch
      setMerchTags: (v) => set({ merchTags: v }),

      // prev vends
      setFirstVend: (v) => set({ firstVend: v }),
      setPrevVends: (v) => set({ prevVends: v }),

      // profile
      setProfileFile: (file, previewUrl) => set({ profileFile: file, profilePreviewUrl: previewUrl }),

      clearProfile: () => {
        const url = get().profilePreviewUrl
        if (url) URL.revokeObjectURL(url)
        set({ profileFile: null, profilePreviewUrl: "" })
      },

      // global
      resetDraft: () => {
        const url = get().profilePreviewUrl
        if (url) URL.revokeObjectURL(url)
        set({ ...initialDraft, hasHydrated: true })
      },
    }),
    {
      name: "konfolio-onboarding-draft",
      storage: createJSONStorage(() => safeLocalStorage),

      partialize: (state) => {
        const { profileFile, profilePreviewUrl, ...rest } = state
        return rest
      },

      onRehydrateStorage: () => (_state, _error) => {
        // ensure link keys are clamped after hydrate too
        const s = useOnboardingDraft.getState()
        useOnboardingDraft.setState({
          hasHydrated: true,
          activeLinkKeys: clampActiveLinkKeys(s.activeLinkKeys),
        })
      },
    }
  )
)
