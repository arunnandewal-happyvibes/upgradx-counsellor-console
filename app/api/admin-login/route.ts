import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, checkAdminCredentials, createSessionToken } from "@/lib/adminAuth";
import { verifyPassword } from "@/lib/adminPasswords";
import { prisma } from "@/lib/prisma";

async function checkAdminUser(email: string, password: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user?.active || !verifyPassword(password, user.passwordHash)) return false;
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  if (!checkAdminCredentials(email, password) && !(await checkAdminUser(email, password))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken(email);
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
