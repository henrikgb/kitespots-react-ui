/**
 * Email allowlist gating kite spot admin writes. Not a full roles/authorization system - just
 * a minimal check on top of the existing NextAuth + Azure AD session, needed because the
 * Azure AD app registration accepts personal Microsoft accounts (tenantId "common"), which
 * means "is authenticated" alone is no longer enough to mean "is the site owner".
 *
 * NEXT_PUBLIC_ so the same single list can gate both the server-side API routes (authoritative)
 * and the client-side UI (so unauthorized signed-in users don't see a form that will 403 on
 * submit). Email addresses aren't sensitive, so exposing this list to the client is fine - the
 * server-side check in requireSession is what actually enforces it.
 *
 * If unset, every authenticated session is authorized - this is the original Phase 6 behavior,
 * appropriate when the Azure AD app registration itself already restricts sign-in to a single
 * trusted tenant/account.
 */
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const isAuthorizedAdminEmail = (email: string | null | undefined): boolean => {
  if (ADMIN_EMAILS.length === 0) {
    return true;
  }
  return typeof email === "string" && ADMIN_EMAILS.includes(email.trim().toLowerCase());
};
