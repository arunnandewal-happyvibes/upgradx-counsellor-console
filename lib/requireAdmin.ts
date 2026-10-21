import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";

/** For server actions: middleware only guards /admin page URLs, but a server action can be
 * invoked by its id from any route, so sensitive actions must verify the session themselves. */
export async function requireAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    throw new Error("Not authorised");
  }
}
