import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey);
}

type SubmissionResult = {
  ok: boolean;
  code:
    | "submitted"
    | "already_submitted"
    | "form_not_found"
    | "form_closed"
    | "form_full"
    | "konfolio_required";
  applicationId?: string;
};

export async function POST(req: Request) {
  try {
    // --------------------------------------------------------
    // Parse request
    // --------------------------------------------------------

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const {
      formId,
      responses,
      konfolioId: providedKonfolioId,
    } = body;

    if (!formId) {
      return NextResponse.json(
        { error: "Missing formId" },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // Authenticate applicant
    // --------------------------------------------------------

    const authSupabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to apply." },
        { status: 401 }
      );
    }

    // --------------------------------------------------------
    // Use server-only service-role client
    // --------------------------------------------------------

    const supabase = createAdminClient();

    // --------------------------------------------------------
    // IMPORTANT:
    //
    // Capacity check, duplicate protection, form locking,
    // Konfolio lookup, and INSERT now happen inside one
    // database transaction.
    // --------------------------------------------------------

    const { data, error } = await supabase.rpc(
      "submit_alley_application",
      {
        p_form_id: formId,
        p_applicant_id: user.id,
        p_provided_konfolio_id: providedKonfolioId ?? null,
        p_answers:
          responses && typeof responses === "object"
            ? responses
            : {},
      }
    );

    if (error) {
      console.error("Application submission RPC failed:", error);

      return NextResponse.json(
        { error: "Unable to submit application. Please try again." },
        { status: 500 }
      );
    }

    const result = data as SubmissionResult;

    // --------------------------------------------------------
    // Translate database results into API responses
    // --------------------------------------------------------

    switch (result.code) {
      case "submitted":
        return NextResponse.json({
          success: true,
          applicationId: result.applicationId,
        });

      case "already_submitted":
        return NextResponse.json(
          { error: "already_submitted" },
          { status: 409 }
        );

      case "form_not_found":
        return NextResponse.json(
          { error: "Form not found" },
          { status: 404 }
        );

      case "form_closed":
        return NextResponse.json(
          {
            error: "This form is no longer accepting applications.",
          },
          { status: 403 }
        );

      case "form_full":
        return NextResponse.json(
          {
            error: "This form has reached its application limit.",
          },
          { status: 403 }
        );

      case "konfolio_required":
        return NextResponse.json(
          {
            error: "You need a published konfolio to apply.",
          },
          { status: 403 }
        );

      default:
        console.error(
          "Unexpected submit_alley_application response:",
          result
        );

        return NextResponse.json(
          { error: "Unable to submit application." },
          { status: 500 }
        );
    }
  } catch (err: unknown) {
    console.error("Application submission failed:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Server error",
      },
      { status: 500 }
    );
  }
}