import { NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "إيميل غير صحيح" }, { status: 400 });
    }

    const result = await subscribeEmail(email, name);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ" }, { status: 500 });
  }
}