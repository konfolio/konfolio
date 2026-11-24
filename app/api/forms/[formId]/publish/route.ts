import { NextResponse } from "next/server";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import {
  createPublicFormsAdminClient,
  findOrganizer,
} from "@/lib/publicFormLookup";

import { publicFormUrl } from "@/lib/publicFormUrls";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ formId: string }>;
  },
) {
  try {
    const { formId } = await params;

    const auth = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await auth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const db = createPublicFormsAdminClient();

    const { data: form, error: formError } = await db
      .from("alley_forms")
      .select(
        "id, organizer_id, title, slug, status, published_at",
      )
      .eq("id", formId)
      .maybeSingle();

    if (formError) throw formError;

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 },
      );
    }

    if (form.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await db
      .from("profiles")
      .select("business_slug")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const organizerSlug = profile?.business_slug;

    if (
      !organizerSlug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(organizerSlug)
    ) {
      return NextResponse.json(
        {
          error:
            "Set a valid business URL in your organizer profile before publishing.",
        },
        { status: 400 },
      );
    }

    const owner = await findOrganizer(
      db,
      organizerSlug,
    );

    if (!owner || owner.id !== user.id) {
      return NextResponse.json(
        { error: "Organizer URL is not unique" },
        { status: 409 },
      );
    }

    // Preserve the existing URL when republishing.
    const baseSlug =
      form.slug ||
      slugify(form.title || "") ||
      `form-${form.id.slice(0, 8)}`;

    let candidate = baseSlug;

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const {
        data: claim,
        error: claimError,
      } = await db
        .from("public_url_claims")
        .select("resource_kind, resource_id")
        .eq("owner_id", user.id)
        .eq("slug", candidate)
        .maybeSingle();

      if (claimError) throw claimError;

      const conflict =
        claim &&
        !(
          claim.resource_kind === "form" &&
          claim.resource_id === form.id
        );

      if (conflict) {
        if (form.slug) {
          return NextResponse.json(
            {
              error:
                "This form URL is already reserved. Refresh and try again.",
            },
            { status: 409 },
          );
        }

        candidate = `${baseSlug}-${attempt + 2}`;
        continue;
      }

      let update = db
        .from("alley_forms")
        .update({
          slug: candidate,
          status: "receiving",
          published_at:
            form.published_at ||
            new Date().toISOString(),
          is_open: true,
        })
        .eq("id", form.id)
        .eq("organizer_id", user.id);

      // Do not overwrite a simultaneous change to this form.
      update =
        form.slug === null
          ? update.is("slug", null)
          : update.eq("slug", form.slug);

      const {
        data: updatedForm,
        error: updateError,
      } = await update
        .select(
          "id, organizer_id, title, slug, status, published_at, updated_at",
        )
        .maybeSingle();

      if (
        updateError?.code === "23505" &&
        !form.slug
      ) {
        // Another request reserved this URL first.
        candidate = `${baseSlug}-${attempt + 2}`;
        continue;
      }

      if (updateError) throw updateError;

      if (!updatedForm) {
        return NextResponse.json(
          {
            error:
              "The form changed while publishing. Refresh and try again.",
          },
          { status: 409 },
        );
      }

      const publicUrl = publicFormUrl(
        organizerSlug,
        updatedForm.slug,
      );

      return NextResponse.json(
        {
          form: {
            ...updatedForm,
            organizer_slug: organizerSlug,
            public_url: publicUrl,
          },
          publicUrl,
          public_url: publicUrl,
        },
        {
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Could not reserve a form URL. Try a different title.",
      },
      { status: 409 },
    );
  } catch (error) {
    console.error(
      "POST /api/forms/[formId]/publish failed:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to publish form" },
      { status: 500 },
    );
  }
}