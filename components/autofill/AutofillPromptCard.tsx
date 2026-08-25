"use client";

import Image from "next/image";
import { useAutofillProfile } from "@/hooks/useAutofillProfile";

export default function AutofillPromptCard({
  onClick,
}: {
  onClick: () => void;
}) {
  const { displayName, businessName, avatarUrl } = useAutofillProfile();
  const name = businessName || displayName;

  return (
    <div className="hidden md:flex items-center justify-between gap-[16px] bg-white rounded-[14px] px-[20px] py-[14px]">
      <div className="flex items-center gap-[12px] min-w-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Your avatar"
            width={36}
            height={36}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-[36px] h-[36px] rounded-full bg-[#E9E9E9] shrink-0" />
        )}
        <span className="text-[14px] text-[#262626] truncate">
          {name}
        </span>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-[6px] h-[34px] px-[16px] rounded-full bg-[#262626] text-[13px] text-white hover:opacity-80 shrink-0"
      >
        Autofill
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.5l1.1 3.4L12.5 6l-3.4 1.1L8 10.5l-1.1-3.4L3.5 6l3.4-1.1L8 1.5z"
            fill="currentColor"
          />
          <path
            d="M13 9l.6 1.9L15.5 11.5l-1.9.6L13 14l-.6-1.9-1.9-.6 1.9-.6L13 9z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}
