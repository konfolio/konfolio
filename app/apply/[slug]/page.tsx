import { notFound, redirect } from "next/navigation";

import ApplyFormClient from "@/components/forms/ApplyFormClient";

import {
  createPublicFormsAdminClient,
  resolveLegacyFormId,
} from "@/lib/publicFormLookup";

import {
  isPublicFormStatus,
  publicFormUrl,
} from "@/lib/publicFormUrls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LegacyApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const db = createPublicFormsAdminClient();

  const formId = await resolveLegacyFormId(
    db,
    slug,
  );

  if (!formId) {
    notFound();
  }

  const { data: form, error } = await db
    .from("alley_forms")
    .select("id, organizer_id, slug, status")
    .eq("id", formId)
    .maybeSingle();

  if (error) throw error;

  if (
    !form ||
    !isPublicFormStatus(form.status)
  ) {
    notFound();
  }

  const {
    data: owner,
    error: ownerError,
  } = await db
    .from("profiles")
    .select("business_slug")
    .eq("id", form.organizer_id)
    .maybeSingle();

  if (ownerError) throw ownerError;

  if (owner?.business_slug) {
    redirect(
      publicFormUrl(
        owner.business_slug,
        form.slug,
      ),
    );
  }

  // Preserve old links for organizers who have not saved a business slug.
  return (
    <ApplyFormClient
      key={form.id}
      formSlug={slug}
    />
  );
}