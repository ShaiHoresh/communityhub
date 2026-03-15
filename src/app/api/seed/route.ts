import { runSeed } from "@/lib/seed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "Seed disabled in production." }, { status: 403 });
  }
  const result = await runSeed();
  return NextResponse.json(result);
}
