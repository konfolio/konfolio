// components/my-forms/dashboard/OrganizerProfileEditPopover.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import useClickOutside from "@/components/hooks/useClickOutside";
import { supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

import DeleteIcon from "@/components/icons/DeleteIcon";
import LinkIcon from "@/components/icons/LinkIcon";
import LocationIcon from "@/components/icons/LocationIcon";

import PencilIcon from "@/components/icons/PencilIcon";
import TrashIcon from "@/components/icons/TrashIcon";

import HomeIcon from "@/components/icons/HomeIcon";
import ShopIcon from "@/components/icons/ShopIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import XIcon from "@/components/icons/XIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import TumblrIcon from "@/components/icons/TumblrIcon";
import PixivIcon from "@/components/icons/PixivIcon";
import BlueskyIcon from "@/components/icons/BlueskyIcon";

import Tag from "@/components/onboarding/Tag";

export type OrganizerProfilePopupData = {
  noticeText?: string;
  profileImageUrl?: string;
  organizationName?: string;
  eventLocationText?: string;
  formsFilled?: number;
  visitors?: number;
  betaText?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  data?: OrganizerProfilePopupData;

  onSupport?: () => void;
  onReportIssue?: () => void;
  onSignOut?: () => void;
};

type SocialKey =
  | "website"
  | "shop"
  | "instagram"
  | "x"
  | "facebook"
  | "tumblr"
  | "pixiv"
  | "bluesky";

type LinksMap = Partial<Record<SocialKey, string>>;

const SOCIAL_ROWS: {
  key: SocialKey;
  label: string;
  Icon: React.ComponentType<any>;
}[] = [
  { key: "website", label: "Main Website", Icon: HomeIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "x", label: "X", Icon: XIcon },
  { key: "bluesky", label: "Bluesky", Icon: BlueskyIcon },
  { key: "shop", label: "Main Shop", Icon: ShopIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "tumblr", label: "Tumblr", Icon: TumblrIcon },
  { key: "pixiv", label: "Pixiv", Icon: PixivIcon },
];

function formatMemberSince(createdAt?: string | null) {
  if (!createdAt) return "Member since —";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "Member since —";

  return `Member since ${d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
}

function isNonEmptyString(v: any): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeLinksMap(v: any): LinksMap {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: LinksMap = {};
  for (const row of SOCIAL_ROWS) {
    const raw = (v as any)[row.key];
    if (isNonEmptyString(raw)) out[row.key] = String(raw).trim();
  }
  return out;
}

function stableJson(v: any) {
  try {
    return JSON.stringify(v ?? null);
  } catch {
    return "";
  }
}

function normalizeUrlInput(raw: string) {
  const s = raw.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function inferSocialKey(url: string): SocialKey | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host.includes("instagram.com")) return "instagram";
    if (host === "x.com" || host.includes("twitter.com")) return "x";
    if (host.includes("bsky.app") || host.includes("bluesky")) return "bluesky";
    if (host.includes("facebook.com")) return "facebook";
    if (host.includes("tumblr.com")) return "tumblr";
    if (host.includes("pixiv.net")) return "pixiv";

    if (
      host.includes("etsy.com") ||
      host.includes("storenvy.com") ||
      host.includes("bigcartel.com") ||
      host.includes("shopify.com")
    ) {
      return "shop";
    }

    return null;
  } catch {
    return null;
  }
}

function pickFallbackLinkKey(current: LinksMap): SocialKey {
  if (!current.website) return "website";
  if (!current.shop) return "shop";
  if (!current.instagram) return "instagram";
  return "website";
}

function countLinks(m: LinksMap) {
  return Object.values(m).filter((v) => isNonEmptyString(v)).length;
}

export default function OrganizerProfileEditPopover({
  open,
  onClose,
  data,
  onSupport,
  onReportIssue,
  onSignOut,
}: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useClickOutside(modalRef, () => {
    if (open) onClose();
  });

  async function handleSignOut() {
    setSaveError("");
    try {
      await supabase.auth.signOut();
    } catch (e: any) {
      setSaveError(e?.message ?? "Failed to sign out");
      return;
    }

    onClose();
    router.push("/");
    router.refresh();
  }

  const {
    noticeText = "Changes made here will carry onto your next uses of autofills.",
    profileImageUrl = "",
    organizationName = "Organization Name",
    eventLocationText: eventLocationTextFromProps = "City, Country",
    formsFilled = 0,
    visitors = 0,
    betaText = "Beta v.1.0",
  } = data ?? {};

  const [organizationNameText, setOrganizationNameText] =
    useState(organizationName);
  const [eventLocationText, setEventLocationText] = useState(
    eventLocationTextFromProps,
  );

  const [emailText, setEmailText] = useState("myemailaddress@konfolio.com");
  const [memberSince, setMemberSince] = useState("Member since —");

  const [linksMap, setLinksMap] = useState<LinksMap>({});

  const [linkValue, setLinkValue] = useState("");
  const [linkFocused, setLinkFocused] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const initialRef = useRef<{
    organizationNameText: string;
    eventLocationText: string;
    linksMap: LinksMap;
  } | null>(null);

  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => setOrganizationNameText(organizationName),
    [organizationName],
  );
  useEffect(
    () => setEventLocationText(eventLocationTextFromProps),
    [eventLocationTextFromProps],
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    setLinkValue("");
    setLinkFocused(false);

    setIsSaving(false);
    setSaveError("");
    setIsDirty(false);
    setSaveStatus("idle");
    initialRef.current = null;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

    let cancelled = false;

    async function loadProfileMeta() {
      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;
      const userId = user?.id;
      const authEmail = user?.email;

      if (authEmail) setEmailText(authEmail);

      if (user?.created_at) setMemberSince(formatMemberSince(user.created_at));

      if (!userId) return;

      const metaRes = await supabase
        .from("profiles")
        .select("organization, event_location, links")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (metaRes.error) {
        console.log(
          "[OrganizerProfileEditPopover] profile meta error:",
          metaRes.error,
        );
        return;
      }

      const row: any = metaRes.data ?? {};

      const org = String(row.organization ?? "").trim();
      if (org) setOrganizationNameText(org);

      const loc = String(row.event_location ?? "").trim();
      if (loc) setEventLocationText(loc);

      const nextLinks = normalizeLinksMap(row.links);
      setLinksMap(nextLinks);

      initialRef.current = {
        organizationNameText: String(org || organizationName).trim(),
        eventLocationText: String(loc || eventLocationTextFromProps).trim(),
        linksMap: nextLinks,
      };

      setIsDirty(false);
      setSaveError("");
      setSaveStatus("idle");
    }

    loadProfileMeta();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventLocationTextFromProps]);

  useEffect(() => {
    const init = initialRef.current;
    if (!init) return;

    const same =
      organizationNameText.trim() === init.organizationNameText.trim() &&
      eventLocationText.trim() === init.eventLocationText.trim() &&
      stableJson(linksMap) === stableJson(init.linksMap);

    setIsDirty(!same);

    if (!same && saveStatus === "saved") {
      setSaveStatus("idle");
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    }
  }, [organizationNameText, eventLocationText, linksMap, saveStatus]);

  async function handleSave() {
    setSaveError("");
    setIsSaving(true);
    setSaveStatus("saving");
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

    try {
      const sessionRes = await supabase.auth.getSession();
      const userId = sessionRes.data.session?.user?.id;
      if (!userId) throw new Error("Not signed in");

      const payload = {
        organization: organizationNameText.trim() || null,
        event_location: eventLocationText.trim() || null,
        links: linksMap,
      };

      const res = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userId);
      if (res.error) throw res.error;

      initialRef.current = {
        organizationNameText: String(payload.organization ?? "").trim(),
        eventLocationText: String(payload.event_location ?? "").trim(),
        linksMap,
      };

      setIsDirty(false);
      setSaveStatus("saved");

      saveTimeoutRef.current = window.setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (e: any) {
      setSaveError(e?.message ?? "Failed to save");
      setSaveStatus("idle");
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  const linksCount = countLinks(linksMap);
  const canAddLink = linksCount < 5;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div
        ref={modalRef}
        className={[
          "relative bg-white rounded-[15px]",
          "shadow-[5px_5px_25px_rgba(0,0,0,0.10)]",
          "w-[995px]",
          "max-h-[calc(100vh-64px)]",
          "overflow-hidden",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          aria-label="Close popup"
          onClick={onClose}
          className="absolute right-[20px] top-[20px] w-[26px] h-[26px] flex items-center justify-center z-[5]"
        >
          <DeleteIcon className="w-[26px] h-[26px]" />
        </button>

        <div className="relative max-h-[calc(100vh-64px)] overflow-y-auto px-[130px]">
          <div className="sticky top-0 z-[2] bg-white">
            <div className="flex flex-row items-center py-[25px]">
              <p className="flex-1 text-[12px] leading-[130%] text-[#A5A5A5] whitespace-nowrap">
                {noticeText}
              </p>

              <div className="flex items-center gap-[12px]">
                {saveError ? (
                  <p className="m-0 text-[12px] leading-[130%] text-[#FF4603] whitespace-nowrap">
                    {saveError}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className={[
                    "group flex items-center justify-center gap-[7px]",
                    "h-[39px] min-w-[150px]",
                    "px-[40px] py-[13px]",
                    "rounded-[100px]",
                    "text-[14px] leading-[140%] font-normal",
                    "transition-all duration-300 ease-out",
                    "whitespace-nowrap",
                    saveStatus === "saved"
                      ? "bg-[#4CAF50] text-white opacity-100"
                      : "bg-[#262626] text-white hover:bg-[#262626CC] active:bg-[#262626B2]",
                    !isDirty && saveStatus !== "saved"
                      ? "opacity-50 pointer-events-none"
                      : "",
                  ].join(" ")}
                  aria-label="Save changes"
                >
                  <span>
                    {saveStatus === "saving"
                      ? "Saving..."
                      : saveStatus === "saved"
                        ? "Saved!"
                        : "Save"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-start gap-[29px] py-[20px]">
            <div className="w-[80px] h-[80px] rounded-[71.4286px] overflow-hidden bg-[#F7F7F7] shrink-0 relative">
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #E9E9E9 25%, transparent 25%), linear-gradient(-45deg, #E9E9E9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E9E9E9 75%), linear-gradient(-45deg, transparent 75%, #E9E9E9 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                />
              )}
            </div>

            <div className="w-[526px] flex flex-col gap-[50px]">
              {/* Organization + Event Location */}
              <div className="w-[300px] flex flex-col gap-[15px]">
                <div className="flex flex-row items-center py-[5px] gap-[10px]">
                  <div className="flex-1">
                    <EditableInline
                      value={organizationNameText}
                      placeholder="Organization Name"
                      textClassName="text-[22px] leading-[140%] text-[#262626] font-normal"
                      onChange={setOrganizationNameText}
                      onTrash={() =>
                        setOrganizationNameText("Organization Name")
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-row items-center gap-[5px] -mt-[10px]">
                  <span className="w-[12px] h-[12px] flex items-center justify-center">
                    <LocationIcon className="w-[12px] h-[12px] text-[#A5A5A5]" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <EditableInline
                      value={eventLocationText}
                      placeholder="City, Country"
                      textClassName="text-[15px] leading-[150%] text-[#262626] font-normal"
                      onChange={setEventLocationText}
                      onTrash={() => setEventLocationText("City, Country")}
                    />
                  </div>
                </div>
              </div>

              {/* Email (no name section) */}
              <div className="flex flex-col gap-[10px] w-full">
                <div className="w-full">
                  <HoverOnlyInline
                    value={emailText || "myemailaddress@konfolio.com"}
                    textClassName="text-[#262626]"
                  />
                </div>
              </div>

              {/* Counts */}
              <div className="flex flex-row items-start gap-[50px]">
                <CountBlock label="Forms Filled" value={formsFilled} />
                <CountBlock label="Visitors" value={visitors} />
              </div>

              {/* Sales Location (uses event_location) */}
              <div className="flex flex-col items-start gap-[15px] w-full">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">
                  Sales Location
                </p>

                {eventLocationText.trim() ? (
                  <div className="flex flex-row items-center gap-[10px]">
                    <Tag
                      label={eventLocationText.trim()}
                      className="h-[25px] px-[20px] py-0 text-[15px] leading-[150%] border-[#A5A5A5] bg-white/10"
                    />
                  </div>
                ) : (
                  <div className="text-[15px] leading-[150%] text-[#D3D3D3]">
                    —
                  </div>
                )}
              </div>

              {/* Links (limit 5) */}
              <div className="flex flex-col items-start gap-[15px] w-full">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">
                  My Links
                </p>

                <div className="flex flex-col gap-[10px] w-full">
                  {SOCIAL_ROWS.map((r) => {
                    const href = linksMap[r.key];
                    if (!isNonEmptyString(href)) return null;

                    return (
                      <EditableLinkRow
                        key={r.key}
                        Icon={r.Icon}
                        value={href}
                        onChangeValue={(next) => {
                          setLinksMap((prev) => ({ ...prev, [r.key]: next }));
                        }}
                        onCommit={(finalValue) => {
                          const trimmed = finalValue.trim();
                          setLinksMap((prev) => ({
                            ...prev,
                            [r.key]: trimmed,
                          }));
                        }}
                        onTrash={() => {
                          setLinksMap((prev) => {
                            const next: LinksMap = { ...prev };
                            delete (next as any)[r.key];
                            return next;
                          });
                        }}
                      />
                    );
                  })}

                  {canAddLink ? (
                    <div className="flex items-center gap-[10px] w-full">
                      <LinkIcon className="w-[16px] h-[16px] text-[#D3D3D3] shrink-0" />

                      <div className="flex-1 min-w-0">
                        <input
                          value={linkValue}
                          onChange={(e) => setLinkValue(e.target.value)}
                          onFocus={() => setLinkFocused(true)}
                          onBlur={() => setLinkFocused(false)}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();

                            if (countLinks(linksMap) >= 5) return;

                            const raw = linkValue.trim();
                            if (!raw) return;

                            const url = normalizeUrlInput(raw);
                            const inferred = inferSocialKey(url);

                            setLinksMap((prev) => {
                              const prevCount = countLinks(prev);
                              if (prevCount >= 5) return prev;

                              const chosen =
                                inferred ?? pickFallbackLinkKey(prev);

                              const next = { ...prev, [chosen]: url };
                              if (countLinks(next) > 5) return prev;
                              return next;
                            });

                            setLinkValue("");
                            setLinkFocused(false);
                          }}
                          placeholder="Add Link"
                          className={[
                            "w-full bg-transparent outline-none",
                            "text-[15px] leading-[150%]",
                            linkValue ? "text-[#262626]" : "text-[#D3D3D3]",
                            "placeholder:text-[#D3D3D3]",
                            "pb-[4px]",
                          ].join(" ")}
                          aria-label="Add Link"
                        />

                        <div
                          className={[
                            "h-[1px] w-full",
                            linkFocused ? "bg-[#D3D3D3]" : "bg-transparent",
                          ].join(" ")}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <p className="text-[15px] leading-[150%] text-[#A5A5A5]">
                {memberSince}
              </p>

              <div className="flex flex-col items-start w-full">
                <AsideRow label="Support" onClick={onSupport} />
                <AsideRow label="Report issue" onClick={onReportIssue} />
                <AsideRow
                  label="Sign out"
                  danger
                  onClick={() => {
                    onSignOut?.();
                    handleSignOut();
                  }}
                />
              </div>

              <p className="text-[15px] leading-[150%] text-[#A5A5A5] pb-[40px]">
                {betaText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableInline({
  value,
  placeholder,
  textClassName,
  onChange,
  onTrash,
}: {
  value: string;
  placeholder: string;
  textClassName: string;
  onChange: (v: string) => void;
  onTrash: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) return;
    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [editing]);

  return (
    <div className="group w-full">
      <div
        className={[
          "flex items-center gap-[10px] w-full",
          editing ? "border-b border-[#D3D3D3] pb-[4px]" : "",
        ].join(" ")}
        onClick={() => setEditing(true)}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.preventDefault();
                  setEditing(false);
                }
              }}
              placeholder={placeholder}
              className={[
                "w-full bg-transparent outline-none placeholder:text-[#D3D3D3]",
                textClassName,
              ].join(" ")}
            />
          ) : (
            <span
              className={["block w-full min-w-0 truncate", textClassName].join(
                " ",
              )}
            >
              {value?.trim() ? value : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#A5A5A5]">
          <button
            type="button"
            aria-label="Edit"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(true);
            }}
          >
            <PencilIcon className="w-[16px] h-[16px]" />
          </button>

          <button
            type="button"
            aria-label="Clear"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(false);
              onTrash();
            }}
          >
            <TrashIcon className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HoverOnlyInline({
  value,
  textClassName = "text-[#D3D3D3]",
}: {
  value: string;
  textClassName?: string;
}) {
  return (
    <div className="group w-full">
      <div className="flex items-center gap-[10px] w-full">
        <div className="flex-1 min-w-0">
          <span
            className={[
              "block w-full min-w-0 truncate text-[15px] leading-[150%] font-normal",
              textClassName,
            ].join(" ")}
          >
            {value}
          </span>
        </div>

        <div className="flex items-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#A5A5A5]">
          <span className="w-[16px] h-[16px] flex items-center justify-center">
            <PencilIcon className="w-[16px] h-[16px]" />
          </span>
          <span className="w-[16px] h-[16px] flex items-center justify-center">
            <TrashIcon className="w-[16px] h-[16px]" />
          </span>
        </div>
      </div>
    </div>
  );
}

function EditableLinkRow({
  Icon,
  value,
  onChangeValue,
  onCommit,
  onTrash,
}: {
  Icon: React.ComponentType<any>;
  value: string;
  onChangeValue: (next: string) => void;
  onCommit: (finalValue: string) => void;
  onTrash: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (!editing) return;
    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [editing]);

  return (
    <div className="flex flex-row items-center gap-[10px] h-[24px] w-full group">
      <Icon className="w-[16px] h-[16px]" />

      <div
        className={[
          "flex-1 min-w-0 flex items-center gap-[10px]",
          editing ? "border-b border-[#D3D3D3] pb-[4px]" : "",
        ].join(" ")}
        onClick={() => setEditing(true)}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                onChangeValue(e.target.value);
              }}
              onBlur={() => {
                setEditing(false);
                onCommit(draft);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setEditing(false);
                  onCommit(draft);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setEditing(false);
                }
              }}
              className="w-full bg-transparent outline-none text-[15px] leading-[150%] text-[#262626]"
              aria-label="Edit link"
            />
          ) : (
            <span className="block w-full min-w-0 text-[15px] leading-[150%] text-[#262626] truncate">
              {value}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#A5A5A5]">
          <button
            type="button"
            aria-label="Edit"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(true);
            }}
          >
            <PencilIcon className="w-[16px] h-[16px]" />
          </button>

          <button
            type="button"
            aria-label="Remove"
            className="w-[16px] h-[16px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(false);
              onTrash();
            }}
          >
            <TrashIcon className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CountBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-start gap-[10px]">
      <span className="text-[15px] leading-[150%] text-[#A5A5A5]">{label}</span>
      <span className="text-[15px] leading-[150%] text-[#262626]">{value}</span>
    </div>
  );
}

function AsideRow({
  label,
  danger = false,
  onClick,
}: {
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[526px] h-[40px] px-[10px] flex items-center rounded-[10px] hover:bg-black/5"
    >
      <span
        className={[
          "text-[14px] leading-[130%] font-normal flex items-center",
          danger ? "text-[#FF4603]" : "text-[#262626]",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}
