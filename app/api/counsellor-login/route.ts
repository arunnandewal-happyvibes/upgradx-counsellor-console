import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Only listed counsellors may check in — but this stays OFF until every current counsellor
  // has been added in admin → Counsellors, otherwise they'd be locked out (LSQ doc §2).
  if (process.env.COUNSELLOR_ALLOWLIST_ENABLED === "true") {
    const listed = await prisma.counsellor.findFirst({ where: { email, active: true }, select: { id: true } });
    if (!listed) {
      return NextResponse.json({ error: "You're not on the counsellor list yet. Ask your admin to add you." }, { status: 403 });
    }
  }

  await prisma.counsellorLogin.create({ data: { email } });
  return NextResponse.json({ ok: true, email }, { status: 201 });
}
