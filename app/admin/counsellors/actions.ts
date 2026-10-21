"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { str } from "@/lib/adminParsing";
import { CENTRE_BY_VALUE } from "@/lib/centres";
import { EMAIL_RE } from "@/lib/closeSessionRules";

function parse(formData: FormData) {
  const name = str(formData.get("name")).trim();
  const email = str(formData.get("email")).trim().toLowerCase();
  const centre = str(formData.get("centre"));
  const active = formData.get("active") === "on";
  if (name.length < 2) return { error: "name" as const };
  if (!EMAIL_RE.test(email)) return { error: "email" as const };
  if (!CENTRE_BY_VALUE.has(centre)) return { error: "centre" as const };
  return { data: { name, email, centre, active } };
}

export async function createCounsellor(formData: FormData) {
  await requireAdmin();
  const p = parse(formData);
  if ("error" in p) redirect(`/admin/counsellors?error=${p.error}`);
  try {
    await prisma.counsellor.create({ data: p.data! });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") redirect("/admin/counsellors?error=duplicate");
    throw err;
  }
  revalidatePath("/admin/counsellors");
  redirect("/admin/counsellors?saved=1");
}

export async function updateCounsellor(id: string, formData: FormData) {
  await requireAdmin();
  const p = parse(formData);
  if ("error" in p) redirect(`/admin/counsellors/${id}?error=${p.error}`);
  try {
    await prisma.counsellor.update({ where: { id }, data: p.data! });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") redirect(`/admin/counsellors/${id}?error=duplicate`);
    throw err;
  }
  revalidatePath("/admin/counsellors");
  redirect("/admin/counsellors?saved=1");
}

export async function setCounsellorActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.counsellor.update({ where: { id }, data: { active } });
  revalidatePath("/admin/counsellors");
}
