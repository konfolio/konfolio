"use client"

import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"

export type Mode = "editing" | "published"


type Draft = {
  /** true once storage rehydrate has completed (success OR failure) */
  hasHydrated: boolean

  // access
  mode?: Mode

  // free response
  shortResponse: string
  konfolioLink: string
  date: string
  longResponse: string

  // options response
  radio: string[]
  checkbox: string[]
  dropdown: string[]

  // text
  text: string

  // images & files


  // divider

}

type Actions = {
  // access
  setMode: (mode: Mode) => void
  setModeAndResetFlow: (mode: Mode) => void

  // free response
  setShortResponse: (v: string) => void
  setKonfolioLink: (v: string) => void
  setDate: (v: string) => void
  setLongResponse: (v: string) => void

  // options response
  setRadio: (v: string[]) => void
  setCheckbox: (v: string[]) => void
  setDropdown: (v: string[]) => void

  // text
  setText: (v: string) => void

  // images & files


  // divider


  /** Manually trigger persist rehydrate + ensure hasHydrated flips */
  forceHydrate: () => Promise<void>  
    
}

const initialDraft: Draft = {
  hasHydrated: false,

  mode: undefined,

  // free response
  shortResponse: "",
  konfolioLink: "",
  date: "",
  longResponse: "",

  // options response
  radio: [],
  checkbox: [],
  dropdown: [],
  
  // text
  text: "",

  // images & files

}

export const useQuestionDraft = create<Draft & Actions>()(
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

      },

      // free response
      setShortResponse: (v: any) => set({ shortResponse: v }),
      setKonfolioLink: (v: any) => set({ konfolioLink: v }),
      setDate: (v: any) => set({ date: v }),
      setLongResponse: (v: any) => set({ longResponse: v }),

      // options response
      setRadio: (v: any) => set({ radio: v }),
      setCheckbox: (v: any) => set({ checkbox: v }),
      setDropdown: (v: any) => set({ dropdown: v }),

      // text
      setText: (v: string) => set({ text: v }),

    }),
    {
      name: "question-draft",

      onRehydrateStorage: () => (_state, _error) => {
        // ensure link keys are clamped after hydrate too
        const s = useQuestionDraft.getState()
        useQuestionDraft.setState({
          hasHydrated: true,
        })
      },
    }
  )
)
