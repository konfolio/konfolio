// app/auth/callback/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Role = "vendor" | "artist" | "host" | "admin" | string;

function roleHome(role: Role | null | undefined) {
  if (role === "vendor") return "/my-forms";
  return "/my-portfolios";
}

function isSafeInternalPath(v: string) {
  return v.startsWith("/") && !v.startsWith("//");
}

function safeReturnTo(raw: string | null, role: Role | null | undefined) {
  const fallback = roleHome(role);
  const v = (raw || "").trim();

  if (!v) return fallback;
  if (!isSafeInternalPath(v)) return fallback;
  if (v === "/onboarding" || v.startsWith("/onboarding/")) return fallback;

  if (
    role === "vendor" &&
    (v === "/my-portfolios" || v.startsWith("/my-portfolios/"))
  ) {
    return "/my-forms";
  }

  if (role !== "vendor" && (v === "/my-forms" || v.startsWith("/my-forms/"))) {
    return "/my-portfolios";
  }

  return v;
}

function AuthCallbackInner() {
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(
        window.location.href,
      );

      if (exchangeErr) {
        console.warn(
          "[callback] exchange failed, trying session fallback:",
          exchangeErr,
        );
      }

      const { data: sessionData, error: sessionErr } =
        await supabase.auth.getSession();
      const session = sessionData.session;
      const user = session?.user;

      if (sessionErr) console.error("[callback] sessionErr:", sessionErr);

      if (!session || !user) {
        const details = exchangeErr
          ? encodeURIComponent(
              `${exchangeErr.code ?? "unknown"}:${exchangeErr.message}`,
            )
          : "";
        window.location.href = details
          ? `/login?error=oauth&details=${details}`
          : "/login";
        return;
      }

      if (session.refresh_token) {
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          });
        } catch (e) {
          console.error("[callback] sync error:", e);
        }
      } else {
        console.warn(
          "[callback] no refresh_token available; skipping cookie sync",
        );
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, onboarding_complete, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileErr) console.error("[callback] profileErr:", profileErr);

      const complete = Boolean(profile?.onboarding_complete);

      if (!complete) {
        window.location.href = "/onboarding/audience";
        return;
      }

      const role = (profile?.role ?? null) as Role | null;
      const next = safeReturnTo(params.get("returnTo"), role);
      window.location.href = next;
    })();
  }, [params]);

  return <p className="p-6">Signing you in…</p>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-6">Signing you in…</p>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
