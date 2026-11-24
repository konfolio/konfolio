import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAutofillProfile() {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Your Name");
  const [businessName, setBusinessName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select(
            "first_name, last_name, display_name, business_name, avatar_url, profile_image_url",
          )
          .eq("id", user.id)
          .single();

        if (error || !profile || cancelled) return;

        const name =
          profile.display_name ||
          [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
          "Your Name";

        setDisplayName(name);
        setBusinessName(profile.business_name ?? "");
        setAvatarUrl(profile.avatar_url ?? profile.profile_image_url ?? null);
      } catch (error) {
        console.error("Failed to load autofill profile:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, displayName, businessName, avatarUrl };
}
