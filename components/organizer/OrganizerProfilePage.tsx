"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import DeleteIcon from "@/components/icons/DeleteIcon";
import LocationIcon from "@/components/icons/LocationIcon";

type OrganizerProfilePageProps = {
  organizerId: string;
  isPopup?: boolean;
  onClose?: () => void;
};

type OrganizerRow = {
  id: string;
  name?: string | null;
  location?: string | null;
  salesLocation?: string | string[] | null;
  profile_image_url?: string | null;
  email?: string | null;
  created_at?: string | null;
  organization_name?: string | null;
  links?: Record<string, unknown> | null;
};

type FormRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  close_date?: string | null;
  views: number;
  applications_count: number;
  description?: string;
};

type EditableState = {
  name: string;
  location: string;
  salesLocations: string[];
  links: Record<string, string>;
};

type EditField =
  | null
  | "name"
  | "location"
  | "newSalesLocation"
  | "newLink"
  | `link:${string}`;

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

function prettyLinkLabel(key: string) {
  switch (key) {
    case "website":
      return "Website";
    case "shop":
      return "Shop";
    case "instagram":
      return "Instagram";
    case "x":
      return "X";
    case "facebook":
      return "Facebook";
    case "tumblr":
      return "Tumblr";
    case "pixiv":
      return "Pixiv";
    case "bluesky":
      return "Bluesky";
    default:
      return key.charAt(0).toUpperCase() + key.slice(1);
  }
}

function normalizeUrl(url: string) {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function normalizeLinks(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};

  const rawObj = raw as Record<string, unknown>;
  const candidate =
    rawObj.linksByKey && typeof rawObj.linksByKey === "object"
      ? (rawObj.linksByKey as Record<string, unknown>)
      : rawObj;

  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(candidate)) {
    if (typeof value === "string" && value.trim()) {
      out[key] = value.trim();
    }
  }

  return out;
}

function detectLinkKey(value: string) {
  let key = "website";

  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes("instagram")) key = "instagram";
    else if (hostname.includes("twitter") || hostname.includes("x.com")) key = "x";
    else if (hostname.includes("facebook")) key = "facebook";
    else if (hostname.includes("tumblr")) key = "tumblr";
    else if (hostname.includes("pixiv")) key = "pixiv";
    else if (hostname.includes("bsky") || hostname.includes("bluesky")) key = "bluesky";
    else if (
      hostname.includes("etsy") ||
      hostname.includes("shopify") ||
      hostname.includes("bigcartel")
    ) {
      key = "shop";
    } else {
      key = "website";
    }
  } catch {
    key = "website";
  }

  return key;
}

export default function OrganizerProfilePage({
  organizerId,
  isPopup = false,
  onClose,
}: OrganizerProfilePageProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<OrganizerRow | null>(null);
  const [forms, setForms] = useState<FormRow[]>([]);
  const [newLinkValue, setNewLinkValue] = useState("");
  const [newSalesLocationValue, setNewSalesLocationValue] = useState("");
  const [activeEdit, setActiveEdit] = useState<EditField>(null);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const salesLocationInputRef = useRef<HTMLInputElement | null>(null);
  const newLinkInputRef = useRef<HTMLInputElement | null>(null);

  const [editable, setEditable] = useState<EditableState>({
    name: "",
    location: "",
    salesLocations: [],
    links: {},
  });

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await fetch(
          `/api/forms/mine?organizerId=${encodeURIComponent(organizerId)}`
        );
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load organizer profile.");
        }

        const nextProfile = json.profile ?? json.pprofile ?? null;
        const nextForms = (json.forms ?? []) as FormRow[];
        const normalizedLinks = normalizeLinks(nextProfile?.links);

        if (!ignore) {
          setProfile(nextProfile);
          setForms(nextForms);
          setEditable({
            name: nextProfile?.name ?? "",
            location: nextProfile?.location ?? "",
            salesLocations: Array.isArray(nextProfile?.salesLocation)
              ? nextProfile.salesLocation.filter(
                  (value: unknown): value is string =>
                    typeof value === "string" && value.trim().length > 0
                )
              : typeof nextProfile?.salesLocation === "string" &&
                nextProfile.salesLocation.trim()
              ? [nextProfile.salesLocation.trim()]
              : nextProfile?.location
              ? [nextProfile.location]
              : [],
            links: normalizedLinks,
          });
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message || "Failed to load organizer profile.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (organizerId) loadProfile();

    return () => {
      ignore = true;
    };
  }, [organizerId]);

  useEffect(() => {
    if (!isPopup) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isPopup]);

  useEffect(() => {
    if (activeEdit === "name") nameInputRef.current?.focus();
    if (activeEdit === "location") locationInputRef.current?.focus();
    if (activeEdit === "newSalesLocation") salesLocationInputRef.current?.focus();
    if (activeEdit === "newLink") newLinkInputRef.current?.focus();
  }, [activeEdit]);

  async function handleSignOut() {
    await supabase.auth.signOut();

    if (isPopup && onClose) {
      onClose();
    }

    router.push("/");
    router.refresh();
  }

  function handleClose() {
    if (isPopup && onClose) {
      onClose();
      return;
    }

    router.back();
  }

  function updateField<K extends keyof EditableState>(
    key: K,
    value: EditableState[K]
  ) {
    setEditable((prev) => ({ ...prev, [key]: value }));
  }

  function handleLinkChange(key: string, value: string) {
    setEditable((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [key]: value,
      },
    }));
  }

  function handleAddLink() {
    const value = newLinkValue.trim();
    if (!value) return;

    const key = detectLinkKey(value);

    setEditable((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [key]: value,
      },
    }));

    setNewLinkValue("");
    setActiveEdit(null);
  }

  function handleRemoveLink(key: string) {
    setEditable((prev) => {
      const nextLinks = { ...prev.links };
      delete nextLinks[key];
      return {
        ...prev,
        links: nextLinks,
      };
    });
  }

  function handleRemoveSalesLocation(indexToRemove: number) {
    setEditable((prev) => ({
      ...prev,
      salesLocations: prev.salesLocations.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  }

  function handleAddSalesLocation() {
    const value = newSalesLocationValue.trim();
    if (!value) return;

    setEditable((prev) => ({
      ...prev,
      salesLocations: [...prev.salesLocations, value],
    }));

    setNewSalesLocationValue("");
    setActiveEdit(null);
  }

  function handleOpenNewSalesLocation() {
    setNewSalesLocationValue("");
    setActiveEdit("newSalesLocation");
  }

  const formsCount = forms.length;

  const applicationsCount = useMemo(() => {
    return forms.reduce((sum, form) => sum + (form.applications_count ?? 0), 0);
  }, [forms]);

  const avatarUrl = profile?.profile_image_url?.trim() || "";
  const emailText = profile?.email?.trim() || "email@konfolio.com";
  const memberSince = formatMemberSince(profile?.created_at ?? null);
  const locationText = editable.location.trim() || "City, Country";
  const salesLocations = editable.salesLocations;

  const linkEntries = Object.entries(editable.links).filter(
    ([, value]) => typeof value === "string" && value.trim()
  );

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const cleanedLinks = Object.fromEntries(
        Object.entries(editable.links).filter(
          ([, value]) => typeof value === "string" && value.trim()
        )
      );

      const cleanedSalesLocations = editable.salesLocations
        .map((value) => value.trim())
        .filter(Boolean);

      const res = await fetch("/api/organizer/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizerId,
          name: editable.name.trim(),
          location: editable.location.trim(),
          salesLocation: cleanedSalesLocations,
          links: cleanedLinks,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to save profile.");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: editable.name.trim(),
              location: editable.location.trim(),
              salesLocation: cleanedSalesLocations,
              links: cleanedLinks,
            }
          : prev
      );

      setSuccess("Changes saved.");
      setActiveEdit(null);
    } catch (err: any) {
      setError(err?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const card = (
    <div className="relative w-full overflow-hidden rounded-[15px] bg-white shadow-[5px_5px_25px_rgba(0,0,0,0.10)]">
      <div className="absolute right-[20px] top-[20px] z-[5] flex items-center gap-[14px]">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-[48px] min-w-[168px] items-center justify-center rounded-full border border-[#262626] px-[30px] text-[15px] leading-[130%] text-[#262626] transition hover:bg-[#262626] hover:text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="flex h-[26px] w-[26px] items-center justify-center"
        >
          <DeleteIcon className="h-[26px] w-[26px]" />
        </button>
      </div>

      <div className="relative h-full overflow-y-auto px-[130px]">
        <div className="sticky top-0 z-[2] bg-white">
          <div className="flex flex-row items-center py-[25px]">
            <p className="flex-1 whitespace-nowrap text-[12px] leading-[130%] text-[#A5A5A5]">
              Organizer profile
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-[40px] text-[15px] leading-[150%] text-[#A5A5A5]">
            Loading...
          </div>
        ) : error ? (
          <div className="py-[40px] text-[15px] leading-[150%] text-[#FF4603]">
            {error}
          </div>
        ) : (
          <div className="flex flex-row items-start gap-[29px] py-[20px]">
            <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[71.4286px] bg-[#F7F7F7]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Organizer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #E9E9E9 25%, transparent 25%), linear-gradient(-45deg, #E9E9E9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E9E9E9 75%), linear-gradient(-45deg, transparent 75%, #E9E9E9 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition:
                      "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                />
              )}
            </div>

            <div className="flex w-[526px] flex-col gap-[50px]">
              <div className="flex w-[300px] flex-col gap-[15px]">
                <EditableDisplay
                  isEditing={activeEdit === "name"}
                  onStartEdit={() => setActiveEdit("name")}
                  onFinishEdit={() => setActiveEdit(null)}
                  displayClassName="text-[22px] leading-[140%] text-[#262626]"
                  hoverClassName="min-h-[40px]"
                  displayValue={editable.name || "Organization Name"}
                  editNode={
                    <input
                      ref={nameInputRef}
                      value={editable.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      onBlur={() => setActiveEdit(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setActiveEdit(null);
                        if (e.key === "Escape") setActiveEdit(null);
                      }}
                      className="w-full bg-transparent text-[22px] leading-[140%] text-[#262626] outline-none"
                      placeholder="Organization Name"
                    />
                  }
                />

                <div className="mt-[-10px] flex flex-row items-center gap-[5px]">
                  <span className="flex h-[12px] w-[12px] items-center justify-center">
                    <LocationIcon className="h-[12px] w-[12px] text-[#A5A5A5]" />
                  </span>

                  <EditableDisplay
                    isEditing={activeEdit === "location"}
                    onStartEdit={() => setActiveEdit("location")}
                    onFinishEdit={() => setActiveEdit(null)}
                    displayClassName="text-[15px] leading-[150%] text-[#262626]"
                    hoverClassName="min-h-[28px] flex-1"
                    displayValue={locationText}
                    editNode={
                      <input
                        ref={locationInputRef}
                        value={editable.location}
                        onChange={(e) => updateField("location", e.target.value)}
                        onBlur={() => setActiveEdit(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setActiveEdit(null);
                          if (e.key === "Escape") setActiveEdit(null);
                        }}
                        className="w-full bg-transparent text-[15px] leading-[150%] text-[#262626] outline-none"
                        placeholder="City, Country"
                      />
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[10px]">
                <p className="text-[15px] leading-[150%] text-[#262626]">
                  {emailText}
                </p>
              </div>

              <div className="flex flex-row gap-[60px]">
                <div className="flex flex-col gap-[6px]">
                  <p className="text-[15px] leading-[150%] text-[#A5A5A5]">
                    Forms
                  </p>
                  <p className="text-[15px] leading-[150%] text-[#262626]">
                    {formsCount}
                  </p>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <p className="text-[15px] leading-[150%] text-[#A5A5A5]">
                    Applications
                  </p>
                  <p className="text-[15px] leading-[150%] text-[#262626]">
                    {applicationsCount}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col items-start gap-[15px]">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">
                  Sales Location
                </p>

                <div className="flex flex-wrap items-center gap-[10px]">
                  {salesLocations.map((location, index) => (
                    <div key={`${location}-${index}`} className="group relative">
                      <span className="inline-flex h-[44px] w-[190px] items-center justify-center rounded-full border border-[#BDBDBD] px-[24px] text-center text-[14px] leading-[130%] text-[#262626]">
                        {location}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveSalesLocation(index)}
                        className="absolute -right-[6px] -top-[6px] hidden h-[20px] w-[20px] items-center justify-center rounded-full bg-white text-[#A5A5A5] shadow-sm group-hover:flex hover:text-[#262626]"
                        aria-label="Remove sales location"
                      >
                        <X className="h-[12px] w-[12px]" />
                      </button>
                    </div>
                  ))}

                  {activeEdit === "newSalesLocation" ? (
                    <input
                      ref={salesLocationInputRef}
                      value={newSalesLocationValue}
                      onChange={(e) => setNewSalesLocationValue(e.target.value)}
                      onBlur={() => {
                        if (!newSalesLocationValue.trim()) {
                          setActiveEdit(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSalesLocation();
                        if (e.key === "Escape") {
                          setNewSalesLocationValue("");
                          setActiveEdit(null);
                        }
                      }}
                      placeholder="California, US"
                      className="inline-flex h-[44px] w-[190px] rounded-full border border-[#BDBDBD] px-[24px] text-center text-[14px] leading-[130%] text-[#262626] outline-none"
                    />
                  ) : null}

                  <button
                    type="button"
                    onClick={handleOpenNewSalesLocation}
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#BDBDBD] text-[#A5A5A5] transition hover:text-[#262626]"
                    aria-label="Add sales location"
                  >
                    <Plus className="h-[16px] w-[16px]" />
                  </button>
                </div>
              </div>

              <div className="flex w-full flex-col items-start gap-[15px]">
                <p className="w-full text-[15px] leading-[150%] text-[#A5A5A5]">
                  My Links
                </p>

                <div className="flex w-full flex-col gap-[12px]">
                  {linkEntries.length > 0 ? (
                    linkEntries.map(([key, value]) => {
                      const fieldKey = `link:${key}` as const;
                      const isEditing = activeEdit === fieldKey;

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-[12px]"
                        >
                          {isEditing ? (
                            <input
                              value={String(value)}
                              onChange={(e) =>
                                handleLinkChange(key, e.target.value)
                              }
                              onBlur={() => setActiveEdit(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setActiveEdit(null);
                                if (e.key === "Escape") setActiveEdit(null);
                              }}
                              className="w-full bg-transparent text-[15px] leading-[150%] text-[#262626] underline underline-offset-2 outline-none"
                              placeholder={prettyLinkLabel(key)}
                              autoFocus
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveEdit(fieldKey)}
                              className="group flex items-center gap-[8px] text-left"
                            >
                              <span className="text-[15px] leading-[150%] text-[#262626] underline underline-offset-2">
                                {prettyLinkLabel(key)}
                              </span>
                              <Pencil className="h-[13px] w-[13px] text-[#A5A5A5] opacity-0 transition group-hover:opacity-100" />
                            </button>
                          )}

                          <div className="flex items-center gap-[10px]">
                            {!isEditing ? (
                              <a
                                href={normalizeUrl(String(value))}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13px] leading-[130%] text-[#A5A5A5] hover:text-[#262626]"
                              >
                                Open
                              </a>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleRemoveLink(key)}
                              className="text-[13px] leading-[130%] text-[#A5A5A5] hover:text-[#262626]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[15px] leading-[150%] text-[#A5A5A5]">
                      No links added
                    </p>
                  )}

                  {activeEdit === "newLink" ? (
                    <div className="flex items-center gap-[10px] pt-[4px]">
                      <input
                        ref={newLinkInputRef}
                        value={newLinkValue}
                        onChange={(e) => setNewLinkValue(e.target.value)}
                        onBlur={() => {
                          if (!newLinkValue.trim()) setActiveEdit(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddLink();
                          if (e.key === "Escape") {
                            setNewLinkValue("");
                            setActiveEdit(null);
                          }
                        }}
                        placeholder="Paste link"
                        className="flex-1 bg-transparent text-[15px] leading-[150%] text-[#262626] underline underline-offset-2 outline-none placeholder:text-[#A5A5A5]"
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="text-[24px] leading-none text-[#A5A5A5]"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveEdit("newLink")}
                      className="group flex items-center gap-[8px] pt-[4px] text-left"
                    >
                      <span className="text-[15px] leading-[150%] text-[#A5A5A5] underline underline-offset-2">
                        Add Link
                      </span>
                      <Pencil className="h-[13px] w-[13px] text-[#A5A5A5] opacity-0 transition group-hover:opacity-100" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[15px] leading-[150%] text-[#A5A5A5]">
                {memberSince}
              </p>

              {success ? (
                <p className="mt-[-30px] text-[14px] leading-[150%] text-green-600">
                  {success}
                </p>
              ) : null}

              <div className="flex w-full flex-col items-start">
                <AsideRow
                  label="Support"
                  onClick={() => router.push("/support")}
                />
                <AsideRow
                  label="Report issue"
                  onClick={() => router.push("/report-issue")}
                />
                <AsideRow
                  label="Sign out"
                  danger
                  onClick={handleSignOut}
                />
              </div>

              <p className="pb-[40px] text-[15px] leading-[150%] text-[#A5A5A5]">
                Beta v.1.0
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isPopup) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/30"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "min(920px, calc(100vw - 48px))",
          maxHeight: "88vh",
          overflow: "auto",
        }}
      >
        {card}
      </div>
    </div>
  );
}

  return (
  <div className="min-h-screen bg-[#F7F7F7]">
    <div className="w-full px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto w-full max-w-[995px]">{card}</div>
    </div>
  </div>
);
}

function EditableDisplay({
  isEditing,
  onStartEdit,
  onFinishEdit,
  displayValue,
  displayClassName,
  hoverClassName = "",
  editNode,
}: {
  isEditing: boolean;
  onStartEdit: () => void;
  onFinishEdit: () => void;
  displayValue: string;
  displayClassName: string;
  hoverClassName?: string;
  editNode: ReactNode;
}) {
  if (isEditing) {
    return <div className={hoverClassName}>{editNode}</div>;
  }

  return (
    <button
      type="button"
      onClick={onStartEdit}
      onBlur={onFinishEdit}
      className={`group flex w-full items-center gap-[8px] text-left ${hoverClassName}`}
    >
      <span className={displayClassName}>{displayValue}</span>
      <Pencil className="h-[14px] w-[14px] shrink-0 text-[#A5A5A5] opacity-0 transition group-hover:opacity-100" />
    </button>
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
      className="flex h-[48px] w-[526px] items-center rounded-[10px] px-[10px] text-left hover:bg-black/5"
    >
      <span
        className={[
          "flex items-center text-[14px] leading-[130%] font-normal",
          danger ? "text-[#FF4603]" : "text-[#262626]",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}