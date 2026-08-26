"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

export async function updateCareerServicesPolicy(formData: FormData) {
  const data = {
    title: str(formData.get("title")),
    version: str(formData.get("version")),
    effectiveDate: str(formData.get("effectiveDate")),
    body: String(formData.get("body") ?? ""),
  };

  const existing = await prisma.careerServicesPolicy.findFirst();
  if (existing) {
    await prisma.careerServicesPolicy.update({ where: { id: existing.id }, data });
  } else {
    await prisma.careerServicesPolicy.create({ data });
  }

  revalidatePath("/admin/career-services-policy");
  revalidatePath("/console/career-services-policy");
}
