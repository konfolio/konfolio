"use client";

import { useState } from "react";

const MAX_APPLICATIONS = 250;

type Props = {
  formTitle: string;
  formId: string;
  applicationsCount: number;
  onClose: () => void;
};

export default function SetLimitModal({
  formTitle,
  formId,
  applicationsCount,
  onClose,
}: Props) {
  const [receivingEnabled, setReceivingEnabled] = useState(false);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [receivingLimit, setReceivingLimit] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_limit:
            receivingEnabled && receivingLimit !== ""
              ? Number(receivingLimit)
              : null,
          is_open:
            timeLimitEnabled && timeLimit
              ? new Date(timeLimit) > new Date()
              : true,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to save");
        return;
      }

      onClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[680px] rounded-[16px] bg-white px-[48px] py-[48px] shadow-[0_20px_60px_-5px_#0000001a]">
        <button
          type="button"
          aria-label="Close"
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

        <div className="mb-[40px] flex flex-col gap-[6px]">
          <h2 className="text-[20px] text-[#262626]">
            Set Limit to <span className="font-semibold">{formTitle}</span>
          </h2>

          <p className="text-[14px] text-[#262626]">
            {applicationsCount}{" "}
            {applicationsCount === 1 ? "Application" : "Applications"}
          </p>

          <p className="text-[13px] text-[#C0BDB4]">
            Form will close when either limit is reached.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[24px]">
          {/* Receiving Limit */}
          <div className="flex flex-col gap-[12px]">
            <label className="flex cursor-pointer items-center gap-[8px]">
              <input
                type="checkbox"
                checked={receivingEnabled}
                onChange={(e) => setReceivingEnabled(e.currentTarget.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-[20px] w-[20px] items-center justify-center rounded-[4px] border peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
                  receivingEnabled
                    ? "border-[#262626] bg-[#262626]"
                    : "border-[#C0BDB4] bg-white"
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
              </span>
              <span className="text-[14px] text-[#262626]">
                Receiving Limit
              </span>
            </label>

            <div className="flex h-[48px] overflow-hidden rounded-[10px] border border-[#E9E9E9] bg-white">
              <input
                type="number"
                min={0}
                max={MAX_APPLICATIONS}
                step={1}
                aria-label="Maximum applications"
                placeholder="250"
                disabled={!receivingEnabled}
                value={receivingLimit}
                onChange={(e) => {
                  const value = e.currentTarget.valueAsNumber;

                  if (!Number.isFinite(value)) {
                    setReceivingLimit("");
                    return;
                  }

                  const limit = Math.min(
                    MAX_APPLICATIONS,
                    Math.max(0, Math.trunc(value)),
                  );
                  setReceivingLimit(String(limit));
                }}
                className="min-w-0 flex-1 px-[14px] text-[14px] text-[#262626] outline-none placeholder:text-[#C0BDB4] disabled:opacity-40"
              />
              <div className="flex w-[180px] shrink-0 items-center border-r border-[#E9E9E9] text-[14px] text-[#C0BDB4]">
                <span>
                  Maximum applications
                </span>
              </div>
            </div>
          </div>

          {/* Time Limit */}
          <div className="flex flex-col gap-[12px]">
            <label className="flex cursor-pointer items-center gap-[8px]">
              <input
                type="checkbox"
                checked={timeLimitEnabled}
                onChange={(e) => setTimeLimitEnabled(e.currentTarget.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-[20px] w-[20px] items-center justify-center rounded-[4px] border peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
                  timeLimitEnabled
                    ? "border-[#262626] bg-[#262626]"
                    : "border-[#C0BDB4] bg-white"
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
              </span>
              <span className="text-[14px] text-[#262626]">Time Limit</span>
            </label>

            <div className="relative">
              <input
                type="date"
                aria-label="Time limit date"
                disabled={!timeLimitEnabled}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.currentTarget.value)}
                className="h-[48px] w-full rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] pr-[40px] text-[14px] text-[#262626] outline-none disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-[16px] text-[13px] text-rose-500">{error}</p>
        )}

        <div className="mt-[32px] flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-[44px] rounded-full bg-[#262626] px-[32px] text-[14px] text-white hover:opacity-80 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}