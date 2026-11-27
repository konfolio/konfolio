"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import Navbar from "@/components/Navbar"
import ArrowLeft from "@/components/icons/ArrowLeft"
import SecondaryButton from "@/components/buttons/SecondaryButton"

import CustomTemplatePreview from "@/components/custom-template/CustomTemplatePreview"
import CustomTemplateSettingsPanel from "@/components/custom-template/CustomTemplateSettingsPanel"
import type { FieldStatus } from "@/components/custom-template/CustomTemplateControls"
import {
  DEFAULT_CONFIG,
  sanitizeTemplateCode,
  snapGrid,
  type BackgroundMode,
  type CustomTemplateConfig,
  type CustomTemplateFiles,
} from "@/components/custom-template/customTemplateConfig"

type Props = {
  organizationName: string
  initialConfig?: Partial<CustomTemplateConfig>
  onBack?: () => void
  helpHref?: string
  examplesHref?: string
  /** Must be stable (wrap in useCallback). Resolve true if the code is free. */
  checkCodeAvailable?: (code: string) => Promise<boolean>
  /** Save draft: no validation. */
  onSave?: (config: CustomTemplateConfig, files: CustomTemplateFiles) => Promise<void> | void
  /** Finish: requires an available template code. */
  onDone?: (config: CustomTemplateConfig, files: CustomTemplateFiles) => Promise<void> | void
}

const ACCEPTED_BACKGROUND_TYPES = ["image/png", "image/svg+xml"]

function initConfig(initial?: Partial<CustomTemplateConfig>): CustomTemplateConfig {
  const merged = { ...DEFAULT_CONFIG, ...initial }
  // Make sure a saved grid is valid for its profile layout
  return { ...merged, ...snapGrid(merged.profileFormat, merged.columns, merged.rows) }
}

export default function CustomTemplateBuilder({
  organizationName,
  initialConfig,
  onBack,
  helpHref = "/help",
  examplesHref,
  checkCodeAvailable,
  onSave,
  onDone,
}: Props) {
  const router = useRouter()

  const [config, setConfig] = useState<CustomTemplateConfig>(() => initConfig(initialConfig))
  const patch = useCallback((p: Partial<CustomTemplateConfig>) => setConfig((c) => ({ ...c, ...p })), [])
  const setSlotLabel = useCallback((index: number, value: string) => {
    setConfig((c) => {
      const slotLabels = [...c.slotLabels]
      slotLabels[index] = value
      return { ...c, slotLabels }
    })
  }, [])

  /* ---------- background files ---------- */
  const filesRef = useRef<CustomTemplateFiles>({})
  const objectUrls = useRef<string[]>([])

  useEffect(() => {
    const urls = objectUrls.current
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const handleBackgroundFile = (mode: BackgroundMode, file: File) => {
    if (!ACCEPTED_BACKGROUND_TYPES.includes(file.type)) return
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    filesRef.current[mode] = file
    patch(mode === "light" ? { lightBackgroundUrl: url } : { darkBackgroundUrl: url })
  }

  /* ---------- template code ---------- */
  const [codeStatus, setCodeStatus] = useState<FieldStatus>("hint")
  const [showRequired, setShowRequired] = useState(false)

  useEffect(() => {
    const code = config.templateCode
    if (!code) {
      setCodeStatus(showRequired ? "required" : "hint")
      return
    }
    if (!checkCodeAvailable) {
      setCodeStatus("hint")
      return
    }

    setCodeStatus("checking")
    let alive = true
    const t = window.setTimeout(async () => {
      try {
        const available = await checkCodeAvailable(code)
        if (alive) setCodeStatus(available ? "available" : "taken")
      } catch {
        if (alive) setCodeStatus("hint")
      }
    }, 400)

    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [config.templateCode, showRequired, checkCodeAvailable])

  /* ---------- actions ---------- */
  const [busy, setBusy] = useState<"save" | "done" | null>(null)

  const handleSave = async () => {
    if (busy) return
    setBusy("save")
    try {
      await onSave?.(config, filesRef.current)
    } finally {
      setBusy(null)
    }
  }

  const handleDone = async () => {
    if (busy) return
    if (!config.templateCode) {
      setShowRequired(true)
      document.getElementById("template-code")?.focus()
      return
    }
    if (codeStatus === "taken" || codeStatus === "checking") {
      document.getElementById("template-code")?.focus()
      return
    }
    setBusy("done")
    try {
      await onDone?.(config, filesRef.current)
    } finally {
      setBusy(null)
    }
  }

    return (
    <div className="flex min-h-dvh w-full flex-col bg-[#F7F7F7] lg:h-dvh">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1550px] max-h-[950px] flex-1 flex-col gap-5 px-5 pb-10 pt-[30px] lg:min-h-0 lg:px-12 lg:pt-[60px]">
        {/* Breadcrumb row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-[15px]">
            <button
              type="button"
              aria-label="Back"
              onClick={() => (onBack ? onBack() : router.back())}
              className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center text-[#262626] [&_path]:stroke-[#262626]"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="m-0 flex list-none flex-wrap items-center gap-x-[10px] p-0 font-inter text-[18px] leading-[140%] text-[#262626] lg:text-[20px]">
                <li>Custom Portfolio Template</li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="truncate">
                  {organizationName}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-[15px]">
            <Link href={helpHref} className="font-inter text-[15px] leading-[140%] text-[#262626] hover:underline">
              Need Help?
            </Link>
            <SecondaryButton
              onClick={handleSave}
              className="h-[25px] min-w-[113px] cursor-pointer border-[#262626] bg-transparent text-[#262626]"
            >
              {busy === "save" ? "Saving…" : "Save"}
            </SecondaryButton>
          </div>
        </div>

        {/* Preview + settings: fills the remaining height on laptop */}
        <div className="flex flex-col gap-5 lg:min-h-0 lg:flex-1 lg:flex-row">
          <CustomTemplatePreview config={config} onChangeSlotLabel={setSlotLabel} className="lg:h-full lg:min-w-0 lg:flex-1" />
          <CustomTemplateSettingsPanel
            config={config}
            onChange={patch}
            codeStatus={codeStatus}
            onCodeChange={(raw) => patch({ templateCode: sanitizeTemplateCode(raw) })}
            onBackgroundFile={handleBackgroundFile}
            onDone={handleDone}
            doneLabel={busy === "done" ? "Saving…" : "Done"}
            doneDisabled={busy !== null}
            examplesHref={examplesHref}
            className="lg:h-full lg:w-[347px] lg:shrink-0"
          />
        </div>
      </div>
    </div>
  )
}