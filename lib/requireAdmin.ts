import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, ownerEmail, readSessionToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

/** For server actions: middleware only guards /admin page URLs, but a server action can be
 * invoked by its id from any route, so sensitive actions must verify the session themselves.
 * Also re-checks that a non-owner admin is still active, so deactivation applies at once. */
export async function requireAdmin(): Promise<{ email: string; isOwner: boolean }> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) throw new Error("Not authorised");
  const owner = ownerEmail();
  if (owner && session.email === owner) return { email: session.email, isOwner: true };
  const user = await prisma.adminUser.findUnique({ where: { email: session.email } });
  if (!user?.active) throw new Error("Not authorised");
  return { email: session.email, isOwner: false };
}

/** Managing the admin list is limited to the owner account. */
export async function requireOwner() {
  const admin = await requireAdmin();
  if (!admin.isOwner) throw new Error("Only the owner account can manage admins");
  return admin;
}
