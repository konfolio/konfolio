import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Template = "square" | "portrait";
type Status = "draft" | "published";

function isTemplate(x: any): x is Template {
  return x === "square" || x === "portrait";
}
function isStatus(x: any): x is Status {
  return x === "draft" || x === "published";
}

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

function supabaseAuthed(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 });

  const supabase = supabaseAuthed(token);

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("konfolios")
    .select("id, template, status, updated_at, content")
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? "Not found" : error.message },
      { status }
    );
  }

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    content: data.content,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 });

  const supabase = supabaseAuthed(token);

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Record<string, any> = {};

  if (body.template !== undefined) {
    if (!isTemplate(body.template)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }
    patch.template = body.template;
  }

  if (body.status !== undefined) {
    if (!isStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }

  if (body.content !== undefined) {
    patch.content = body.content; // opaque JSON
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("konfolios")
    .update(patch)
    .eq("id", id)
    .select("id, template, status, updated_at, content")
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? "Not found" : error.message },
      { status }
    );
  }

  return NextResponse.json({
    id: data.id,
    template: data.template,
    status: data.status,
    updatedAt: data.updated_at,
    content: data.content,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getBearerToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 })

  // Use service role on the server so auth verification is reliable
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token)
  const user = userRes?.user
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Only allow deleting your own *draft* konfolio.
  // Use .select("id") so we can confirm something was actually deleted.
  const { data, error } = await supabaseAdmin
    .from("konfolios")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .select("id")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    deletedCount: data?.length ?? 0,
    deletedIds: data?.map((r) => r.id) ?? [],
  })
}