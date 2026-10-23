import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      { session: null, error: "غير مصرح." },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
          Vary: "Cookie",
        },
      },
    );
  }

  return NextResponse.json(
    {
      session: {
        userId: session.userId,
        email: session.email,
        fullName: session.fullName,
        roles: session.roles,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Vary: "Cookie",
      },
    },
  );
}

