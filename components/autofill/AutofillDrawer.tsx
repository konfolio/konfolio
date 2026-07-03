"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";


type Konfolio = {
  id: string;
  portfolio_name: string | null;
  thumbnail_url: string | null;
  updated_at: string;
  portfolio_slug: string | null;
};

export default function AutofillDrawer({
  autofillData,
  fields,
  onClose,
  onAutofill,
}: {
  autofillData: Record<string, any>;
  fields: any[];
  onClose: () => void;
  onAutofill: (data: Record<string, any>, konfolioId: string) => void;
}) {
  const [konfolios, setKonfolios] = useState<Konfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Your Name");
  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [konfolioRes, profileRes] = await Promise.all([
        supabase
          .from("konfolios")
          .select("id, portfolio_name, thumbnail_url, updated_at, portfolio_slug")
          .eq("user_id", user.id)
          .eq("status", "published")
          .order("updated_at", { ascending: false }),
        supabase
          .from("profiles")
          .select(
            "first_name, last_name, display_name, business_name, business_slug, avatar_url, profile_image_url"
          )
          .eq("id", user.id)
          .single(),
      ]);

      if (konfolioRes.data) {
        setKonfolios(konfolioRes.data);
      }

      if (profileRes.data) {
        const p = profileRes.data;
        const name =
          p.display_name ||
          [p.first_name, p.last_name].filter(Boolean).join(" ") ||
          "Your Name";

        setDisplayName(name);
        setBusinessName(p.business_name ?? "");
        setBusinessSlug(p.business_slug ?? null);
        setAvatarUrl(p.avatar_url ?? p.profile_image_url ?? null);
      }

      setLoading(false);
    };

    load();
  }, []);

  const getPublicKonfolioPath = (konfolio: Konfolio) => {
    if (!businessSlug || !konfolio.portfolio_slug) return "";
    return `/${businessSlug}/${konfolio.portfolio_slug}`;
  };

  const getPublicKonfolioUrl = (konfolio: Konfolio) => {
    const path = getPublicKonfolioPath(konfolio);
    if (!path) return "";

    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://konfolio.com";

    return `${origin}${path}`;
  };

  const handleSelect = (konfolio: Konfolio) => {
    // Start from the server-computed autofill, then override the konfolio_link
    // field with the selected pretty Konfolio URL.
    const merged: Record<string, any> = { ...autofillData };

    const konfolioLinkField = fields.find(
      (f: any) => f.field_key === "konfolio_link" || f.fieldKey === "konfolio_link"
    );

    const publicKonfolioUrl = getPublicKonfolioUrl(konfolio);

    if (konfolioLinkField && publicKonfolioUrl) {
      merged[konfolioLinkField.id] = publicKonfolioUrl;
    }

    onAutofill(merged, konfolio.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-[380px] bg-[#1C1C1C] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-white/10">
          <span className="text-[13px] text-white/50 font-medium tracking-wide uppercase">
            Select Autofill
          </span>
          <button className="text-white/30 hover:text-white text-[11px] font-mono">
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
              <p className="text-[12px] text-white/40">{displayName}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-white/30 hover:text-white">
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

          {konfolios.map((k) => {
            const publicKonfolioPath = getPublicKonfolioPath(k);

            return (
              <div
                key={k.id}
                onClick={() => handleSelect(k)}
                className="rounded-[12px] bg-white/5 border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-full h-[160px] bg-white/5">
                  {k.thumbnail_url ? (
                    <Image
                      src={k.thumbnail_url}
                      alt={k.portfolio_name ?? "Portfolio"}
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
                      {k.portfolio_name ?? "Portfolio Name"}
                    </p>

                    <div className="flex items-center gap-[6px] mt-[4px]">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3v4l2.5 2.5"
                          stroke="white"
                          strokeOpacity="0.4"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>

                      <span className="text-[11px] text-white/40">
                        {new Date(k.updated_at).toLocaleDateString("en-US", {
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
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-[6px] bg-[#262626] text-white text-[12px] px-[12px] py-[6px] rounded-full hover:bg-white/20 transition-colors"
                    >
                      View
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
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