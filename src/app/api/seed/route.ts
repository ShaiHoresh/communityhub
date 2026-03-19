import { runSeed } from "@/lib/seed";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "Seed disabled in production." }, { status: 403 });
  }

  const secret = process.env.SEED_SECRET;
  if (secret) {
    const provided = request.nextUrl.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ ok: false, message: "Invalid or missing ?secret= param." }, { status: 403 });
    }
  }

  try {
    const result = await runSeed();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown seed error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
