"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { inknut } from "@/app/fonts";
import { supabase } from "@/lib/supabase/browser";
import Image from "next/image";

type Profile = {
  role?: string | null; // "artist" | "vendor"
  first_name: string | null;
  preferred_name: string | null;
  business_name?: string | null;
  organization?: string | null;
  profile_image_url: string | null;
};

function normalizePath(pathnameRaw: string) {
  return pathnameRaw.endsWith("/") && pathnameRaw !== "/"
    ? pathnameRaw.slice(0, -1)
    : pathnameRaw;
}

function NavItem({
  href,
  label,
  active,
  widthClass,
}: {
  href: string;
  label: string;
  active: boolean;
  widthClass: string;
}) {
  return (
    <Link
      href={href}
      className={`hidden lg:flex flex-col items-start pt-[6px] gap-[6px] ${widthClass} h-[24px]`}
    >
      <span
        className={`
          ${widthClass}
          h-[12px]
          flex items-center justify-center
          text-[17px]
          leading-[21px]
          text-[#262626]
          whitespace-nowrap
          ${active ? "font-semibold" : "font-normal hover:font-semibold"}
        `}
      >
        {label}
      </span>

      <span
        className={`
          ${widthClass}
          h-0
          border border-[#262626]
          self-stretch
          ${active ? "opacity-100" : "opacity-0"}
        `}
      />
    </Link>
  );
}

function normRole(roleRaw: string | null | undefined) {
  return String(roleRaw ?? "")
    .trim()
    .toLowerCase();
}

function isVendorRole(roleRaw: string | null | undefined) {
  return normRole(roleRaw) === "vendor";
}

const supportEmail =
  "mailto:konfolios@gmail.com?subject=Konfolio%20Support%20Request&body=Hi%20Konfolio%2C%0A%0AI%20need%20help%20with%3A%0A"

export default function Navbar() {
  const pathnameRaw = usePathname() || "";
  const pathname = normalizePath(pathnameRaw);

  // 3-state auth:
  // null = unknown/loading, false = signed out, true = signed in
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const [displayName, setDisplayName] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const [isVendor, setIsVendor] = useState(false);
  const [roleReady, setRoleReady] = useState(false);

  const isExploreActive =
    pathname === "/explore" || pathname.startsWith("/explore/");

  const isMyPortfoliosActive =
    pathname === "/my-portfolios" || pathname.startsWith("/my-portfolios/");
  const isMyFormsActive =
    pathname === "/my-forms" || pathname.startsWith("/my-forms/");

  const hideAccountOnDashboardRoot =
    pathname === "/my-portfolios" || pathname === "/my-forms";

  useEffect(() => {
    let mounted = true;

    async function load() {
      // start in “unknown” for each load to avoid showing wrong UI
      setSignedIn(null);
      setRoleReady(false);

      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;

      if (!mounted) return;

      if (!user) {
        setSignedIn(false);
        setDisplayName("");
        setProfileImageUrl(null);
        setIsVendor(false);
        setRoleReady(true);
        return;
      }

      setSignedIn(true);

      const profileRes = await supabase
        .from("profiles")
        .select(
          "role, first_name, preferred_name, business_name, organization, profile_image_url",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileRes.error) {
        setDisplayName("");
        setProfileImageUrl(null);
        setIsVendor(false);
        setRoleReady(true);
        return;
      }

      const p = profileRes.data as Profile | null;
      const vendor = isVendorRole(p?.role);
      setIsVendor(vendor);

      const preferred = (p?.preferred_name || "").trim();
      const first = (p?.first_name || "").trim();
      const business = String(p?.business_name ?? "").trim();
      const org = String(p?.organization ?? "").trim();

      const vendorName = org || business || first || "Account";
      const artistName = preferred || first || "Account";

      setDisplayName(vendor ? vendorName : artistName);
      setProfileImageUrl(p?.profile_image_url ?? null);

      setRoleReady(true);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const initials = useMemo(() => {
    const c = displayName?.[0]?.toUpperCase();
    return c && c.length ? c : "U";
  }, [displayName]);

  const myPrimaryHref = isVendor ? "/my-forms" : "/my-portfolios";
  const myPrimaryLabel = isVendor ? "My Forms" : "My Portfolios";
  const myPrimaryWidthClass = isVendor ? "w-[85px]" : "w-[110px]";
  const isPrimaryActive = isVendor ? isMyFormsActive : isMyPortfoliosActive;

  const showSignedInUI = signedIn === true;
  const showSignedOutUI = signedIn === false;

  return (
    <nav className="w-full h-[61px] bg-white">
      <div className="h-full px-[25px] sm:px-10 lg:px-[150px] pt-[15px] pb-[10px] flex items-center">
        <div className="w-full max-w-[1212px] h-[36px] mx-auto flex items-center justify-between">
          {/* LEFT GROUP */}
          <div className="flex items-center gap-[18px] lg:gap-[50px]">
            <Link href="/" className="flex items-center">
              <span
                className={`${inknut.className} text-[18.12px] leading-[100%] tracking-[-0.02em] font-semibold text-[#262626]`}
              >
                konfolio
              </span>
            </Link>

            {showSignedInUI ? (
              <>
                {/* No wrong label flash while role loads */}
                {roleReady ? (
                  <NavItem
                    href={myPrimaryHref}
                    label={myPrimaryLabel}
                    active={isPrimaryActive}
                    widthClass={myPrimaryWidthClass}
                  />
                ) : (
                  <div className="hidden lg:flex w-[110px] h-[24px]" />
                )}

                <NavItem
                  href="/explore"
                  label="Explore"
                  active={isExploreActive}
                  widthClass="w-[60px]"
                />
                <a
                  href={supportEmail}
                  className="hidden lg:flex flex-col items-start pt-[6px] gap-[6px] w-[65px] h-[24px]"
                >
                  <span
                    className="
                      w-[65px]
                      h-[12px]
                      flex items-center justify-center
                      text-[17px]
                      leading-[21px]
                      text-[#262626]
                      whitespace-nowrap
                      font-normal hover:font-semibold
                    "
                  >
                    Support
                  </span>

                  <span className="w-[65px] h-0 border border-[#262626] self-stretch opacity-0" />
                </a>
              </>
            ) : showSignedOutUI ? (
              <NavItem
                href="/explore"
                label="Explore"
                active={isExploreActive}
                widthClass="w-[62px]"
              />
            ) : (
              // authUnknown: render placeholders so nothing flashes to signed-out version
              <div className="hidden lg:flex items-center gap-[50px]">
                <div className="w-[110px] h-[24px]" />
                <div className="w-[60px] h-[24px]" />
                <div className="w-[65px] h-[24px]" />
              </div>
            )}
          </div>

          {/* RIGHT GROUP */}
          <div className="flex items-center">
            {showSignedInUI ? (
              hideAccountOnDashboardRoot ? null : (
                <Link
                  href="/my-forms"
                  className="
                    hidden lg:flex
                    items-center justify-end
                    gap-[10px]
                    h-[35px]
                  "
                >
                  <span
                    className="
                      w-[35px] h-[35px]
                      rounded-full
                      overflow-hidden
                      bg-[#EDEDED]
                      flex items-center justify-center
                      flex-shrink-0
                    "
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {profileImageUrl ? (
                      <Image
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        width={35}
                        height={35}
                      />
                    ) : (
                      <span className="text-[12px] font-inter text-[#262626]">
                        {initials}
                      </span>
                    )}
                  </span>

                  <span
                    className="
                      font-inter font-normal
                      text-[17px] leading-[140%]
                      text-[#262626]
                      text-right
                      whitespace-nowrap
                    "
                  >
                    {displayName || "Account"}
                  </span>
                </Link>
              )
            ) : showSignedOutUI ? (
              <Link
                href="/login"
                className="
                  hidden lg:flex
                  h-[24px]
                  items-center justify-center
                  text-[17px] leading-[140%]
                  font-normal text-center
                  text-[#262626]
                  whitespace-nowrap
                  transition-all duration-100 ease-out
                  hover:font-semibold
                "
              >
                Sign In
              </Link>
            ) : (
              // authUnknown placeholder
              <div className="hidden lg:flex w-[70px] h-[24px]" />
            )}

            {/* Mobile: keep simple */}
            <Link
              href="/explore"
              className="
                flex lg:hidden
                h-[24px]
                items-center justify-center
                text-[17px] leading-[140%]
                font-normal text-center
                text-[#262626]
                whitespace-nowrap
                transition-all duration-100 ease-out
                hover:font-semibold
              "
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
