"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  formTitle: string;
  publicUrl: string;
  formId: string;
  onClose: () => void;
};

export default function PublishFormModal({
  formTitle,
  publicUrl,
  formId,
  onClose,
}: Props) {
  const displayUrl = `konfolio.com${publicUrl}`;
  const absoluteUrl = publicUrl;
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${publicUrl}`
      : displayUrl;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-white/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[16px] w-full max-w-[780px] px-[48px] py-[40px] relative shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
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

        {/* Logo */}
        <div className="flex justify-center mb-[32px]">
          <span
            className="text-[20px] font-bold text-[#262626]"
            style={{ fontFamily: "serif" }}
          >
            konfolio
          </span>
        </div>

        {/* Title */}
        <h2 className="text-center text-[22px] text-[#262626] mb-[32px]">
          <span className="font-bold">{formTitle}</span> has been published!
        </h2>

        {/* Actions */}
        <div className="flex flex-col gap-[12px] mb-[32px]">
          {/* View it live */}
          <div className="flex h-[52px] rounded-full border border-[#E9E9E9] overflow-hidden">
            <div className="w-[140px] flex items-center justify-center bg-[#F7F7F7] border-r border-[#E9E9E9] text-[14px] text-[#262626] shrink-0">
              View it live
            </div>
            <Link
              href={absoluteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-between px-[20px] text-[14px] text-[#262626] hover:opacity-70"
            >
              <span>{displayUrl}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13h8A1.5 1.5 0 0 0 12 11.5V9M9 1h4m0 0v4m0-4L5.5 8.5"
                  stroke="#A5A5A5"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* Copy link */}
          <div className="flex h-[52px] rounded-full border border-[#E9E9E9] overflow-hidden">
            <div className="w-[140px] flex items-center justify-center bg-[#F7F7F7] border-r border-[#E9E9E9] text-[14px] text-[#262626] shrink-0">
              Copy link
            </div>
            <div className="flex-1 flex items-center justify-between px-[20px] text-[14px] text-[#262626]">
              <span>{displayUrl}</span>
              <button
                onClick={handleCopy}
                className="text-[#A5A5A5] hover:text-[#262626] transition-colors"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7l3.5 3.5 6.5-6.5"
                      stroke="#639922"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="4"
                      y="4"
                      width="8"
                      height="8"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M2 10V2.5A1.5 1.5 0 0 1 3.5 1H10"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* View submitted applications */}
        <div className="flex justify-center">
          <Link
            href={`/organizer/forms/${formId}`}
            className="text-[13px] text-[#A5A5A5] hover:text-[#262626]"
          >
            View submitted applications →
          </Link>
        </div>
      </div>
    </div>
  );
}
