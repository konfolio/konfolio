// app/api/konfolios/create-from-template/route.ts
import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Not implemented yet. Backend: create konfolio draft from template + autofill in Supabase.",
    },
    { status: 501 }
  )
}
