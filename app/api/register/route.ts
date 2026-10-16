// المسار الصحيح لتسجيل الحسابات من واجهة /[lang]/login.
// نعيد استخدام المعالج القديم مؤقتًا للحفاظ على التوافق مع أي روابط سابقة.
import type { NextRequest } from "next/server";
import { POST as registerHandler } from "@/app/register/route";
import { rateLimitGuard } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await rateLimitGuard(req, 'register');
  if (limited) return limited;

  return registerHandler(req);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
