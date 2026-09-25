"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str, strOrNull } from "@/lib/adminParsing";
import { maybeUploadImage } from "@/lib/blob";
import { MAX_HIRING_PARTNER_TAGS } from "@/lib/domainTags";

async function data(formData: FormData) {
  const uploadedLogo = await maybeUploadImage(formData, "logoFile", "hiring-partners");
  return {
    name: str(formData.get("name")),
    logoUrl: uploadedLogo ?? strOrNull(formData.get("logoUrl")),
    tags: formData.getAll("tags").map(String).slice(0, MAX_HIRING_PARTNER_TAGS),
  };
}

export async function createHiringPartner(formData: FormData) {
  await prisma.hiringPartner.create({ data: await data(formData) });
  revalidatePath("/admin/hiring-partners");
  revalidatePath("/console");
  redirect("/admin/hiring-partners");
}

export async function updateHiringPartner(id: string, formData: FormData) {
  await prisma.hiringPartner.update({ where: { id }, data: await data(formData) });
  revalidatePath("/admin/hiring-partners");
  revalidatePath("/console");
  redirect("/admin/hiring-partners");
}

export async function deleteHiringPartner(id: string) {
  await prisma.hiringPartner.delete({ where: { id } });
  revalidatePath("/admin/hiring-partners");
  revalidatePath("/console");
}
