// Edge-compatible (Web Crypto / btoa / atob) so this can run inside
// middleware.ts, which executes on the Edge runtime — Node's `crypto`
// module isn't available there.

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(sig));
}

export async function createSessionToken(email: string): Promise<string> {
  const payload = toBase64Url(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS, email: email.trim().toLowerCase() })),
  );
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

/** The signed-in admin's email, or null when the token is missing, forged or expired.
 * Tokens issued before admins had emails carry none — only the owner could sign in then. */
export async function readSessionToken(token: string): Promise<{ email: string } | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expectedSig = await sign(payload);
  if (expectedSig !== sig) return null;
  try {
    const { exp, email } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof exp !== "number" || exp <= Date.now()) return null;
    return { email: typeof email === "string" ? email : ownerEmail() ?? "" };
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string): Promise<boolean> {
  return (await readSessionToken(token)) !== null;
}

export function ownerEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

/** The owner account from ADMIN_EMAIL / ADMIN_PASSWORD. */
export function checkAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && password === adminPassword;
}
