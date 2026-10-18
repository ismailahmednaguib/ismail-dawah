import 'server-only';

/** البريد الموثوق لحساب مالك المنصة. يبقى على الخادم ولا يظهر للمتصفح. */
const DEFAULT_OWNER_EMAIL = 'ismailahmednaguib@gmail.com';

export function getOwnerEmail(): string {
  return process.env.OWNER_EMAIL?.trim().toLowerCase() || DEFAULT_OWNER_EMAIL;
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  const ownerEmail = getOwnerEmail();
  return Boolean(ownerEmail && email?.trim().toLowerCase() === ownerEmail);
}
