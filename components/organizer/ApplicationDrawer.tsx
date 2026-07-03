"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppRow } from "./ApplicationsTable";

export default function ApplicationDrawer({
  app,
  onClose,
}: {
  app: AppRow | null;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(app?.status ?? "pending");
  const [notes, setNotes] = useState("");
  const [otherApplications, setOtherApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!app?.applicant?.id) return;
    const load = async () => {
      const res = await fetch(
        `/api/applicants/${app.applicant.id}/applications`,
      );
      if (res.ok) {
        const json = await res.json();
        setOtherApplications(json.applications ?? []);
      }
    };
    load();
  }, [app?.applicant?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!app) return null;

  const fullName =
    [app.applicant.firstName, app.applicant.lastName]
      .filter(Boolean)
      .join(" ") ||
    app.applicant.displayName ||
    app.applicant.businessName ||
    "Applicant";

  const businessSlug = app.applicant.businessSlug ?? app.applicant.business_slug ?? null;
  const portfolioSlug = app.konfolio.portfolioSlug ?? app.konfolio.portfolio_slug ?? null;
  const publicKonfolioHref =
    businessSlug && portfolioSlug
      ? `/${businessSlug}/${portfolioSlug}`
      : null;

  const handleStatusChange = async (newStatus: AppRow["status"]) => {
    const previous = status;
    setStatus(newStatus);
    const res = await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      setStatus(previous);
    }
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
          {app.konfolio.id && publicKonfolioHref && (
            <div className="w-full rounded-[10px] overflow-hidden border border-[#E9E9E9]">
              <iframe
                src={publicKonfolioHref}
                className="w-full h-[480px] border-0"
                title="Applicant Portfolio"
              />
              <Link
                href={publicKonfolioHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-[6px] py-[10px] text-[12px] text-[#A5A5A5] hover:text-[#262626] border-t border-[#E9E9E9]"
              >
                Open full portfolio
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M4 2H2.5A1.5 1.5 0 0 0 1 3.5v6A1.5 1.5 0 0 0 2.5 11h6A1.5 1.5 0 0 0 10 9.5V8M7 1h4m0 0v4m0-4L4.5 7.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
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

          {/* Found in other forms */}
          {otherApplications.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <p className="text-[13px] text-[#A5A5A5]">Found in other forms</p>
              <div className="flex flex-col gap-[6px]">
                {otherApplications.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#262626]">
                      {a.formTitle ?? "Untitled Form"}
                    </span>
                    <span
                      className={`text-[11px] px-[8px] py-[2px] rounded-full capitalize ${
                        a.status === "accepted"
                          ? "bg-[#EAF3DE] text-[#3B6D11]"
                          : a.status === "rejected"
                            ? "bg-[#FCEBEB] text-[#A32D2D]"
                            : "bg-[#F7F7F7] text-[#A5A5A5]"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
