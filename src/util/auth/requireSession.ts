import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { isAuthorizedAdminEmail } from "@/domain/adminAuthorization";

/**
 * Guards a location-writing API route (add/delete a location, upload an image).
 *
 * Any authenticated session used to be sufficient (the Azure AD session carries no
 * roles/groups, and Settings.tsx already treated "signed in" as "admin"). Once the Azure AD
 * app registration was widened to accept personal Microsoft accounts (tenantId "common", to
 * fix sign-in for the owner's personal account), "authenticated" alone stopped meaning "is the
 * site owner" - so this now also checks the session's email against the small
 * NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS allowlist (see adminAuthorization.ts) rather than
 * building a full roles/authorization system.
 */
export const requireSession = async (req: NextApiRequest, res: NextApiResponse): Promise<Session | null> => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }

  if (!isAuthorizedAdminEmail(session.user?.email)) {
    res.status(403).json({ error: "This account is not authorized to manage kite spots." });
    return null;
  }

  return session;
};
