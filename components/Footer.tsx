import Link from "next/link";
import type { Settings } from "@/lib/data";

export default function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="bg-primary text-white/70 py-8 text-center text-sm">
      <div className="max-w-6xl mx-auto px-4">
        <p className="font-serif text-gold text-lg mb-2">{settings.motto}</p>
        <p className="mb-3">© {new Date().getFullYear()} {settings.ownerName} — جميع الحقوق محفوظة</p>
        <div className="flex justify-center gap-5 flex-wrap">
          <Link href="/" className="hover:text-gold transition">الرئيسية</Link>
          <Link href="/about" className="hover:text-gold transition">عن الشيخ</Link>
          <Link href="/contact" className="hover:text-gold transition">تواصل</Link>
          <Link href="/admin" className="hover:text-gold transition">لوحة التحكم</Link>
        </div>
      </div>
    </footer>
  );
}