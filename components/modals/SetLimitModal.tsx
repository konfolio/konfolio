"use client";

import { useState } from "react";

type Props = {
  formTitle: string;
  applicationsCount: number;
  onClose: () => void;
};

export default function SetLimitModal({
  formTitle,
  applicationsCount,
  onClose,
}: Props) {
  const [receivingEnabled, setReceivingEnabled] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-white/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[16px] w-full max-w-[680px] px-[48px] py-[48px] relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[24px] text-[#A5A5A5] hover:text-[#262626]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3 3l12 12M15 3L3 15"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-[6px] mb-[40px]">
          <h2 className="text-[20px] text-[#262626]">
            Set Limit to <span className="font-semibold">{formTitle}</span>
          </h2>
          <p className="text-[14px] text-[#262626]">
            {String(applicationsCount).padStart(3, "0")} Applications
          </p>
          <p className="text-[13px] text-[#C0BDB4]">
            Form will close when either limit is reached.
          </p>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-[24px]">
          {/* Receiving Limit */}
          <div className="flex flex-col gap-[12px]">
            <label className="flex items-center gap-[8px] cursor-pointer">
              <div
                onClick={() => setReceivingEnabled(!receivingEnabled)}
                className={`w-[20px] h-[20px] rounded-[4px] border flex items-center justify-center cursor-pointer ${
                  receivingEnabled
                    ? "bg-[#262626] border-[#262626]"
                    : "bg-white border-[#C0BDB4]"
                }`}
              >
                {receivingEnabled && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[14px] text-[#262626]">
                Receiving Limit
              </span>
            </label>
            <div className="flex h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white overflow-hidden">
              <div className="w-[56px] flex items-center justify-center border-r border-[#E9E9E9] text-[14px] text-[#C0BDB4]">
                0
              </div>
              <input
                type="text"
                placeholder="Maximum Applications"
                disabled={!receivingEnabled}
                className="flex-1 px-[14px] text-[14px] text-[#262626] placeholder:text-[#C0BDB4] outline-none disabled:opacity-40"
              />
            </div>
          </div>

          {/* Time Limit */}
          <div className="flex flex-col gap-[12px]">
            <label className="flex items-center gap-[8px] cursor-pointer">
              <div
                onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
                className={`w-[20px] h-[20px] rounded-[4px] border flex items-center justify-center cursor-pointer ${
                  timeLimitEnabled
                    ? "bg-[#262626] border-[#262626]"
                    : "bg-white border-[#C0BDB4]"
                }`}
              >
                {timeLimitEnabled && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[14px] text-[#262626]">Time Limit</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                disabled={!timeLimitEnabled}
                className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] pr-[40px] text-[14px] text-[#262626] placeholder:text-[#C0BDB4] outline-none disabled:opacity-40"
              />
              <svg
                className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="11"
                  rx="1.5"
                  stroke="#C0BDB4"
                  strokeWidth="1.2"
                />
                <path
                  d="M5 2v2M11 2v2M2 7h12"
                  stroke="#C0BDB4"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
