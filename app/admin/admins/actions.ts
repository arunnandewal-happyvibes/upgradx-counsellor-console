"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/requireAdmin";
import { str } from "@/lib/adminParsing";
import { EMAIL_RE } from "@/lib/closeSessionRules";
import { hashPassword, MIN_ADMIN_PASSWORD } from "@/lib/adminPasswords";
import { ownerEmail } from "@/lib/adminAuth";

export async function createAdminUser(formData: FormData) {
  await requireOwner();
  const name = str(formData.get("name")).trim();
  const email = str(formData.get("email")).trim().toLowerCase();
  const password = str(formData.get("password"));
  if (name.length < 2) redirect("/admin/admins?error=name");
  if (!EMAIL_RE.test(email)) redirect("/admin/admins?error=email");
  if (email === ownerEmail()) redirect("/admin/admins?error=owner");
  if (password && password.length < MIN_ADMIN_PASSWORD) redirect("/admin/admins?error=password");
  try {
    await prisma.adminUser.create({ data: { name, email, passwordHash: password ? hashPassword(password) : null } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") redirect("/admin/admins?error=duplicate");
    throw err;
  }
  revalidatePath("/admin/admins");
  redirect("/admin/admins?saved=1");
}

export async function setAdminPassword(id: string, formData: FormData) {
  await requireOwner();
  const password = str(formData.get("password"));
  if (password.length < MIN_ADMIN_PASSWORD) redirect("/admin/admins?error=password");
  await prisma.adminUser.update({ where: { id }, data: { passwordHash: hashPassword(password) } });
  revalidatePath("/admin/admins");
  redirect("/admin/admins?saved=password");
}

export async function setAdminActive(id: string, active: boolean) {
  await requireOwner();
  await prisma.adminUser.update({ where: { id }, data: { active } });
  revalidatePath("/admin/admins");
}
