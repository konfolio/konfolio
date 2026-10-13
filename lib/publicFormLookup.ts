import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createPublicFormsAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server configuration");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

type AdminClient = ReturnType<
  typeof createPublicFormsAdminClient
>;

export async function findOrganizer(
  db: AdminClient,
  businessSlug: string,
) {
  const { data, error } = await db
    .from("profiles")
    .select("id, business_name, business_slug")
    .eq("business_slug", businessSlug)
    .maybeSingle();

  if (error) throw error;

  return data;
}

// Preserve the original destination of old /apply/<slug> links.
export async function resolveLegacyFormId(
  db: AdminClient,
  slug: string,
) {
  const { data: alias, error: aliasError } = await db
    .from("form_legacy_urls")
    .select("form_id")
    .eq("slug", slug)
    .maybeSingle();

  if (aliasError) throw aliasError;

  if (alias) {
    return alias.form_id as string;
  }

  // For newer legacy links, only resolve an unambiguous match.
  const { data, error } = await db
    .from("alley_forms")
    .select("id")
    .eq("slug", slug)
    .in("status", ["receiving", "closed"])
    .limit(2);

  if (error) throw error;

  return data?.length === 1
    ? (data[0].id as string)
    : null;
}