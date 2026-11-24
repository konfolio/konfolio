import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_PROFILE_IMAGE_SIZE = 6 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

function extensionFromMimeType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg"

    case "image/png":
      return "png"

    case "image/webp":
      return "webp"

    default:
      return null
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null

    if (!token) {
      return NextResponse.json(
        {
          error: "Missing Bearer token",
        },
        {
          status: 401,
        }
      )
    }

    const {
      data: userData,
      error: userErr,
    } = await supabaseAdmin.auth.getUser(token)

    if (userErr || !userData.user) {
      return NextResponse.json(
        {
          error: "Invalid token",
        },
        {
          status: 401,
        }
      )
    }

    const userId = userData.user.id

    const form = await req.formData()

    const file = form.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Missing file (field name must be 'file')",
        },
        {
          status: 400,
        }
      )
    }

    if (!file.type || !ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported profile image type. Please use JPG, PNG, or WebP.",
        },
        {
          status: 400,
        }
      )
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          error: "Profile image is empty.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * The frontend should normally compress profile images
     * well below this size.
     *
     * This is just a defensive server-side limit.
     */
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error:
            "Profile image is too large. Please choose a smaller image.",
        },
        {
          status: 413,
        }
      )
    }

    const ext = extensionFromMimeType(file.type)

    if (!ext) {
      return NextResponse.json(
        {
          error: "Unsupported profile image type.",
        },
        {
          status: 400,
        }
      )
    }

    const path = `${userId}/${Date.now()}.${ext}`

    const buf = await file.arrayBuffer()

    const {
      error: uploadErr,
    } = await supabaseAdmin.storage
      .from("profile-images")
      .upload(path, buf, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadErr) {
      console.error(
        "Profile image upload error:",
        uploadErr
      )

      return NextResponse.json(
        {
          error: uploadErr.message,
        },
        {
          status: 500,
        }
      )
    }

    const {
      data: publicUrlData,
    } = supabaseAdmin.storage
      .from("profile-images")
      .getPublicUrl(path)

    if (!publicUrlData.publicUrl) {
      return NextResponse.json(
        {
          error:
            "Profile image uploaded but public URL could not be created.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      profileImageUrl: publicUrlData.publicUrl,
    })
  } catch (e: unknown) {
    console.error("Profile image route error:", e)

    const message =
      e instanceof Error
        ? e.message
        : "Unknown error"

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    )
  }
}