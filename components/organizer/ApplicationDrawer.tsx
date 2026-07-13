"use client";

import { useEffect, useState } from "react";
import { AppRow } from "./ApplicationsTable";
import PublicKonfolioView from "@/components/public/PublicKonfolioView";
import type { SocialKey } from "@/lib/socialKeys";

import HomeIcon from "@/components/icons/HomeIcon";
import ShopIcon from "@/components/icons/ShopIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import XIcon from "@/components/icons/XIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import TumblrIcon from "@/components/icons/TumblrIcon";
import PixivIcon from "@/components/icons/PixivIcon";
import BlueskyIcon from "@/components/icons/BlueskyIcon";

const SOCIAL_ICONS: {
  key: SocialKey;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "website", Icon: HomeIcon },
  { key: "instagram", Icon: InstagramIcon },
  { key: "x", Icon: XIcon },
  { key: "bluesky", Icon: BlueskyIcon },
  { key: "tumblr", Icon: TumblrIcon },
  { key: "facebook", Icon: FacebookIcon },
  { key: "pixiv", Icon: PixivIcon },
  { key: "shop", Icon: ShopIcon },
];

const OTHER_STATUS_LABELS: Record<AppRow["status"], string> = {
  accepted: "Accept",
  rejected: "Reject",
  pending: "Pending",
};

const STATUS_TEXT_STYLES: Record<AppRow["status"], string> = {
  pending: "text-[#262626]",
  accepted: "text-[#3B6D11]",
  rejected: "text-[#A32D2D]",
};

type OtherApplication = {
  id: string;
  status: AppRow["status"];
  formTitle: string | null;
};

export default function ApplicationDrawer({
  app,
  position,
  onUpdate,
  onClose,
}: {
  app: AppRow | null;
  position?: { index: number; total: number };
  onUpdate?: (updates: Partial<AppRow>) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(app?.status ?? "pending");
  const [notes, setNotes] = useState(app?.organizerNotes ?? "");
  const [otherApplications, setOtherApplications] = useState<
    OtherApplication[]
  >([]);

  useEffect(() => {
    if (!app?.applicant?.id) return;
    const load = async () => {
      const res = await fetch(
        `/api/applicants/${app.applicant.id}/applications`,
      );
      if (res.ok) {
        const json = await res.json();
        const applications: OtherApplication[] = json.applications ?? [];
        setOtherApplications(applications.filter((a) => a.id !== app.id));
      }
    };
    load();
  }, [app?.applicant?.id, app?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!app) return null;

  const legalName = [app.applicant.firstName, app.applicant.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName = (app.applicant.displayName || "").trim();
  const personalLine =
    displayName && displayName !== legalName
      ? `${legalName || displayName} (${displayName})`
      : legalName || displayName;

  const primaryName =
    app.applicant.businessName || legalName || displayName || "Applicant";

  const socialLinks = SOCIAL_ICONS.filter(
    ({ key }) => app.applicant.links?.[key],
  );

  const hasPortfolio = Boolean(app.konfolio.id && app.konfolio.content);

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
    } else {
      onUpdate?.({ status: newStatus });
    }
  };

  const handleNotesBlur = async () => {
    if (notes === (app.organizerNotes ?? "")) return;
    const res = await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      onUpdate?.({ organizerNotes: notes });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* Portfolio */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto bg-[#F7F7F7]">
        {hasPortfolio ? (
          <PublicKonfolioView
            konfolioId={app.konfolio.id}
            template={app.konfolio.template}
            content={app.konfolio.content}
            ownerBusinessName={app.applicant.businessName ?? ""}
            trackAnalytics={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[13px] text-[#A5A5A5]">
            No portfolio submitted
          </div>
        )}
      </div>

      {/* Meta panel */}
      <div className="w-[420px] shrink-0 h-full bg-white shadow-2xl overflow-y-auto flex flex-col border-l border-[#E9E9E9]">
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
          <div className="flex items-center gap-[16px]">
            {position && position.total > 0 && (
              <span className="text-[13px] text-[#A5A5A5]">
                {position.index + 1}
              </span>
            )}
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
        </div>

        <div className="flex flex-col gap-[20px] px-[20px] py-[20px]">
          {/* Applicant info */}
          <div className="flex flex-col gap-[4px]">
            <h2 className="text-[18px] font-medium text-[#262626]">
              {primaryName}
            </h2>
            {personalLine && (
              <p className="text-[13px] text-[#A5A5A5]">{personalLine}</p>
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

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-[16px]">
              {socialLinks.map(({ key, Icon }) => (
                <a
                  key={key}
                  href={app.applicant.links![key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#262626] hover:opacity-70"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] text-[#A5A5A5]">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add a note..."
              className="w-full rounded-[10px] border border-[#E9E9E9] bg-[#FAFAFA] px-[12px] py-[8px] text-[13px] text-[#262626] placeholder:text-[#C0BDB4] outline-none focus:border-[#C0BDB4]"
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
                className={`text-[13px] px-[12px] py-[8px] pr-[28px] rounded-[10px] border border-[#E9E9E9] bg-white appearance-none cursor-pointer outline-none focus:border-[#C0BDB4] ${STATUS_TEXT_STYLES[status] ?? STATUS_TEXT_STYLES.pending}`}
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

          {/* Tag usage in form */}
          {app.tagUsage && app.tagUsage.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <p className="text-[13px] text-[#A5A5A5]">Tag usage in form</p>
              <div className="flex flex-col gap-[8px]">
                {app.tagUsage.map(({ tag, percentage }) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between rounded-[10px] border border-[#E9E9E9] px-[12px] py-[8px]"
                  >
                    <span className="text-[13px] text-[#262626]">{tag}</span>
                    <span className="text-[13px] text-[#A5A5A5]">
                      {percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                      className={`text-[11px] px-[8px] py-[2px] rounded-full ${
                        a.status === "accepted"
                          ? "bg-[#EAF3DE] text-[#3B6D11]"
                          : a.status === "rejected"
                            ? "bg-[#FCEBEB] text-[#A32D2D]"
                            : "bg-[#F7F7F7] text-[#A5A5A5]"
                      }`}
                    >
                      {OTHER_STATUS_LABELS[a.status] ?? a.status}
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
                  <div key={key} className="flex flex-col gap-[6px]">
                    <span className="text-[13px] text-[#A5A5A5] capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="rounded-[10px] border border-[#E9E9E9] bg-[#FAFAFA] px-[12px] py-[8px] text-[13px] text-[#262626]">
                      {Array.isArray(val)
                        ? val.join(", ")
                        : val === null || val === undefined || val === ""
                          ? "—"
                          : String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
