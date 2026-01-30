"use client"

type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  optional?: boolean
  placeholder?: string
}

export default function OnboardingField({
  label,
  value,
  onChange,
  optional = false,
  placeholder,
}: Props) {
  return (
    <div className="w-[426px] flex flex-col items-start gap-[10px]">
      <div className="w-full flex flex-col items-start gap-[10px] py-[5px]">
        <div className="flex items-center gap-[5px]">
          <span className="font-inter text-[17px] leading-[140%] text-[#262626]">
            {label}
          </span>

          {optional && (
            <span className="font-inter italic text-[14px] leading-[140%] text-[#A5A5A5]">
              – Optional
            </span>
          )}
        </div>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-[426px] h-[40px]
          rounded-[8px]
          border border-[#A5A5A5]/50
          bg-white
          px-[16px] py-[12px]
          font-inter text-[15px] leading-[140%] text-[#262626]
          placeholder:text-[#A5A5A5]
          outline-none
          focus:border-[#262626]/60
        "
      />
    </div>
  )
}
