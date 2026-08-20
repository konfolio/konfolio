"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";

type SocialKey =
  | "website"
  | "shop"
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "tumblr"
  | "pixiv"
  | "bluesky";

type KonfolioContent = {
  email?: string;
  businessName?: string;
  displayName?: string;
  locationText?: string;
  merchTags?: string[];
  previousVends?: string[];
  links?: {
    activeKeys?: string[];
    linksByKey?: Record<
      string,
      string | { url?: string } | null | undefined
    >;
    [key: string]: unknown;
  };
};

type Konfolio = {
  id: string;
  portfolio_name: string | null;
  thumbnail_url: string | null;
  updated_at: string;
  portfolio_slug: string | null;
  content: KonfolioContent | string | null;
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

function getKonfolioContent(
  konfolio: Konfolio,
): KonfolioContent {
  if (!konfolio.content) {
    return {};
  }

  if (typeof konfolio.content === "string") {
    try {
      const parsed = JSON.parse(konfolio.content);

      if (parsed && typeof parsed === "object") {
        return parsed as KonfolioContent;
      }
    } catch (error) {
      console.error(
        "Failed to parse Konfolio content for autofill:",
        error,
      );
    }

    return {};
  }

  return konfolio.content;
}

function readLinkValue(value: unknown) {
  if (typeof value === "string") {
    return cleanValue(value);
  }

  if (
    value &&
    typeof value === "object" &&
    "url" in value
  ) {
    return cleanValue(
      (value as { url?: unknown }).url,
    );
  }

  return undefined;
}

function getLinkValue(source: any, key: string) {
  const links = source?.links;

  if (!links) {
    return undefined;
  }

  const valueFromLinksByKey = readLinkValue(
    links.linksByKey?.[key],
  );

  if (valueFromLinksByKey !== undefined) {
    return valueFromLinksByKey;
  }

  return readLinkValue(links[key]);
}

function getKonfolioLinkValue(
  content: KonfolioContent,
  key: string,
) {
  const activeKeys = content.links?.activeKeys;

  if (
    Array.isArray(activeKeys) &&
    !activeKeys.includes(key)
  ) {
    return undefined;
  }

  return getLinkValue(content, key);
}

function getPreferredLinkValue({
  content,
  profile,
  key,
}: {
  content: KonfolioContent;
  profile: any;
  key: SocialKey | string;
}) {
  const hasKonfolioLinkConfiguration = Boolean(
    content.links &&
      (Array.isArray(content.links.activeKeys) ||
        content.links.linksByKey),
  );

  if (hasKonfolioLinkConfiguration) {
    return cleanValue(
      getKonfolioLinkValue(content, key),
    );
  }

  return cleanValue(getLinkValue(profile, key));
}

const LINK_LABELS: Record<string, string> = {
  website: "Website",
  shop: "Shop",
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
  tumblr: "Tumblr",
  pixiv: "Pixiv",
  bluesky: "Bluesky",
};

function getOtherLinksText({
  content,
  profile,
}: {
  content: KonfolioContent;
  profile: any;
}) {
  const keys = new Set<string>();
  const activeKeys = content.links?.activeKeys;

  if (Array.isArray(activeKeys)) {
    for (const key of activeKeys) {
      if (typeof key === "string" && key.trim()) {
        keys.add(key);
      }
    }
  } else {
    const linksByKey = content.links?.linksByKey;

    if (linksByKey && typeof linksByKey === "object") {
      for (const key of Object.keys(linksByKey)) {
        keys.add(key);
      }
    }
  }

  const profileLinksByKey = profile?.links?.linksByKey;

  if (profileLinksByKey && typeof profileLinksByKey === "object") {
    for (const key of Object.keys(profileLinksByKey)) {
      keys.add(key);
    }
  }

  for (const key of Object.keys(LINK_LABELS)) {
    keys.add(key);
  }

  const lines = Array.from(keys)
    .map((key) => {
      const value = getPreferredLinkValue({
        content,
        profile,
        key,
      });

      if (!value) {
        return null;
      }

      const label =
        LINK_LABELS[key] ??
        key
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
          );

      return `${label}: ${value}`;
    })
    .filter((line): line is string => Boolean(line));

  return cleanValue(lines.join("\n"));
}

function normalizeFieldKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function inferFieldKey(field: any): string | undefined {
  if (field.field_key) {
    return cleanValue(normalizeFieldKey(field.field_key));
  }

  if (field.fieldKey) {
    return cleanValue(normalizeFieldKey(field.fieldKey));
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

    shop: "shop",
    "shop link": "shop",
    "shop url": "shop",
    store: "shop",
    "store link": "shop",
    "store url": "shop",

    facebook: "facebook",
    "facebook link": "facebook",
    "facebook url": "facebook",

    x: "x",
    twitter: "x",
    "x link": "x",
    "x url": "x",
    "twitter link": "x",
    "twitter url": "x",

    tumblr: "tumblr",
    "tumblr link": "tumblr",
    "tumblr url": "tumblr",

    pixiv: "pixiv",
    "pixiv link": "pixiv",
    "pixiv url": "pixiv",

    bluesky: "bluesky",
    "bluesky link": "bluesky",
    "bluesky url": "bluesky",

    "other link": "other_links",
    "other links": "other_links",
    "additional link": "additional_link",
    "additional links": "other_links",
    "social link": "social_media_link",
    "social media link": "social_media_link",
    "social links": "other_links",
    "social media links": "other_links",
    links: "other_links",

    "online shop": "shop",

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
    "do you have a valid sales permit in california ca": "sales_permit",

    "will apply": "will_apply",
    "will you apply": "will_apply",

    collaborations: "collabs",
    collabs: "collabs",

    "first vend": "first_vend",
    "first vending event": "first_vend",

    merchandise: "merchandise_tags",
    "your merchandise": "merchandise_tags",
    "merchandise tags": "merchandise_tags",
    "merchandise types": "merchandise_tags",
    "merch tags": "merchandise_tags",
    "product tags": "merchandise_tags",
    products: "merchandise_tags",
    "products sold": "merchandise_tags",
    "what do you sell": "merchandise_tags",
    "what merchandise do you sell": "merchandise_tags",

    "have you vended for us previously": "has_previous_vends",
    "have you vended previously": "has_previous_vends",

    "vend experience 1": "vend_experience_1",
    "vend experience 2": "vend_experience_2",
    "vend experience 3": "vend_experience_3",
    "vend experience 4": "vend_experience_4",

    "previous vends": "previous_vending",
    "past vends": "previous_vending",
    "past events": "previous_vending",
    "previous events": "previous_vending",
    "previous vending": "previous_vending",
    "previous vending events": "previous_vending",
    "previous vending experience": "previous_vending",
    "vending experience": "previous_vending",
    "events vended": "previous_vending",
    "events you have vended": "previous_vending",
  };

  return labelMap[normalizedLabel];
}

function getAutofillValue({
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

  const content = getKonfolioContent(konfolio);

  const merchTags = Array.isArray(content.merchTags)
    ? content.merchTags
        .filter(
          (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
        )
        .map((value) => value.trim())
    : [];

  const previousVendsFromKonfolio = Array.isArray(
    content.previousVends,
  )
    ? content.previousVends
        .filter(
          (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
        )
        .map((value) => value.trim())
    : [];

  const previousVends =
    previousVendsFromKonfolio.length > 0
      ? previousVendsFromKonfolio
      : Array.isArray(profile?.prev_vends)
        ? profile.prev_vends
        : [];

  const website = getPreferredLinkValue({
    content,
    profile,
    key: "website",
  });

  const shop = getPreferredLinkValue({
    content,
    profile,
    key: "shop",
  });

  const instagram = getPreferredLinkValue({
    content,
    profile,
    key: "instagram",
  });

  const facebook = getPreferredLinkValue({
    content,
    profile,
    key: "facebook",
  });

  const x =
    getPreferredLinkValue({
      content,
      profile,
      key: "x",
    }) ??
    getPreferredLinkValue({
      content,
      profile,
      key: "twitter",
    });

  const tiktok = getPreferredLinkValue({
    content,
    profile,
    key: "tiktok",
  });

  const tumblr = getPreferredLinkValue({
    content,
    profile,
    key: "tumblr",
  });

  const pixiv = getPreferredLinkValue({
    content,
    profile,
    key: "pixiv",
  });

  const bluesky = getPreferredLinkValue({
    content,
    profile,
    key: "bluesky",
  });

  const otherLinks = getOtherLinksText({
    content,
    profile,
  });

  const socialMediaLink =
    instagram ??
    x ??
    facebook ??
    tiktok ??
    bluesky ??
    tumblr ??
    pixiv;

  const additionalLink =
    website ??
    x ??
    facebook ??
    tiktok ??
    bluesky ??
    tumblr ??
    pixiv;

  const values: Record<string, any> = {
    first_name: profile?.first_name,
    last_name: profile?.last_name,
    preferred_name: profile?.preferred_name,
    display_name:
      profile?.display_name ?? content.displayName,

    business_name:
      content.businessName ?? profile?.business_name,

    email: content.email ?? userEmail,

    location:
      content.locationText ?? profile?.location,

    sales_permit: profile?.sales_permit,
    will_apply: profile?.will_apply,
    collabs: profile?.collabs,
    first_vend: profile?.first_vend,

    has_previous_vends: previousVends.length > 0,
    previous_vending: previousVends,
    previous_vends: previousVends,
    prev_vends: previousVends,
    past_vends: previousVends,
    past_events: previousVends,
    previous_events: previousVends,

    vend_experience_1: previousVends[0],
    vend_experience_2: previousVends[1],
    vend_experience_3: previousVends[2],
    vend_experience_4: previousVends[3],

    merchandise_tags: merchTags,
    merch_tags: merchTags,
    merchandise: merchTags,
    product_tags: merchTags,
    products: merchTags,

    website,
    shop,
    store: shop,
    instagram,
    facebook,
    x,
    twitter: x,
    tiktok,
    tumblr,
    pixiv,
    bluesky,

    social_media_link: socialMediaLink,
    additional_link: additionalLink,
    other_links: otherLinks,
    additional_links: otherLinks,
    social_links: otherLinks,
    social_media_links: otherLinks,
    links: otherLinks,

    portfolio:
      getPreferredLinkValue({
        content,
        profile,
        key: "portfolio",
      }) ?? publicKonfolioUrl,

    konfolio_link: publicKonfolioUrl,
    portfolio_name: konfolio.portfolio_name,
    konfolio_name: konfolio.portfolio_name,
  };

  return cleanValue(values[fieldKey]);
}

function normalizeComparableValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function getFieldOptionEntries(field: any) {
  if (!Array.isArray(field?.options)) {
    return [];
  }

  return field.options
    .map((option: any) => {
      if (typeof option === "string") {
        return {
          label: option,
          value: option,
        };
      }

      if (option && typeof option === "object") {
        const label =
          option.label ??
          option.text ??
          option.name ??
          option.value;

        const value =
          option.value ??
          option.label ??
          option.text ??
          option.name;

        if (label !== undefined && value !== undefined) {
          return {
            label: String(label),
            value,
          };
        }
      }

      return null;
    })
    .filter(Boolean) as Array<{
    label: string;
    value: any;
  }>;
}

function findMatchingFieldOption(
  value: unknown,
  field: any,
) {
  const normalizedValue = normalizeComparableValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  const options = getFieldOptionEntries(field);

  const exactMatch = options.find((option) => {
    return (
      normalizeComparableValue(option.label) ===
        normalizedValue ||
      normalizeComparableValue(option.value) ===
        normalizedValue
    );
  });

  if (exactMatch) {
    return exactMatch.value;
  }

  const partialMatch = options.find((option) => {
    const normalizedLabel = normalizeComparableValue(
      option.label,
    );

    const normalizedOptionValue = normalizeComparableValue(
      option.value,
    );

    return (
      normalizedLabel.includes(normalizedValue) ||
      normalizedValue.includes(normalizedLabel) ||
      normalizedOptionValue.includes(normalizedValue) ||
      normalizedValue.includes(normalizedOptionValue)
    );
  });

  return partialMatch?.value;
}

function formatValueForField(value: any, field: any) {
  if (value === undefined) {
    return undefined;
  }

  const fieldType = normalizeFieldKey(
    field.type ?? "short_text",
  );

  const isMerchandiseField =
    normalizeFieldKey(field.field_key ?? field.fieldKey ?? "") ===
    "merchandise";

  const isCheckboxField =
    fieldType === "checkbox" ||
    fieldType === "checkboxes" ||
    fieldType === "multi_select" ||
    fieldType === "multiselect" ||
    fieldType === "multiple_select" ||
    isMerchandiseField;

  const isSingleOptionField =
    !isMerchandiseField &&
    (fieldType === "dropdown" ||
      fieldType === "select" ||
      fieldType === "radio" ||
      fieldType === "multiple_choice");

  if (typeof value === "boolean") {
    const desiredLabel = value ? "yes" : "no";
    const matchingOption = findMatchingFieldOption(
      desiredLabel,
      field,
    );

    if (matchingOption !== undefined) {
      return isCheckboxField
        ? value
          ? [matchingOption]
          : []
        : matchingOption;
    }

    return value;
  }

  if (Array.isArray(value)) {
    const cleanedValues = value
      .map((item) =>
        typeof item === "string" ? item.trim() : item,
      )
      .filter(
        (item) =>
          item !== undefined &&
          item !== null &&
          item !== "",
      );

    if (cleanedValues.length === 0) {
      return undefined;
    }

    if (isCheckboxField) {
      const matchedValues = cleanedValues
        .map((item) =>
          findMatchingFieldOption(item, field),
        )
        .filter(
          (item) => item !== undefined,
        );

      return matchedValues.length > 0
        ? matchedValues
        : cleanedValues;
    }

    if (isSingleOptionField) {
      for (const item of cleanedValues) {
        const matchingOption = findMatchingFieldOption(
          item,
          field,
        );

        if (matchingOption !== undefined) {
          return matchingOption;
        }
      }

      return cleanedValues[0];
    }

    return cleanedValues.join(", ");
  }

  if (isSingleOptionField) {
    return (
      findMatchingFieldOption(value, field) ??
      value
    );
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
    merchTags: string[],
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
              portfolio_slug,
              content
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
          setKonfolios(konfolioRes.data as Konfolio[]);
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

      const rawValue = getAutofillValue({
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
      "LOCAL KONFOLIO AUTOFILL:",
      locallyBuiltAutofill,
    );

    console.table(
      (fields ?? []).map((field) => {
        const fieldKey = inferFieldKey(field);

        return {
          label: field.label,
          type: field.type,
          fieldKey,
          mapped:
            locallyBuiltAutofill[field.id] ??
            "(not autofilled)",
        };
      }),
    );

    console.log("SERVER AUTOFILL:", autofillData);
    console.log("FINAL AUTOFILL SENT TO FORM:", merged);

    const selectedMerchTags = Array.isArray(
      getKonfolioContent(konfolio).merchTags,
    )
      ? getKonfolioContent(konfolio).merchTags!.filter(
          (t): t is string => typeof t === "string" && t.trim() !== "",
        )
      : [];

    onAutofill(merged, konfolio.id, selectedMerchTags);
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

            const cardMerchTags = Array.isArray(
              getKonfolioContent(konfolio).merchTags,
            )
              ? getKonfolioContent(konfolio).merchTags!.filter(
                  (t): t is string => typeof t === "string" && t.trim() !== "",
                )
              : [];

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

                    {cardMerchTags.length > 0 && (
                      <div className="flex flex-wrap gap-[4px] mt-[8px]">
                        {cardMerchTags.slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center h-[20px] px-[8px] rounded-full border border-white/15 text-[10px] text-white/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
