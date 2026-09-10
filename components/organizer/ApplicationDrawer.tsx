"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppRow, Field } from "./ApplicationsTable";
import ApplicantsExpand from "./ApplicantsExpand";
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

// How many applications on each side of the active one stay mounted so
// flicking to them is instant (images already loaded, portfolio painted).
const WINDOW = 2;

function nameLines(app: AppRow) {
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
  return { primaryName, personalLine };
}

export default function ApplicationDrawer({
  app,
  formTitle,
  fields,
  allApplicants,
  onSelectApplicant,
  onUpdate,
  onClose,
}: {
  app: AppRow | null;
  position?: { index: number; total: number };
  formTitle?: string;
  fields?: Field[];
  allApplicants?: AppRow[];
  onSelectApplicant?: (app: AppRow) => void;
  onUpdate?: (updates: Partial<AppRow>) => void;
  onClose: () => void;
}) {
  const feed = useMemo<AppRow[]>(() => {
    if (allApplicants && allApplicants.length > 0) return allApplicants;
    return app ? [app] : [];
  }, [allApplicants, app]);

  const initialIndex = useMemo(() => {
    const i = feed.findIndex((a) => a.id === app?.id);
    return i >= 0 ? i : 0;
  }, [feed, app?.id]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [expandOpen, setExpandOpen] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const didInitialScroll = useRef(false);

  const scrollToIndex = useCallback(
    (i: number, behavior: ScrollBehavior = "smooth") => {
      cardRefs.current[i]?.scrollIntoView({ block: "start", behavior });
    },
    [],
  );

  // Jump to the initially-selected card on open (no animation).
  useLayoutEffect(() => {
    if (didInitialScroll.current) return;
    if (feed.length === 0) return;
    scrollToIndex(initialIndex, "auto");
    setActiveIndex(initialIndex);
    didInitialScroll.current = true;
  }, [initialIndex, feed.length, scrollToIndex]);

  // React to an externally-driven selection change (e.g. parent picks a
  // different row) once the feed is already open.
  useEffect(() => {
    if (!didInitialScroll.current) return;
    const i = feed.findIndex((a) => a.id === app?.id);
    if (i >= 0 && i !== activeIndex) {
      scrollToIndex(i);
      setActiveIndex(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id]);

  // Track which card is on screen -> that's the active applicant.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.idx);
          if (Number.isNaN(idx)) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx, ratio: e.intersectionRatio };
          }
        }
        if (best && best.ratio >= 0.5) {
          setActiveIndex((prev) => (prev === best!.idx ? prev : best!.idx));
        }
      },
      { root, threshold: [0.25, 0.5, 0.75, 1] },
    );
    cardRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [feed.length]);

  // Let the parent (position counter, row selection) follow the feed.
  useEffect(() => {
    const a = feed[activeIndex];
    if (a && a.id !== app?.id) onSelectApplicant?.(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!app || feed.length === 0) return null;

  const activeApp = feed[activeIndex] ?? app;
  const { primaryName: activeName } = nameLines(activeApp);

  return (
    <div
      className="absolute inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#F7F7F7] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Breadcrumb — tracks the active applicant */}
        <div className="relative flex shrink-0 items-center gap-[10px] border-b border-[#E9E9E9] bg-white px-[20px] py-[14px]">
          <button
            onClick={onClose}
            aria-label="Back"
            className="text-[#A5A5A5] hover:text-[#262626]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 12H22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 20L2 12L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="text-[14px] text-[#A5A5A5]">
            {formTitle || "Untitled Form"}
          </span>
          <span className="text-[14px] text-[#C0BDB4]">/</span>

          <div className="h-[22px] w-[22px] shrink-0 overflow-hidden rounded-full bg-[#E9E9E9]">
            {activeApp.applicant.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeApp.applicant.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-[#A5A5A5]">
                {activeName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <button
            onClick={() => setExpandOpen((v) => !v)}
            className="flex items-center gap-[4px] text-[14px] font-medium text-[#262626] hover:opacity-70"
          >
            {activeName}
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform ${expandOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="ml-auto text-[13px] text-[#A5A5A5]">
            {activeIndex + 1} / {feed.length}
          </span>

          {expandOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setExpandOpen(false)}
              />
              <div className="absolute left-[130px] top-[calc(100%+8px)] z-50">
                <ApplicantsExpand
                  applicants={feed}
                  currentAppId={activeApp.id}
                  onSelect={(a) => {
                    setExpandOpen(false);
                    const i = feed.findIndex((x) => x.id === a.id);
                    if (i >= 0) {
                      scrollToIndex(i);
                      setActiveIndex(i);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Vertical scroll-snap feed */}
        <div
          ref={scrollerRef}
          className="flex min-h-0 flex-1 snap-y snap-mandatory flex-col gap-[16px] overflow-y-auto overscroll-contain p-[16px] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {feed.map((a, i) => {
            const mounted = Math.abs(i - activeIndex) <= WINDOW;
            return (
              <div
                key={a.id}
                data-idx={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="shrink-0 snap-start"
                style={{ height: "calc(100% - 40px)", scrollSnapStop: "always" }}
              >
                <div className="flex h-full w-full overflow-hidden rounded-2xl border border-[#E9E9E9] bg-white shadow-sm">
                  {mounted ? (
                    <ApplicationFeedItem
                      app={a}
                      fields={fields}
                      number={i + 1}
                      onUpdate={(u) => {
                        if (a.id === feed[activeIndex]?.id) onUpdate?.(u);
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[13px] text-[#A5A5A5]">
                      {nameLines(a).primaryName}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ApplicationFeedItem({
  app,
  fields,
  number,
  onUpdate,
}: {
  app: AppRow;
  fields?: Field[];
  number: number;
  onUpdate?: (updates: Partial<AppRow>) => void;
}) {
  const [status, setStatus] = useState(app.status ?? "pending");
  const [notes, setNotes] = useState(app.organizerNotes ?? "");
  const [otherApplications, setOtherApplications] = useState<OtherApplication[]>(
    [],
  );

  useEffect(() => {
    if (!app.applicant?.id) return;
    let cancelled = false;
    const load = async () => {
      const res = await fetch(
        `/api/applicants/${app.applicant.id}/applications`,
      );
      if (!res.ok || cancelled) return;
      const json = await res.json();
      const applications: OtherApplication[] = json.applications ?? [];
      setOtherApplications(applications.filter((a) => a.id !== app.id));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [app.applicant?.id, app.id]);

  const { primaryName, personalLine } = nameLines(app);

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
    <>
      {/* Portfolio (dark profile sidebar + image grid) */}
      <div className="min-w-0 flex-1 overflow-y-auto bg-[#F7F7F7]">
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
      <div className="flex w-[420px] shrink-0 flex-col overflow-y-auto border-l border-[#E9E9E9] bg-white">
        <div className="flex items-center justify-between border-b border-[#E9E9E9] px-[20px] py-[16px]">
          <span className="text-[13px] text-[#A5A5A5]">
            {app.createdAt
              ? `Submitted on ${new Date(app.createdAt).toLocaleString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )}`
              : ""}
          </span>
          <span className="text-[13px] text-[#A5A5A5]">{number}</span>
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
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add a note..."
              rows={3}
              className="w-full resize-none rounded-[10px] border border-[#E9E9E9] bg-[#FAFAFA] px-[12px] py-[8px] text-[13px] text-[#262626] placeholder:text-[#C0BDB4] outline-none focus:border-[#C0BDB4]"
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
          {(() => {
            const answers = app.answers ?? {};
            const questionFields = fields
              ? [...fields].sort((a, b) => a.sort_order - b.sort_order)
              : Object.keys(answers).map((key) => ({
                  id: key,
                  field_key: key,
                  label: key.replace(/_/g, " "),
                }));

            if (questionFields.length === 0) return null;

            return (
              <div className="flex flex-col gap-[12px]">
                <p className="text-[13px] text-[#A5A5A5]">Form answers</p>
                <div className="flex flex-col gap-[10px]">
                  {questionFields.map((f) => {
                    const val = answers[f.field_key];
                    return (
                      <div key={f.id} className="flex flex-col gap-[6px]">
                        <span className="text-[13px] text-[#A5A5A5]">
                          {f.label}
                        </span>
                        <div className="rounded-[10px] border border-[#E9E9E9] bg-[#FAFAFA] px-[12px] py-[8px] text-[13px] text-[#262626]">
                          {Array.isArray(val)
                            ? val.length > 0
                              ? val.join(", ")
                              : "—"
                            : val === null || val === undefined || val === ""
                              ? "—"
                              : String(val)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
