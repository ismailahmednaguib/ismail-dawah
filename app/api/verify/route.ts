import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ok = searchParams.get("key") === process.env.ADMIN_KEY;
  return NextResponse.json({ ok });
}