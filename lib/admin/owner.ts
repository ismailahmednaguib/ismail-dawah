import 'server-only';

/** البريد الموثوق لحساب مالك المنصة. يتم ضبطه في متغير بيئة ولا يظهر للمتصفح. */
export function getOwnerEmail(): string {
  return process.env.OWNER_EMAIL?.trim().toLowerCase() || '';
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  const ownerEmail = getOwnerEmail();
  return Boolean(ownerEmail && email?.trim().toLowerCase() === ownerEmail);
}
