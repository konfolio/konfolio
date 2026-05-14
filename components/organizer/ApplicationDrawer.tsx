"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppRow } from "./ApplicationsTable";
import Image from "next/image";

export default function ApplicationDrawer({
  app,
  konfolioViewerBasePath,
  onClose,
}: {
  app: AppRow | null;
  konfolioViewerBasePath: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(app?.status ?? "pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (app) setStatus(app.status);
  }, [app]);

  if (!app) return null;

  const thumb =
    app.konfolio.thumbnailUrl ?? (app.konfolio as any).thumbnail_url ?? null;

  const fullName =
    [app.applicant.firstName, app.applicant.lastName]
      .filter(Boolean)
      .join(" ") ||
    app.applicant.displayName ||
    "Applicant";

  const handleStatusChange = async (newStatus: AppRow["status"]) => {
    setStatus(newStatus);
    await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const STATUS_STYLES: Record<string, string> = {
    pending: "bg-[#F7F7F7] text-[#A5A5A5]",
    accepted: "bg-[#EAF3DE] text-[#3B6D11]",
    rejected: "bg-[#FCEBEB] text-[#A32D2D]",
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-[420px] bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#E9E9E9]">
          <span className="text-[13px] text-[#A5A5A5]">
            {app.createdAt
              ? new Date(app.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : ""}
          </span>
          <button
            onClick={onClose}
            className="text-[#A5A5A5] hover:text-[#262626]"
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
        </div>

        <div className="flex flex-col gap-[20px] px-[20px] py-[20px]">
          {/* Applicant info */}
          <div className="flex flex-col gap-[4px]">
            <h2 className="text-[18px] font-medium text-[#262626]">
              {fullName}
            </h2>
            {app.applicant.businessName && (
              <p className="text-[13px] text-[#A5A5A5]">
                {app.applicant.businessName}
              </p>
            )}
            {app.applicant.location && (
              <div className="flex items-center gap-[4px] text-[13px] text-[#A5A5A5]">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1.5a5 5 0 0 1 5 5c0 3.5-5 8.5-5 8.5S3 10 3 6.5a5 5 0 0 1 5-5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="8"
                    cy="6.5"
                    r="1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                {app.applicant.location}
              </div>
            )}
            {app.applicant.email && (
              <div className="flex items-center gap-[4px] text-[13px] text-[#A5A5A5]">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="4"
                    width="12"
                    height="9"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M2 6l6 4 6-4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {app.applicant.email}
              </div>
            )}
          </div>

          {/* Konfolio thumbnail */}
          {app.konfolio.id && (
            <Link
              href={`${konfolioViewerBasePath}/${app.konfolio.id}`}
              target="_blank"
              className="block w-full rounded-[10px] overflow-hidden border border-[#E9E9E9] hover:opacity-90"
            >
              {thumb ? (
                <Image
                  src={thumb}
                  alt="Portfolio"
                  width={420}
                  height={180}
                  className="w-full h-[180px] object-cover"
                />
              ) : (
                <div className="w-full h-[180px] bg-[#F7F7F7] flex items-center justify-center text-[13px] text-[#A5A5A5]">
                  View Portfolio →
                </div>
              )}
            </Link>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] text-[#A5A5A5]">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add a note..."
              className="w-full rounded-[10px] border border-[#E9E9E9] bg-white px-[12px] py-[10px] text-[13px] text-[#262626] placeholder:text-[#C0BDB4] outline-none focus:border-[#C0BDB4] resize-none"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] text-[#A5A5A5]">Status</label>
            <div className="relative w-fit">
              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as AppRow["status"])
                }
                className={`text-[13px] px-[12px] py-[6px] pr-[28px] rounded-full appearance-none cursor-pointer outline-none ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <svg
                className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none"
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Form answers */}
          {Object.keys(app.answers ?? {}).length > 0 && (
            <div className="flex flex-col gap-[12px]">
              <p className="text-[13px] text-[#A5A5A5]">Form answers</p>
              <div className="flex flex-col gap-[10px]">
                {Object.entries(app.answers).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-[2px]">
                    <span className="text-[12px] text-[#A5A5A5] capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-[13px] text-[#262626]">
                      {Array.isArray(val)
                        ? val.join(", ")
                        : val === null || val === undefined || val === ""
                          ? "—"
                          : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
