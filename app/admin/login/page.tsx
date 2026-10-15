// app/admin/login/page.tsx
// تسجيل الدخول موحّد الآن داخل /ar/login.
import { redirect } from 'next/navigation';

export default function AdminLoginPage() {
  redirect('/ar/login');
}
