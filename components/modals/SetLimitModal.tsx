"use client";

import { useState } from "react";

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
  const [receivingEnabled, setReceivingEnabled] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
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
            receivingEnabled && receivingLimit
              ? parseInt(receivingLimit)
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
    } catch (e) {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-white/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[16px] w-full max-w-[680px] px-[48px] py-[48px] relative">
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
                {receivingLimit || "0"}
              </div>
              <input
                type="number"
                placeholder="Maximum Applications"
                disabled={!receivingEnabled}
                value={receivingLimit}
                onChange={(e) => setReceivingLimit(e.target.value)}
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
                type="date"
                disabled={!timeLimitEnabled}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full h-[48px] rounded-[10px] border border-[#E9E9E9] bg-white px-[14px] pr-[40px] text-[14px] text-[#262626] outline-none disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-[16px] text-[13px] text-rose-500">{error}</p>
        )}

        <div className="flex justify-end mt-[32px]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-[44px] px-[32px] rounded-full bg-[#262626] text-[14px] text-white hover:opacity-80 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
