"use client";

import type { ComponentType } from "react";
import PencilIcon from "@/components/icons/PencilIcon";
import InvoiceIcon from "@/components/icons/InvoiceIcon";

export type CreateOption = "form" | "invoice";

const OPTIONS: {
  id: CreateOption;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    id: "form",
    label: "Form",
    description: "Accept & review applications and optional payment",
    icon: PencilIcon, // ← the component itself, no quotes
  },
  {
    id: "invoice",
    label: "Invoice",
    description: "Send payment requirement & track transactions",
    icon: (props) => <InvoiceIcon {...props} strokeWidth={1.7} />,
  },
];

type Props = {
  onSelect: (option: CreateOption) => void;
  className?: string;
};

export default function CreateExpand({ onSelect, className = "" }: Props) {
  return (
    <div
      role="menu"
      className={`flex w-[245px] flex-col rounded-[15px] bg-white p-[10px] shadow-[2px_2px_10px_rgba(0,0,0,0.1)] ${className}`}
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon; // must start with a capital letter to render
        return (
          <button
            key={opt.id}
            type="button"
            role="menuitem"
            onClick={() => onSelect(opt.id)}
            className="flex w-full items-start gap-[10px] rounded-[10px] p-[10px] text-left transition-colors hover:bg-black/5 focus:outline-none focus-visible:bg-black/5"
          >
            <Icon className="mt-[5px] size-[14px] shrink-0 text-[#262626]" />
            <span className="flex min-w-0 flex-1 flex-col gap-[2px] py-[2px] font-inter">
              <span className="text-[15px] leading-[1.4] text-[#262626]">{opt.label}</span>
              <span className="text-[13px] leading-[1.3] text-black/40">{opt.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}