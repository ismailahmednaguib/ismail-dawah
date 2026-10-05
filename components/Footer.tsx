import Link from "next/link";
import type { Settings } from "@/lib/data";

export default function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="bg-primary text-white/70 py-10 text-center text-sm">
      <div className="max-w-6xl mx-auto px-4">
        <p className="font-serif text-gold text-lg mb-2">{settings.motto}</p>
        <p className="mb-4">© {new Date().getFullYear()} {settings.ownerName} — جميع الحقوق محفوظة</p>
        <div className="flex justify-center gap-6 mb-4 flex-wrap">
          <Link href="/lessons" className="hover:text-gold transition">الدروس</Link>
          <Link href="/videos" className="hover:text-gold transition">المرئيات</Link>
          <Link href="/schedule" className="hover:text-gold transition">الجدول</Link>
          <Link href="/contact" className="hover:text-gold transition">تواصل</Link>
        </div>
        <Link href="/admin" className="inline-block border border-white/20 px-4 py-1 rounded-md hover:border-gold hover:text-gold transition">
          🔐 لوحة التحكم
        </Link>
      </div>
    </footer>
  );
}