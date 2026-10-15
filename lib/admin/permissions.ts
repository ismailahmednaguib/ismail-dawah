// =====================================================
// مصفوفة الصلاحيات — من يستطيع فعل ماذا
// =====================================================
import type { AppRole } from '@/lib/types/content';

export type PermissionAction =
  | 'content.read'
  | 'content.create'
  | 'content.update'
  | 'content.publish'
  | 'content.delete'
  | 'review.approve'
  | 'taxonomy.manage'
  | 'media.manage'
  | 'questions.manage'
  | 'notifications.manage'
  | 'users.manage'
  | 'settings.manage'
  | 'audit.read';

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  scholar_reviewer: 50,
  translator: 40,
  contributor: 20,
};

const ACTION_ROLES: Record<PermissionAction, AppRole[]> = {
  'content.read': ['super_admin', 'admin', 'editor', 'scholar_reviewer', 'translator'],
  'content.create': ['super_admin', 'admin', 'editor', 'translator', 'contributor'],
  'content.update': ['super_admin', 'admin', 'editor'],
  'content.publish': ['super_admin', 'admin', 'editor'],
  'content.delete': ['super_admin', 'admin'],
  'review.approve': ['super_admin', 'admin', 'scholar_reviewer'],
  'taxonomy.manage': ['super_admin', 'admin', 'editor'],
  'media.manage': ['super_admin', 'admin', 'editor'],
  'questions.manage': ['super_admin', 'admin', 'scholar_reviewer'],
  'notifications.manage': ['super_admin', 'admin'],
  'users.manage': ['super_admin', 'admin'],
  'settings.manage': ['super_admin'],
  'audit.read': ['super_admin', 'admin'],
};

/** هل هذه المجموعة من الأدوار تسمح بالإجراء؟ */
export function can(userRoles: AppRole[], action: PermissionAction): boolean {
  const allowed = ACTION_ROLES[action];
  return userRoles.some((r) => allowed.includes(r));
}

/** أعلى دور لدى المستخدم (لعرضه في الواجهة) */
export function highestRole(roles: AppRole[]): AppRole {
  return [...roles].sort((a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a])[0];
}
