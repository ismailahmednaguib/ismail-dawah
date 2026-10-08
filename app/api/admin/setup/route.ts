// app/api/admin/setup/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    success: true,
    message: "Admin setup endpoint is available",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.fullName || body.full_name || "Administrator").trim();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "admin",
      },
    });

    if (error) {
      return NextResponse.json(
        { ok: false, success: false, error: error.message },
        { status: 400 }
      );
    }

    // محاولة إنشاء ملف شخصي للأدمن — لو الجدول مش موجود، ما نكسرش الرد
    await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          email,
          full_name: fullName,
          role: "admin",
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .catch(() => null);

    return NextResponse.json(
      { ok: true, success: true, userId: data.user.id, email },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: error instanceof Error ? error.message : "Admin setup failed unexpectedly",
      },
      { status: 500 }
    );
  }
}