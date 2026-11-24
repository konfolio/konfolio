import { notFound, redirect } from "next/navigation";

import {
  createPublicFormsAdminClient,
  findOrganizer,
} from "@/lib/publicFormLookup";

import { publicFormUrl } from "@/lib/publicFormUrls";

export const dynamic = "force-dynamic";

export default async function OldOrganizerFormPage({
  params,
}: {
  params: Promise<{
    business: string;
    form: string;
  }>;
}) {
  const {
    business,
    form: slug,
  } = await params;

  const db = createPublicFormsAdminClient();

  const owner = await findOrganizer(
    db,
    business,
  );

  if (!owner) {
    notFound();
  }

  const { data: form, error } = await db
    .from("alley_forms")
    .select("slug")
    .eq("organizer_id", owner.id)
    .eq("slug", slug)
    .in("status", ["receiving", "closed"])
    .maybeSingle();

  if (error) throw error;

  if (!form) {
    notFound();
  }

  redirect(
    publicFormUrl(
      owner.business_slug,
      form.slug,
    ),
  );
}