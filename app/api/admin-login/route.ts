import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, checkAdminCredentials, createSessionToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
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
