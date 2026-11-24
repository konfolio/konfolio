"use client";

import { useState } from "react";

export default function IfYesAccordion() {
  const [open, setOpen] = useState(false);
  const [hasPartner, setHasPartner] = useState<string | null>(null);

  return (
    <div className="w-full bg-white rounded-[12px] border-[0.5px] border-[#E9E9E9] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-[20px] py-[16px] flex items-center gap-[10px] hover:opacity-70"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="#A5A5A5"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[14px] text-[#A5A5A5]">If &quot;yes&quot;</span>
      </button>

      {open && (
        <div className="px-[20px] pb-[28px] flex flex-col gap-[24px] border-t border-[#F3F3F3]">
          <div className="flex flex-col gap-[12px] pt-[24px]">
            <label className="text-[14px] text-[#262626]">
              Do you have a partner? <span className="text-[#C0BDB4]">*</span>
            </label>
            {["Yes, I have a partner.", "No, I need a partner."].map(
              (option) => (
                <label
                  key={option}
                  className="flex items-center gap-[10px] cursor-pointer"
                >
                  <div
                    onClick={() => setHasPartner(option)}
                    className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${
                      hasPartner === option
                        ? "border-[#262626]"
                        : "border-[#C0BDB4]"
                    }`}
                  >
                    {hasPartner === option && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#262626]" />
                    )}
                  </div>
                  <span className="text-[14px] text-[#262626]">{option}</span>
                </label>
              ),
            )}
          </div>

          <p className="text-[14px] text-[#C0BDB4]">
            Table partner information:
          </p>

          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">First Name</label>
              <input
                type="text"
                disabled
                className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] outline-none cursor-default"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">Last Name</label>
              <input
                type="text"
                disabled
                className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] outline-none cursor-default"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">
                Preferred Name
              </label>
              <input
                type="text"
                disabled
                className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] outline-none cursor-default"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">
                Business Name
              </label>
              <input
                type="text"
                disabled
                className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] outline-none cursor-default"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="text-[14px] text-[#262626]">Email</label>
              <input
                type="text"
                disabled
                className="h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] text-[14px] text-[#C0BDB4] outline-none cursor-default"
              />
            </div>
          </div>

          <p className="text-[13px] text-[#C0BDB4]">
            Please fill in the application jointly and as accurately as
            possible.
          </p>
        </div>
      )}
    </div>
  );
}
