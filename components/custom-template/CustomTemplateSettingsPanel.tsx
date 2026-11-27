"use client"

import { useRef } from "react"
import Link from "next/link"
import { RefreshCw } from "lucide-react"

import {
  Accordion,
  Checkbox,
  ChipGroup,
  Radio,
  SelectField,
  StatusTextField,
  type FieldStatus,
} from "./CustomTemplateControls"
import {
  BACKGROUND_REQUIREMENTS,
  GRID_COLUMN_OPTIONS,
  GRID_ROW_OPTIONS,
  GRID_RULES,
  IMAGE_FORMATS,
  IMAGE_FORMAT_OPTIONS,
  PROFILE_FIELDS,
  PROFILE_FORMAT_OPTIONS,
  TEMPLATE_NAME_PLACEHOLDER,
  snapGrid,
  type BackgroundMode,
  type CustomTemplateConfig,
  type ProfileFormat,
} from "./customTemplateConfig"

type Props = {
  config: CustomTemplateConfig
  onChange: (patch: Partial<CustomTemplateConfig>) => void
  codeStatus: FieldStatus
  onCodeChange: (code: string) => void
  onBackgroundFile: (mode: BackgroundMode, file: File) => void
  onDone: () => void
  doneLabel?: string
  doneDisabled?: boolean
  examplesHref?: string
  className?: string
}

const SECTION_HEADING = "m-0 font-inter text-[17px] font-semibold leading-[140%] text-[#262626]"
const DIVIDER = "my-[35px] border-0 border-t border-[#D3D3D3]"

function BackgroundSlot({
  mode,
  url,
  selected,
  onSelect,
  onFile,
}: {
  mode: BackgroundMode
  url: string
  selected: boolean
  onSelect: () => void
  onFile: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dark = mode === "dark"
  const label = dark ? "Dark Mode" : "Light Mode"

  return (
    <div className="flex flex-col gap-[9px]">
      <Radio name="template-background-mode" label={label} checked={selected} onChange={onSelect} />

      <div
        className={`relative aspect-[310/223] w-full overflow-hidden rounded-[8px] border ${
          dark ? "border-[#262626] bg-[#262626]" : "border-[#E5E5E5] bg-[#F7F7F7]"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) onFile(file)
        }}
      >
        {url ? <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}

        <button
          type="button"
          aria-label={`${url ? "Replace" : "Upload"} ${label.toLowerCase()} background`}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#A5A5A5]"
        />

        <span aria-hidden="true" className="pointer-events-none absolute right-[12px] top-[12px]">
          <RefreshCw className={`h-4 w-4 ${dark ? "text-white" : "text-[#262626]"}`} strokeWidth={1.5} />
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}

export default function CustomTemplateSettingsPanel({
  config,
  onChange,
  codeStatus,
  onCodeChange,
  onBackgroundFile,
  onDone,
  doneLabel = "Done",
  doneDisabled = false,
  examplesHref = "/explore",
  className = "",
}: Props) {
  const spec = IMAGE_FORMATS[config.imageFormat]
  const gridRule = GRID_RULES[config.profileFormat]

  // Profile layout decides which grid sizes fit; snap if the current one no longer does
  const setProfileFormat = (profileFormat: ProfileFormat) =>
    onChange({ profileFormat, ...snapGrid(profileFormat, config.columns, config.rows) })

  return (
    <aside
      aria-label="Template settings"
      className={`flex w-full flex-col rounded-[15px] bg-white shadow-[2px_2px_15px_rgba(0,0,0,0.06)] ${className}`}
    >
      <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-[20px] pt-[24px]">
        <input
          value={config.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={TEMPLATE_NAME_PLACEHOLDER}
          aria-label="Template name"
          className="w-full bg-transparent font-inter text-[17px] leading-[140%] text-[#262626] outline-none placeholder:text-[#262626]"
        />

        {/* Profile */}
        <section aria-labelledby="ct-profile" className="mt-[30px]">
          <h3 id="ct-profile" className={SECTION_HEADING}>
            Profile
          </h3>
          <div className="mt-[15px]">
            <SelectField
              label="Format"
              value={config.profileFormat}
              options={PROFILE_FORMAT_OPTIONS}
              onChange={setProfileFormat}
            />
          </div>
          <div className="mt-[20px] flex flex-col gap-[14px]">
            {PROFILE_FIELDS.map((f) => (
              <Checkbox
                key={f.key}
                label={f.label}
                checked={f.required ? true : config.profileFields[f.key]}
                disabled={f.required}
                onChange={(checked) =>
                  onChange({ profileFields: { ...config.profileFields, [f.key]: checked } })
                }
              />
            ))}
          </div>
        </section>

        <hr className={DIVIDER} />

        {/* Featured images */}
        <section aria-labelledby="ct-images">
          <h3 id="ct-images" className={SECTION_HEADING}>
            Featured Images
          </h3>
          <div className="mt-[15px]">
            <SelectField
              label="Format"
              value={config.imageFormat}
              options={IMAGE_FORMAT_OPTIONS}
              onChange={(imageFormat) => onChange({ imageFormat })}
            />
          </div>
          <p className="m-0 mt-[15px] font-inter text-[14px] leading-[140%] text-black/40">{spec.recommended}</p>
          <div className="mt-[20px] flex flex-col gap-[17px]">
            <ChipGroup
              label="Columns"
              options={GRID_COLUMN_OPTIONS}
              value={config.columns}
              isDisabled={(n) => !gridRule.columns.includes(n)}
              onChange={(columns) => onChange({ columns })}
            />
            <ChipGroup
              label="Rows"
              options={GRID_ROW_OPTIONS}
              value={config.rows}
              isDisabled={(n) => !gridRule.rows.includes(n)}
              onChange={(rows) => onChange({ rows })}
            />
          </div>
        </section>

        <hr className={DIVIDER} />

        {/* Background */}
        <section aria-labelledby="ct-background">
          <div className="flex items-center justify-between">
            <h3 id="ct-background" className={SECTION_HEADING}>
              Background
            </h3>
            <Link
              href={examplesHref}
              target="_blank"
              className="font-inter text-[12px] leading-[140%] text-black/40 underline underline-offset-2 hover:text-black/60"
            >
              Examples
            </Link>
          </div>

          <div className="mt-[15px]">
            <Accordion title="Requirements">
              <ul className="m-0 flex list-disc flex-col gap-[4px] pl-[20px] font-inter text-[15px] leading-[140%] text-[#262626]">
                {BACKGROUND_REQUIREMENTS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Accordion>
          </div>

          <div className="mt-[20px] flex flex-col gap-[20px]">
            <BackgroundSlot
              mode="light"
              url={config.lightBackgroundUrl}
              selected={config.backgroundMode === "light"}
              onSelect={() => onChange({ backgroundMode: "light" })}
              onFile={(file) => onBackgroundFile("light", file)}
            />
            <BackgroundSlot
              mode="dark"
              url={config.darkBackgroundUrl}
              selected={config.backgroundMode === "dark"}
              onSelect={() => onChange({ backgroundMode: "dark" })}
              onFile={(file) => onBackgroundFile("dark", file)}
            />
          </div>
        </section>

        <hr className={DIVIDER} />

        {/* Template code */}
        <section aria-labelledby="ct-code">
          <h3 id="ct-code" className={SECTION_HEADING}>
            Template Code
          </h3>
          <div className="mt-[15px]">
            <StatusTextField
              id="template-code"
              label="Template code"
              value={config.templateCode}
              onChange={onCodeChange}
              status={codeStatus}
              hint="Only letters, numbers, and “-” are allowed."
            />
          </div>
          <p className="m-0 mt-[10px] font-inter text-[15px] leading-[140%] text-black/40">
            Applicants will use this code to access your portfolio template. Applicants can only submit your portfolio
            template to your forms.
          </p>
        </section>
      </div>

      {/* Pinned footer */}
      <div className="px-5 pb-[10px] pt-[15px]">
        <button
          type="button"
          onClick={onDone}
          disabled={doneDisabled}
          className="h-[45px] w-full cursor-pointer rounded-[10px] bg-[#262626] font-inter text-[20px] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {doneLabel}
        </button>
      </div>
    </aside>
  )
}