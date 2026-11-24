"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
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
  onUpdate,
  onClose,
}: {
  app: AppRow | null;
  formTitle?: string;
  fields?: Field[];
  allApplicants?: AppRow[];
  onUpdate?: (id: string, updates: Partial<AppRow>) => void;
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

  const [currentIndex, setActiveIndex] = useState(initialIndex);
  const activeIndex = Math.min(currentIndex, Math.max(0, feed.length - 1));
  const [expandOpen, setExpandOpen] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const didInitialScroll = useRef(false);

  const scrollToIndex = useCallback(
    (i: number) => {
      const scroller = scrollerRef.current;
      const card = cardRefs.current[i];
      if (!scroller || !card) return;
      const padding = parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0;
      scroller.scrollTo({ top: card.offsetTop - padding, behavior: "instant" });
    },
    [],
  );

  // Jump to the initially-selected card on open (no animation).
  useLayoutEffect(() => {
    if (didInitialScroll.current) return;
    if (feed.length === 0) return;
    scrollToIndex(initialIndex);
    didInitialScroll.current = true;
  }, [initialIndex, feed.length, scrollToIndex]);

  function updateActiveIndex() {
    const scroller = scrollerRef.current;
    const [first, second] = cardRefs.current;
    if (!scroller || !first || !second || feed.length < 2) return;

    // Every card has the same height and gap, including unloaded cards.
    const step = second.offsetTop - first.offsetTop;
    if (step <= 0) return;
    const index = Math.round(scroller.scrollTop / step);
    setActiveIndex(Math.max(0, Math.min(index, feed.length - 1)));
  }

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
      className="absolute inset-0 z-50 bg-black/40 p-2 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#F7F7F7] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Breadcrumb — tracks the active applicant */}
        <div className="relative flex shrink-0 items-center gap-[10px] border-b border-[#E9E9E9] bg-white px-3 py-2 sm:px-4">
          <button
            onClick={onClose}
            aria-label="Back"
            className="shrink-0 text-black/40 hover:text-[#262626]"
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

          <span className="truncate text-[14px] text-black/40" title={formTitle}>
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
              <div className="flex h-full w-full items-center justify-center text-[10px] text-black/40">
                {activeName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <button
            onClick={() => setExpandOpen((v) => !v)}
            className="flex min-w-0 items-center gap-[4px] text-[14px] font-medium text-[#262626] hover:opacity-70"
          >
            <span className="truncate" title={activeName}>{activeName}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              className={`shrink-0 transition-transform ${expandOpen ? "rotate-180" : ""}`}
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

          <span className="ml-auto shrink-0 text-[13px] text-black/40">
            {activeIndex + 1} / {feed.length}
          </span>

          <button
            type="button"
            aria-label="Previous applicant"
            title="Previous applicant"
            disabled={activeIndex === 0}
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-zinc-100 disabled:opacity-30"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            aria-label="Next applicant"
            title="Next applicant"
            disabled={activeIndex >= feed.length - 1}
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-zinc-100 disabled:opacity-30"
          >
            <ChevronDown size={16} />
          </button>

          {expandOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setExpandOpen(false)}
              />
              <div className="absolute left-2 top-[calc(100%+8px)] z-50 sm:left-[130px]">
                <ApplicantsExpand
                  applicants={feed}
                  currentAppId={activeApp.id}
                  onSelect={(a) => {
                    setExpandOpen(false);
                    const i = feed.findIndex((x) => x.id === a.id);
                    if (i >= 0) {
                      scrollToIndex(i);
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
          onScroll={updateActiveIndex}
          className="relative flex min-h-0 flex-1 snap-y snap-proximity scroll-pt-2 flex-col gap-2 overflow-y-auto overscroll-contain px-2 pt-2 pb-8 sm:px-3"
        >
          {feed.map((a, i) => {
            const mounted = Math.abs(i - activeIndex) <= WINDOW;
            return (
              <div
                key={a.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="h-full shrink-0 snap-start"
              >
                <div className="flex h-full w-full flex-col gap-2 md:flex-row">
                  {mounted ? (
                    <ApplicationFeedItem
                      app={a}
                      fields={fields}
                      number={i + 1}
                      onUpdate={(updates) => onUpdate?.(a.id, updates)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[13px] text-black/40">
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

function ApplicationPortfolio({ app }: { app: AppRow }) {
  const paneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const hasPortfolio = Boolean(app.konfolio.id && app.konfolio.content);

  useLayoutEffect(() => {
    const pane = paneRef.current;
    const canvas = canvasRef.current;
    if (!pane || !canvas) return;

    const fit = () =>
      setScale(Math.min(
        pane.clientWidth / canvas.offsetWidth,
        pane.clientHeight / canvas.offsetHeight,
      ));

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(pane);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [hasPortfolio]);

  const website = app.applicant.links?.website?.trim();
  const externalPortfolio = website && /^https?:\/\//i.test(website) ? website : null;

  return (
    <div ref={paneRef} className="relative min-h-0 min-w-0 flex-1 overflow-clip rounded-xl bg-zinc-100">
      {hasPortfolio ? (
        <div
          ref={canvasRef}
          className="absolute top-1/2 left-1/2 w-[1000px]"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <PublicKonfolioView
            konfolioId={app.konfolio.id}
            template={app.konfolio.template}
            content={app.konfolio.content}
            ownerBusinessName={app.applicant.businessName ?? ""}
            trackAnalytics={false}
            embedded
          />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="max-w-full truncate font-medium">{nameLines(app).primaryName}</p>
          {externalPortfolio ? (
            <a
              href={externalPortfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-full items-center gap-2 rounded-full bg-white px-4 py-2 text-sm hover:bg-zinc-50"
            >
              <span className="truncate">{externalPortfolio}</span>
              <ExternalLink size={14} className="shrink-0" />
            </a>
          ) : (
            <p className="text-sm text-zinc-500">No portfolio submitted</p>
          )}
        </div>
      )}
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
      <ApplicationPortfolio app={app} />

      {/* Meta panel */}
      <div className="flex h-[42%] min-h-0 min-w-0 shrink-0 flex-col overflow-y-auto rounded-xl border border-zinc-200 bg-white md:h-full md:w-[28%] md:min-w-[240px] md:max-w-[420px]">
        <div className="flex items-center justify-between border-b border-[#E9E9E9] px-[20px] py-[16px]">
          <span className="text-[13px] text-black/40">
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
          <span className="text-[13px] text-black/40">{number}</span>
        </div>

        <div className="flex flex-col gap-[20px] px-[20px] py-[20px]">
          {/* Applicant info */}
          <div className="flex flex-col gap-[4px]">
            <h2 className="text-[18px] font-medium text-[#262626]">
              {primaryName}
            </h2>
            {personalLine && (
              <p className="text-[13px] text-black/40">{personalLine}</p>
            )}
            {app.applicant.location && (
              <div className="flex items-center gap-[4px] text-[13px] text-black/40">
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
              <div className="flex items-center gap-[4px] text-[13px] text-black/40">
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
            <label className="text-[13px] text-black/40">Notes</label>
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
            <label className="text-[13px] text-black/40">Status</label>
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
              <p className="text-[13px] text-black/40">Tag usage in form</p>
              <div className="flex flex-col gap-[8px]">
                {app.tagUsage.map(({ tag, percentage }) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between rounded-[10px] border border-[#E9E9E9] px-[12px] py-[8px]"
                  >
                    <span className="text-[13px] text-[#262626]">{tag}</span>
                    <span className="text-[13px] text-black/40">
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
              <p className="text-[13px] text-black/40">Found in other forms</p>
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
                            : "bg-[#F7F7F7] text-black/40"
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
                <p className="text-[13px] text-black/40">Form answers</p>
                <div className="flex flex-col gap-[10px]">
                  {questionFields.map((f) => {
                    const val = answers[f.field_key];
                    return (
                      <div key={f.id} className="flex flex-col gap-[6px]">
                        <span className="text-[13px] text-black/40">
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
