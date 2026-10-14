// المسار الصحيح لتسجيل الحسابات من واجهة /[lang]/login.
// نعيد استخدام المعالج القديم مؤقتًا للحفاظ على التوافق مع أي روابط سابقة.
export { POST } from "@/app/register/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
