// components/admin/UsersClient.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AdminSession } from '@/lib/admin/session';

interface UserRow {
  user_id: string;
  roles: string[];
  full_name: string | null;
  email?: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'مدير عام', color: 'bg-red-100 text-red-700' },
  { value: 'admin', label: 'مدير', color: 'bg-purple-100 text-purple-700' },
  { value: 'editor', label: 'محرر', color: 'bg-blue-100 text-blue-700' },
  { value: 'scholar_reviewer', label: 'مراجع علمي', color: 'bg-amber-100 text-amber-700' },
  { value: 'translator', label: 'مترجم', color: 'bg-teal-100 text-teal-700' },
  { value: 'contributor', label: 'مساهم', color: 'bg-stone-100 text-stone-700' },
];

export default function UsersClient({ session }: { session: AdminSession }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const json = await res.json();
      setUsers(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRole = async (userId: string, role: string) => {
    setSaving(userId);
    try {
      const user = users.find(u => u.user_id === userId);
      if (!user) return;
      const newRoles = user.roles.includes(role)
        ? user.roles.filter(r => r !== role)
        : [...user.roles, role];

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, roles: newRoles }),
      });
      if (!res.ok) throw new Error();
      load();
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    setSaving(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: isActive }),
      });
      if (!res.ok) throw new Error();
      load();
    } finally {
      setSaving(null);
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 overflow-hidden"
      data-current-user-id={session.userId}
    >
      {loading ? (
        <div className="p-12 text-center text-stone-400">جارٍ التحميل...</div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-stone-400">لا يوجد مستخدمون</div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-gray-700">
          {users.map((user) => (
            <div key={user.user_id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-emerald-950 dark:text-white">
                    {user.full_name ?? user.email ?? user.user_id.slice(0, 8)}
                  </h3>
                  {user.email && <p className="text-sm text-stone-500 dark:text-gray-400">{user.email}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {user.roles.map(role => {
                      const cfg = ROLE_OPTIONS.find(r => r.value === role);
                      return (
                        <span key={role} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg?.color ?? 'bg-stone-100 text-stone-700'}`}>
                          {cfg?.label ?? role}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-stone-600 dark:text-gray-300">
                    {user.is_active ? '✅ نشط' : '🚫 موقوف'}
                  </span>
                  <input
                    type="checkbox"
                    checked={user.is_active}
                    onChange={(e) => toggleActive(user.user_id, e.target.checked)}
                    disabled={saving === user.user_id}
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>
              </div>

              {/* إدارة الأدوار */}
              <div className="mt-4 pt-4 border-t border-stone-100 dark:border-gray-700">
                <p className="text-xs font-medium text-stone-500 dark:text-gray-400 mb-2">الأدوار:</p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role.value}
                      onClick={() => toggleRole(user.user_id, role.value)}
                      disabled={saving === user.user_id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        user.roles.includes(role.value)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-stone-300 dark:border-gray-600 text-stone-600 dark:text-gray-300 hover:border-emerald-500'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
