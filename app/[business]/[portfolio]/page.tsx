import { notFound, redirect } from "next/navigation";

import PublicKonfolioView from "@/components/public/PublicKonfolioView";
import ApplyFormClient from "@/components/forms/ApplyFormClient";

import {
  createPublicFormsAdminClient,
  findOrganizer,
} from "@/lib/publicFormLookup";

import { publicFormUrl } from "@/lib/publicFormUrls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function PublicKonfolioPage({
  params,
}: {
  params: Promise<{
    business: string;
    portfolio: string;
  }>;
}) {
  const { business, portfolio } = await params;

  const businessSlug = slugify(business);
  const itemSlug = slugify(portfolio);

  if (!businessSlug || !itemSlug) {
    notFound();
  }

  const db = createPublicFormsAdminClient();

  const owner = await findOrganizer(
    db,
    businessSlug,
  );

  if (!owner) {
    notFound();
  }

  const [
    { data: form, error: formError },
    { data: k, error: portfolioError },
  ] = await Promise.all([
    db
      .from("alley_forms")
      .select("id, slug")
      .eq("organizer_id", owner.id)
      .eq("slug", itemSlug)
      .in("status", ["receiving", "closed"])
      .maybeSingle(),

    db
      .from("konfolios")
      .select("id, template, content")
      .eq("user_id", owner.id)
      .eq("portfolio_slug", itemSlug)
      .eq("status", "published")
      .maybeSingle(),
  ]);

  if (formError) throw formError;
  if (portfolioError) throw portfolioError;

  if (form && k) {
    throw new Error(
      "Conflicting public URL: apply the form URL migration",
    );
  }

  if (form) {
    if (
      business !== businessSlug ||
      portfolio !== itemSlug
    ) {
      redirect(
        publicFormUrl(businessSlug, itemSlug),
      );
    }

    return (
      <ApplyFormClient
        key={form.id}
        organizerSlug={businessSlug}
        formSlug={itemSlug}
      />
    );
  }

  if (!k) {
    notFound();
  }

  if (businessSlug === itemSlug) {
    redirect(`/${businessSlug}`);
  }

  // Published Link Access Only portfolios remain accessible.
  return (
    <PublicKonfolioView
      konfolioId={k.id}
      template={
        k.template === "portrait"
          ? "portrait"
          : "square"
      }
      content={k.content ?? {}}
      ownerBusinessName={String(
        owner.business_name ?? "",
      )}
    />
  );
}