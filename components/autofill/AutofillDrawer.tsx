"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";

type Konfolio = {
  id: string;
  portfolio_name: string | null;
  thumbnail_url: string | null;
  updated_at: string;
  portfolio_slug: string | null;
};

function cleanValue(value: any) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  if (Array.isArray(value) && value.length === 0) {
    return undefined;
  }

  return value;
}

function getLinkValue(profile: any, key: string) {
  const links = profile?.links;

  if (!links) {
    return undefined;
  }

  if (links.linksByKey?.[key]?.url) {
    return links.linksByKey[key].url;
  }

  if (links.linksByKey?.[key]) {
    return links.linksByKey[key];
  }

  if (links[key]?.url) {
    return links[key].url;
  }

  if (links[key]) {
    return links[key];
  }

  return undefined;
}

function inferFieldKey(field: any): string | undefined {
  if (field.field_key) {
    return field.field_key;
  }

  if (field.fieldKey) {
    return field.fieldKey;
  }

  const normalizedLabel = String(field.label ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");

  const labelMap: Record<string, string> = {
    "first name": "first_name",
    "last name": "last_name",
    "preferred name": "preferred_name",
    "display name": "display_name",
    "your name": "display_name",
    "full name": "display_name",

    "business name": "business_name",
    "brand name": "business_name",

    email: "email",
    "email address": "email",
    "business email": "email",

    location: "location",
    "business location": "location",
    "where are you located": "location",

    instagram: "instagram",
    "instagram link": "instagram",
    "instagram url": "instagram",
    "instagram handle": "instagram",

    tiktok: "tiktok",
    "tiktok link": "tiktok",
    "tiktok url": "tiktok",
    "tiktok handle": "tiktok",

    website: "website",
    "website link": "website",
    "website url": "website",

    portfolio: "portfolio",
    "portfolio website": "portfolio",

    "konfolio link": "konfolio_link",
    "konfolio url": "konfolio_link",
    "portfolio link": "konfolio_link",
    "public portfolio link": "konfolio_link",

    "portfolio name": "portfolio_name",
    "konfolio name": "portfolio_name",

    "sales permit": "sales_permit",
    "seller permit": "sales_permit",
    "do you have a sales permit": "sales_permit",

    "will apply": "will_apply",
    "will you apply": "will_apply",

    collaborations: "collabs",
    collabs: "collabs",

    "first vend": "first_vend",
    "first vending event": "first_vend",

    "previous vending": "previous_vending",
    "previous vending experience": "previous_vending",
    "vending experience": "previous_vending",
  };

  return labelMap[normalizedLabel];
}

function getProfileValue({
  fieldKey,
  profile,
  userEmail,
  konfolio,
  publicKonfolioUrl,
}: {
  fieldKey: string | undefined;
  profile: any;
  userEmail: string | null;
  konfolio: Konfolio;
  publicKonfolioUrl: string;
}) {
  if (!fieldKey) {
    return undefined;
  }

  const values: Record<string, any> = {
    first_name: profile?.first_name,
    last_name: profile?.last_name,
    preferred_name: profile?.preferred_name,
    display_name: profile?.display_name,
    business_name: profile?.business_name,
    email: userEmail,

    location: profile?.location,
    sales_permit: profile?.sales_permit,
    will_apply: profile?.will_apply,
    collabs: profile?.collabs,
    first_vend: profile?.first_vend,

    previous_vending: profile?.prev_vends,
    prev_vends: profile?.prev_vends,

    vend_experience_1: profile?.prev_vends?.[0],
    vend_experience_2: profile?.prev_vends?.[1],
    vend_experience_3: profile?.prev_vends?.[2],
    vend_experience_4: profile?.prev_vends?.[3],

    instagram: getLinkValue(profile, "instagram"),
    tiktok: getLinkValue(profile, "tiktok"),
    website: getLinkValue(profile, "website"),
    portfolio: getLinkValue(profile, "portfolio"),

    konfolio_link: publicKonfolioUrl,
    portfolio_name: konfolio.portfolio_name,
    konfolio_name: konfolio.portfolio_name,
  };

  return cleanValue(values[fieldKey]);
}

function formatValueForField(value: any, field: any) {
  if (value === undefined) {
    return undefined;
  }

  const fieldType = field.type ?? "short_text";

  if (typeof value === "boolean") {
    if (
      fieldType === "multiple_choice" &&
      Array.isArray(field.options)
    ) {
      const yesOption = field.options.find(
        (option: string) => option.toLowerCase() === "yes",
      );

      const noOption = field.options.find(
        (option: string) => option.toLowerCase() === "no",
      );

      if (value && yesOption) {
        return yesOption;
      }

      if (!value && noOption) {
        return noOption;
      }
    }

    return value;
  }

  if (Array.isArray(value)) {
    if (
      fieldType === "checkbox" ||
      fieldType === "checkboxes"
    ) {
      return value;
    }

    return value.join(", ");
  }

  return value;
}

export default function AutofillDrawer({
  autofillData,
  fields,
  onClose,
  onAutofill,
}: {
  autofillData: Record<string, any>;
  fields: any[];
  onClose: () => void;
  onAutofill: (
    data: Record<string, any>,
    konfolioId: string,
  ) => void;
}) {
  const [konfolios, setKonfolios] = useState<Konfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState("Your Name");
  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState<string | null>(
    null,
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<
    Record<string, any> | null
  >(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "Failed to load the current user for autofill:",
            userError,
          );
        }

        if (!user) {
          return;
        }

        setUserEmail(user.email ?? null);

        const [konfolioRes, profileRes] = await Promise.all([
          supabase
            .from("konfolios")
            .select(`
              id,
              portfolio_name,
              thumbnail_url,
              updated_at,
              portfolio_slug
            `)
            .eq("user_id", user.id)
            .eq("status", "published")
            .order("updated_at", {
              ascending: false,
            }),

          supabase
            .from("profiles")
            .select(`
              first_name,
              last_name,
              preferred_name,
              display_name,
              business_name,
              business_slug,
              location,
              sales_permit,
              will_apply,
              collabs,
              first_vend,
              prev_vends,
              links,
              avatar_url,
              profile_image_url
            `)
            .eq("id", user.id)
            .single(),
        ]);

        if (konfolioRes.error) {
          console.error(
            "Failed to load published Konfolios:",
            konfolioRes.error,
          );
        }

        if (konfolioRes.data) {
          setKonfolios(konfolioRes.data);
        }

        if (profileRes.error) {
          console.error(
            "Failed to load applicant profile:",
            profileRes.error,
          );
        }

        if (profileRes.data) {
          const profile = profileRes.data;

          setProfileData(profile);

          const name =
            profile.display_name ||
            [profile.first_name, profile.last_name]
              .filter(Boolean)
              .join(" ") ||
            "Your Name";

          setDisplayName(name);
          setBusinessName(profile.business_name ?? "");
          setBusinessSlug(profile.business_slug ?? null);

          setAvatarUrl(
            profile.avatar_url ??
              profile.profile_image_url ??
              null,
          );
        }
      } catch (error) {
        console.error("Failed to load autofill drawer:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getPublicKonfolioPath = (konfolio: Konfolio) => {
    if (!businessSlug || !konfolio.portfolio_slug) {
      return "";
    }

    return `/${businessSlug}/${konfolio.portfolio_slug}`;
  };

  const getPublicKonfolioUrl = (konfolio: Konfolio) => {
    const path = getPublicKonfolioPath(konfolio);

    if (!path) {
      return "";
    }

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://konfolio.com";

    return `${origin}${path}`;
  };

  const handleSelect = (konfolio: Konfolio) => {
    const publicKonfolioUrl =
      getPublicKonfolioUrl(konfolio);

    const locallyBuiltAutofill: Record<string, any> = {};

    for (const field of fields ?? []) {
      const fieldKey = inferFieldKey(field);

      const rawValue = getProfileValue({
        fieldKey,
        profile: profileData,
        userEmail,
        konfolio,
        publicKonfolioUrl,
      });

      const formattedValue = formatValueForField(
        rawValue,
        field,
      );

      if (formattedValue !== undefined) {
        locallyBuiltAutofill[field.id] = formattedValue;
      }
    }

    /*
     * The drawer builds autofill locally from the applicant's
     * profile as a fallback.
     *
     * Values returned by the public form API override the local
     * values when the server was able to compute them.
     */
    const merged: Record<string, any> = {
      ...locallyBuiltAutofill,
      ...autofillData,
    };

    console.log(
      "LOCAL PROFILE AUTOFILL:",
      locallyBuiltAutofill,
    );

    console.log("SERVER AUTOFILL:", autofillData);
    console.log("FINAL AUTOFILL SENT TO FORM:", merged);

    onAutofill(merged, konfolio.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-[380px] bg-[#1C1C1C] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-white/10">
          <span className="text-[13px] text-white/50 font-medium tracking-wide uppercase">
            Select Autofill
          </span>

          <button
            type="button"
            className="text-white/30 hover:text-white text-[11px] font-mono"
          >
            {"</>"}
          </button>
        </div>

        {/* Profile row */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-white/10">
          <div className="flex items-center gap-[12px]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-[36px] h-[36px] rounded-full bg-white/10 flex items-center justify-center text-[13px] text-white/50">
                {displayName[0]?.toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-[14px] text-white font-medium">
                {businessName || "Business Name"}
              </p>

              <p className="text-[12px] text-white/40">
                {displayName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="px-[20px] py-[14px] text-[13px] text-white/50">
          Select a portfolio to use as autofill.
        </p>

        {/* Konfolio list */}
        <div className="flex-1 overflow-y-auto px-[16px] pb-[20px] flex flex-col gap-[12px]">
          {loading && (
            <p className="text-[13px] text-white/30 text-center py-8">
              Loading...
            </p>
          )}

          {!loading && konfolios.length === 0 && (
            <p className="text-[13px] text-white/30 text-center py-8">
              No portfolios found.
            </p>
          )}

          {konfolios.map((konfolio) => {
            const publicKonfolioPath =
              getPublicKonfolioPath(konfolio);

            return (
              <div
                key={konfolio.id}
                onClick={() => handleSelect(konfolio)}
                className="rounded-[12px] bg-white/5 border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-full h-[160px] bg-white/5">
                  {konfolio.thumbnail_url ? (
                    <Image
                      src={konfolio.thumbnail_url}
                      alt={
                        konfolio.portfolio_name ??
                        "Portfolio"
                      }
                      width={348}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                </div>

                {/* Info */}
                <div className="px-[14px] py-[12px] flex items-center justify-between">
                  <div>
                    <p className="text-[14px] text-white">
                      {konfolio.portfolio_name ??
                        "Portfolio Name"}
                    </p>

                    <div className="flex items-center gap-[6px] mt-[4px]">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3v4l2.5 2.5"
                          stroke="white"
                          strokeOpacity="0.4"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>

                      <span className="text-[11px] text-white/40">
                        {new Date(
                          konfolio.updated_at,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {publicKonfolioPath && (
                    <Link
                      href={publicKonfolioPath}
                      target="_blank"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className="flex items-center gap-[6px] bg-[#262626] text-white text-[12px] px-[12px] py-[6px] rounded-full hover:bg-white/20 transition-colors"
                    >
                      View

                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8A1.5 1.5 0 0 0 13 12.5V10M10 2h4m0 0v4m0-4L6.5 9.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}