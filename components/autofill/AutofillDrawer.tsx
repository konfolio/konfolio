"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import AutofillPortfolioModal from "@/components/autofill/AutofillPortfolioModal";

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
  const [portfoliosLoaded, setPortfoliosLoaded] = useState(false);

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
    const load = async () => {
      try {
        setLoading(true);
        setPortfoliosLoaded(false);

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

        if (!konfolioRes.error && konfolioRes.data) {
          setKonfolios(konfolioRes.data as Konfolio[]);
          setPortfoliosLoaded(true);
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
            profile.preferred_name ||
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
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  const portfolioLimitReached =
    userEmail?.trim().toLowerCase() !== "konfolios@gmail.com" && konfolios.length >= 3;
  const createDisabled = loading || !portfoliosLoaded || portfolioLimitReached;

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
    <AutofillPortfolioModal
      portfolios={konfolios.map((portfolio) => ({
        id: portfolio.id,
        name: portfolio.portfolio_name || "Portfolio Name",
        thumbnailUrl: portfolio.thumbnail_url,
        updatedAt: portfolio.updated_at,
        href: getPublicKonfolioPath(portfolio),
      }))}
      loading={loading}
      businessName={businessName}
      displayName={displayName}
      avatarUrl={avatarUrl}
      createDisabled={createDisabled}
      limitReached={portfolioLimitReached}
      onCreate={() => {
        if (!createDisabled) window.open("/my-portfolios/new", "_blank", "noopener,noreferrer");
      }}
      onSelect={(id) => {
        const portfolio = konfolios.find((item) => item.id === id);
        if (portfolio) handleSelect(portfolio);
      }}
      onClose={onClose}
    />
  );
}
