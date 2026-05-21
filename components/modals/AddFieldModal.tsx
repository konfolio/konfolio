"use client";

import { FIELD_TYPES } from "../buttons/AddFieldButton";

export default function AddFieldModal({
  onSelect,
  onClose,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[16px] w-full max-w-[480px] px-[32px] py-[32px] relative shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[20px] text-[#A5A5A5] hover:text-[#262626]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h3 className="text-[16px] font-medium text-[#262626] mb-[20px]">
          Add a question
        </h3>

        <div className="flex flex-col gap-[8px]">
          {FIELD_TYPES.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              className="flex items-center gap-[14px] px-[16px] py-[12px] rounded-[10px] border border-[#E9E9E9] hover:border-[#C0BDB4] hover:bg-[#F7F7F7] text-left"
            >
              <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F7F7F7] flex items-center justify-center shrink-0">
                {type === "short_text" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 5h12M2 8h8M2 11h10"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "long_text" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4h12M2 7h12M2 10h12M2 13h6"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "radio" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle
                      cx="5"
                      cy="5"
                      r="2.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <circle
                      cx="5"
                      cy="11"
                      r="2.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M9 5h5M9 11h5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "checkbox" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="3.5"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <rect
                      x="2"
                      y="9.5"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M9 6h5M9 12h5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {type === "dropdown" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="4"
                      width="12"
                      height="8"
                      rx="2"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M6 8l2 2 2-2"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {type === "date" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="11"
                      rx="1.5"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5 2v2M11 2v2M2 7h12"
                      stroke="#A5A5A5"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[14px] text-[#262626]">{label}</p>
                <p className="text-[12px] text-[#A5A5A5]">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
