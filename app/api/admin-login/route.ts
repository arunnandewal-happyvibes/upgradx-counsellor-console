import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, checkAdminCredentials, createSessionToken } from "@/lib/adminAuth";

// Best-effort per-instance throttle so the single shared admin account can't be brute-forced.
// In-memory (resets on cold start, not shared across instances) — a stronger shared limiter is a
// follow-up, but this already turns unlimited guessing into a few tries per window.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60_000;
const attempts = new Map<string, { n: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now > a.reset) {
    attempts.set(ip, { n: 1, reset: now + WINDOW_MS });
    return false;
  }
  a.n++;
  return a.n > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts — please wait a few minutes and try again." }, { status: 429 });
  }

  const body = await req.json();
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  if (!checkAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
