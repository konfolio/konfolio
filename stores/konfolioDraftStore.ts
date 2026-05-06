"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { KonfolioDraft } from "@/components/my-portfolios/editor/editorTypes"

type State = {
  hasHydrated: boolean
  forceHydrate: () => Promise<void>

  draftsById: Record<string, KonfolioDraft>

  getDraft: (id: string) => KonfolioDraft | undefined
  initDraftIfMissing: (draft: KonfolioDraft) => void
  setDraft: (id: string, draft: KonfolioDraft) => void
  patchDraft: (id: string, patch: Partial<KonfolioDraft>) => void
  deleteDraft: (id: string) => void
}

function safeLocalStorage() {
  if (typeof window === "undefined") return undefined
  return window.localStorage
}

export const useKonfolioDraftStore = create<State>()(
  persist(
    (set, get) => ({
      hasHydrated: false,

      forceHydrate: async () => {
        await (useKonfolioDraftStore as any).persist?.rehydrate?.()
      },

      draftsById: {},

      getDraft: (id) => get().draftsById[id],

      initDraftIfMissing: (draft) => {
        set((s) => {
          if (s.draftsById[draft.id]) return s

          return {
            ...s,
            draftsById: {
              ...s.draftsById,
              [draft.id]: draft,
            },
          }
        })
      },

      setDraft: (id, draft) => {
        set((s) => ({
          ...s,
          draftsById: {
            ...s.draftsById,
            [id]: draft,
          },
        }))
      },

      patchDraft: (id, patch) => {
        set((s) => {
          const cur = s.draftsById[id]
          if (!cur) return s

          const next: KonfolioDraft = {
            ...cur,
            ...patch,
            template: cur.template,
            updatedAt: Date.now(),
          }

          return {
            ...s,
            draftsById: {
              ...s.draftsById,
              [id]: next,
            },
          }
        })
      },

      deleteDraft: (id) => {
        set((s) => {
          const next = { ...s.draftsById }
          delete next[id]
          return {
            ...s,
            draftsById: next,
          }
        })
      },
    }),
    {
      name: "konfolio_drafts_v1",
      storage: createJSONStorage(() => safeLocalStorage() as Storage),
      partialize: (s) => ({ draftsById: s.draftsById }),
      onRehydrateStorage: () => () => {
        useKonfolioDraftStore.setState({ hasHydrated: true })
      },
    }
  )
)