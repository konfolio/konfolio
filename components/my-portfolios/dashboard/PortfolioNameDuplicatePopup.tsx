"use client"

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  message?: string
  attemptedName?: string
}

export default function PortfolioNameDuplicatePopup({
  open,
  onClose,
  title = "Konfolio name already in use",
  message = "This Konfolio name is already taken. Please choose a different name.",
  attemptedName,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[calc(100%-32px)] w-[420px] rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="text-[18px] font-semibold text-[#262626]">{title}</div>

        <div className="mt-2 text-[14px] leading-[140%] text-[#6B6B6B]">
          {message}
        </div>

        {attemptedName ? (
          <div className="mt-3 rounded-[12px] bg-[#F7F7F7] px-3 py-2 text-[14px] text-[#262626] break-all">
            {attemptedName}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] rounded-[999px] bg-[#262626] px-4 text-[14px] text-white cursor-pointer"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  )
}