"use client";

import { AppRow } from "./ApplicationsTable";

function applicantName(a: AppRow) {
  return (
    a.applicant.businessName ||
    a.applicant.displayName ||
    [a.applicant.firstName, a.applicant.lastName].filter(Boolean).join(" ").trim() ||
    "Applicant"
  );
}

export default function ApplicantsExpand({
  applicants,
  currentAppId,
  onSelect,
}: {
  applicants: AppRow[];
  currentAppId: string;
  onSelect: (app: AppRow) => void;
}) {
  return (
    <div className="flex w-[240px] flex-col gap-[8px]">
      <p className="px-[4px] text-[12px] text-[#A5A5A5]">Applicants Expand</p>

      <div className="max-h-[280px] overflow-y-auto rounded-[16px] border border-[#E9E9E9] bg-white py-[6px] shadow-xl">
        {applicants.length === 0 && (
          <p className="px-[14px] py-[10px] text-[13px] text-[#A5A5A5]">
            No other applicants.
          </p>
        )}

        {applicants.map((a, idx) => {
          const name = applicantName(a);
          const isCurrent = a.id === currentAppId;

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a)}
              className={`flex w-full items-center justify-between gap-[10px] px-[14px] py-[8px] text-left hover:bg-[#F7F7F7] ${
                isCurrent ? "bg-[#F7F7F7]" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-[8px]">
                <div className="h-[22px] w-[22px] shrink-0 overflow-hidden rounded-full bg-[#E9E9E9]">
                  {a.applicant.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.applicant.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-[#A5A5A5]">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="truncate text-[13px] text-[#262626]">{name}</span>
              </div>

              <span className="shrink-0 text-[13px] text-[#A5A5A5]">{idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
